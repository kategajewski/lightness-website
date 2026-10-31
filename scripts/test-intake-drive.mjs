import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(process.env.LIGHTNESS_TEST_PACKAGE_PATH || new URL("../package.json", import.meta.url));
const ts = require("typescript");
const source = ts.transpileModule(fs.readFileSync(new URL("../src/lib/intake-drive.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const token = "synthetic-access-token-never-log";
const rootId = "rootdrive000000000001";
const clientId = "clientdrive0000000001";
const fileId = "pdfdrive000000000001";
const clientKey = "a".repeat(64);
const record = { id: "742edc2b-efb6-4412-8e36-d322ed651eda", submittedAt: "2026-10-31T16:30:00.000Z", recordDigest: "b".repeat(64) };
const pdf = Buffer.from("%PDF-1.7\nSynthetic signed record copy\n%%EOF");
const folderMime = "application/vnd.google-apps.folder";

function folder(id = rootId, parentId, key = clientKey, overrides = {}) {
  return { id, mimeType: folderMime, ...(parentId ? { parents: [parentId] } : {}), appProperties: { lightnessArchive: "client-intakes-v1", lightnessKind: parentId ? "client" : "root", ...(parentId ? { lightnessClientKey: key } : {}) }, trashed: false, shared: false, ownedByMe: true, ...overrides };
}
function archived(overrides = {}) {
  return { id: fileId, mimeType: "application/pdf", parents: [clientId], appProperties: { lightnessArchive: "client-intakes-v1", lightnessKind: "signed-intake", lightnessClientKey: clientKey, lightnessIntakeId: record.id, lightnessRecordDigest: record.recordDigest }, trashed: false, shared: false, ownedByMe: true, ...overrides };
}
function response(value, status = 200, headers) {
  return new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json", ...headers } });
}
function harness(steps) {
  const requests = [];
  const context = {
    exports: {}, Buffer, Uint8Array, URLSearchParams, AbortSignal,
    require(name) {
      if (name === "server-only") return {};
      if (name === "node:crypto") return require(name);
      throw new Error(`Unexpected module ${name}`);
    },
    async fetch(url, init) {
      requests.push({ url, init });
      const step = steps.shift();
      assert.ok(step, "Unexpected HTTP operation");
      assert.equal(new URL(url).hostname, "www.googleapis.com");
      assert.equal(init.headers.Authorization, `Bearer ${token}`);
      assert.equal(init.redirect, "error");
      assert.equal(init.cache, "no-store");
      assert.ok(init.signal instanceof AbortSignal);
      assert.equal(String(url).includes(token), false);
      return typeof step === "function" ? step(url, init) : step;
    },
  };
  vm.runInNewContext(source, context, { filename: "intake-drive.ts" });
  return { module: context.exports, requests, remaining: () => steps.length };
}
function uploadArgs(overrides = {}) {
  return { record, pdf, accessToken: token, archiveFolderId: rootId, clientFolderId: clientId, clientKey, fileId, ...overrides };
}
function roots() { return [response(folder()), response(folder(clientId, rootId))]; }
function errorIs(code, retryable) {
  return error => error.name === "IntakeDriveError" && error.code === code && (retryable === undefined || error.retryable === retryable);
}

test("Drive ID allocation only reads generateIds and returns one validated persistent candidate", async () => {
  const h = harness([(url, init) => {
    const u = new URL(url);
    assert.equal(u.pathname, "/drive/v3/files/generateIds");
    assert.equal(u.searchParams.get("count"), "1");
    assert.equal(u.searchParams.get("space"), "drive");
    assert.equal(init.method, undefined);
    assert.equal(init.body, undefined);
    return response({ ids: [fileId] });
  }]);
  assert.equal(await h.module.generateDriveId(token), fileId);
  assert.equal(h.remaining(), 0);
});

test("root folder creation uses the caller's saved ID with no sharing or ownership mutations", async () => {
  const h = harness([(url, init) => {
    assert.equal(new URL(url).pathname, "/drive/v3/files");
    assert.equal(init.method, "POST");
    const metadata = JSON.parse(init.body);
    assert.equal(metadata.id, rootId);
    assert.equal(metadata.name, "Client Intakes");
    assert.equal(metadata.mimeType, folderMime);
    assert.equal(metadata.parents, undefined);
    assert.deepEqual(Object.keys(metadata).sort(), ["appProperties", "id", "mimeType", "name"]);
    return response(folder());
  }]);
  const result = await h.module.ensureDriveFolder({ accessToken: token, folderId: rootId, name: "Client\n Intakes" });
  assert.equal(result.id, rootId);
  assert.equal(result.created, true);
});

test("client folder creation first verifies a private archive root and sends an opaque identity key", async () => {
  const h = harness([response(folder()), (url, init) => {
    const metadata = JSON.parse(init.body);
    assert.equal(metadata.id, clientId);
    assert.equal(metadata.name, "Zoë O’Reilly");
    assert.deepEqual(metadata.parents, [rootId]);
    assert.equal(metadata.appProperties.lightnessClientKey, clientKey);
    assert.equal(metadata.appProperties.lightnessKind, "client");
    return response(folder(clientId, rootId));
  }]);
  const result = await h.module.ensureDriveFolder({ accessToken: token, folderId: clientId, name: "Zoë O’Reilly", parentId: rootId, clientKey });
  assert.equal(result.created, true);
  assert.equal(h.requests[0].init.method, undefined);
});

test("folder retry after a successful-but-uncertain create reuses ID and verifies the existing folder", async () => {
  const h = harness([response(folder()), response({}, 409), response(folder(clientId, rootId))]);
  const result = await h.module.ensureDriveFolder({ accessToken: token, folderId: clientId, name: "Client name", parentId: rootId, clientKey });
  assert.equal(result.created, false);
  assert.equal(h.requests.filter(r => r.init.method === "POST").length, 1);
  assert.equal(new URL(h.requests.at(-1).url).pathname, `/drive/v3/files/${clientId}`);
});

for (const [label, change] of [
  ["shared archive", { shared: true }], ["different owner", { ownedByMe: false }],
  ["trashed archive", { trashed: true }], ["shared drive", { driveId: "unexpected-drive" }],
  ["shortcut", { mimeType: "application/vnd.google-apps.shortcut" }],
]) {
  test(`${label} blocks client-folder creation before any write`, async () => {
    const h = harness([response(folder(rootId, undefined, clientKey, change))]);
    await assert.rejects(() => h.module.ensureDriveFolder({ accessToken: token, folderId: clientId, name: "Client", parentId: rootId, clientKey }), errorIs("unsafe_destination"));
    assert.equal(h.requests.length, 1);
  });
}

test("wrong client key on an existing folder is a hard conflict instead of reusing or overwriting it", async () => {
  const h = harness([response(folder()), response({}, 409), response(folder(clientId, rootId, "c".repeat(64)))]);
  await assert.rejects(() => h.module.ensureDriveFolder({ accessToken: token, folderId: clientId, name: "Client", parentId: rootId, clientKey }), errorIs("conflict", false));
  assert.equal(h.requests.length, 3);
});

test("PDF upload is multipart with a persisted ID, original digest and correct private client parent", async () => {
  const h = harness([...roots(), (url, init) => {
    assert.equal(new URL(url).pathname, "/upload/drive/v3/files");
    assert.equal(new URL(url).searchParams.get("uploadType"), "multipart");
    assert.equal(init.method, "POST");
    assert.match(init.headers["Content-Type"], /^multipart\/related; boundary=lightness-intake-/);
    const raw = Buffer.from(init.body).toString();
    const metadata = JSON.parse(raw.split("\r\n\r\n")[1].split("\r\n--")[0]);
    assert.equal(metadata.id, fileId);
    assert.deepEqual(metadata.parents, [clientId]);
    assert.equal(metadata.mimeType, "application/pdf");
    assert.equal(metadata.appProperties.lightnessIntakeId, record.id);
    assert.equal(metadata.appProperties.lightnessRecordDigest, record.recordDigest);
    assert.equal(metadata.name, `Signed intake 2026-10-31 ${record.id}.pdf`);
    assert.ok(raw.includes(pdf.toString()));
    assert.equal(metadata.permissions, undefined);
    assert.equal(metadata.description, undefined);
    return response(archived());
  }]);
  const result = await h.module.archiveIntakeToDrive(uploadArgs());
  assert.equal(result.id, fileId);
  assert.equal(result.created, true);
  assert.equal(h.remaining(), 0);
});

test("PDF create409 verifies the exact saved file instead of generating a second copy", async () => {
  const h = harness([...roots(), response({}, 409), response(archived())]);
  const result = await h.module.archiveIntakeToDrive(uploadArgs());
  assert.equal(result.created, false);
  assert.equal(h.requests.filter(r => r.init.method === "POST").length, 1);
  assert.equal(new URL(h.requests.at(-1).url).pathname, `/drive/v3/files/${fileId}`);
});

for (const [label, change, code] of [
  ["wrong parent", { parents: [rootId] }, "unsafe_destination"],
  ["non-PDF", { mimeType: "text/plain" }, "unsafe_destination"],
  ["public file", { shared: true }, "unsafe_destination"],
  ["trashed file", { trashed: true }, "unsafe_destination"],
  ["different signed record", { appProperties: { ...archived().appProperties, lightnessRecordDigest: "c".repeat(64) } }, "conflict"],
  ["different intake UUID", { appProperties: { ...archived().appProperties, lightnessIntakeId: "9ad0af2b-0394-461a-ab14-83b3e44d75c5" } }, "conflict"],
]) {
  test(`PDF retry refuses ${label} without overwrite`, async () => {
    const h = harness([...roots(), response({}, 409), response(archived(change))]);
    await assert.rejects(() => h.module.archiveIntakeToDrive(uploadArgs()), errorIs(code, false));
    assert.equal(h.requests.filter(r => r.init.method === "POST").length, 1);
    assert.equal(h.remaining(), 0);
  });
}

test("wrong client destination blocks the PDF before uploading private answers", async () => {
  const h = harness([response(folder()), response(folder(clientId, rootId, "d".repeat(64)))]);
  await assert.rejects(() => h.module.archiveIntakeToDrive(uploadArgs()), errorIs("conflict"));
  assert.equal(h.requests.some(r => r.init.method === "POST"), false);
});

for (const [status, reason, code, retryable] of [
  [401, "authError", "authorization", false], [403, "insufficientFilePermissions", "permission", false],
  [403, "storageQuotaExceeded", "quota", false], [403, "userRateLimitExceeded", "rate_limit", true],
  [429, "rateLimitExceeded", "rate_limit", true], [503, "backendError", "remote_error", true],
]) {
  test(`HTTP${status}/${reason} exposes only a bounded safe classification`, async () => {
    const privateProviderDetail = `private answer and ${token}`;
    const h = harness([response({ error: { message: privateProviderDetail, errors: [{ reason, message: privateProviderDetail }] } }, status, { "Retry-After": "60" })]);
    await assert.rejects(() => h.module.generateDriveId(token), error => {
      assert.equal(error.code, code);
      assert.equal(error.status, status);
      assert.equal(error.retryable, retryable);
      assert.equal(error.retryAfterSeconds, 60);
      assert.equal(String(error).includes(privateProviderDetail), false);
      assert.equal(JSON.stringify(error).includes(token), false);
      assert.equal(error.cause, undefined);
      return true;
    });
  });
}

test("timeout/network failure is retryable without preserving a raw provider exception", async () => {
  const h = harness([() => { throw new Error(`request ${token} and private PDF bytes`); }]);
  await assert.rejects(() => h.module.generateDriveId(token), error => {
    assert.equal(error.code, "network");
    assert.equal(error.retryable, true);
    assert.equal(String(error).includes(token), false);
    assert.equal(error.cause, undefined);
    return true;
  });
});

test("malformed success responses are never accepted as a completed archive", async () => {
  const h = harness([response({ ids: ["../../unsafe"] })]);
  await assert.rejects(() => h.module.generateDriveId(token), errorIs("malformed_response", true));
  const bad = harness([...roots(), response({ id: fileId })]);
  await assert.rejects(() => bad.module.archiveIntakeToDrive(uploadArgs()), errorIs("unsafe_destination"));
});

test("unsafe IDs, missing client identity and invalid PDF inputs fail before any network call", async () => {
  for (const values of [{ fileId: "../../bad" }, { clientKey: "" }, { fileId: clientId }, { pdf: Buffer.from("not a pdf") }, { record: { ...record, recordDigest: "bad" } }, { record: { ...record, submittedAt: "invalid" } }]) {
    const h = harness([]);
    await assert.rejects(() => h.module.archiveIntakeToDrive(uploadArgs(values)), errorIs("invalid_input"));
    assert.equal(h.requests.length, 0);
  }
});
