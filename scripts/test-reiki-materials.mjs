import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";
import { test } from "node:test";

const sourceRoot = process.env.LIGHTNESS_TEST_SOURCE_ROOT || fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(path.join(sourceRoot, "package.json"));
const ts = require("typescript");
const materialRoot = path.join(sourceRoot, "src/content/reiki-rising-fall-2026");
const materialFiles = {
  "level-two": "reiki-rising-level-two-outline-fall-2026.pdf",
  "start-here": "reiki-rising-start-here-guide.pdf",
  "certification-practice-log": "reiki-rising-certification-practice-log.pdf",
};
const allowedPaths = new Set(Object.values(materialFiles).map(filename => path.join(materialRoot, filename)));
const memberUser = { id: "synthetic-student", email: "student@example.invalid" };
const activeRow = { offer_slug: "reiki-rising-fall-2026", access_status: "active", created_at: "2026-09-01T00:00:00.000Z" };
const pdfHash = "75550577ed254b8b8dba0a46764c858ea6ec3d2aea1c7a59b76383ff8ecf6dbe";

function load(relative, dependencies, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(sourceRoot, relative), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const context = {
    exports: {}, Buffer, URL, Request, Response, Uint8Array, Date,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    console: new Proxy({}, { get() { return () => { throw new Error("Unexpected logging while serving private course materials"); }; } }),
    ...globals,
  };
  vm.runInNewContext(source, context, { filename: relative });
  return context.exports;
}
const membership = load("src/lib/member-access.ts", {
  react: { cache: fn => fn },
  "@/lib/site": { isAdminEmail: email => email === "admin@example.invalid" },
  "@/lib/supabase/server": {},
});

function harness({ user = memberUser, accessRows = [activeRow] } = {}) {
  const events = [];
  const route = load("src/app/library/reiki-rising-fall-2026/materials/[document]/route.ts", {
    "node:fs/promises": {
      async readFile(file) {
        events.push({ kind: "file-read", file });
        assert.equal(typeof file, "string");
        assert.ok(allowedPaths.has(file), `Unapproved file access: ${file}`);
        return fsPromises.readFile(file);
      },
    },
    "node:path": { default: path },
    "@/lib/member-access": {
      ...membership,
      async getCurrentUserWithAccess() { events.push({ kind: "auth" }); return { user, accessRows }; },
      canAccessReikiRisingFall2026(email, rows) { events.push({ kind: "access" }); return membership.canAccessReikiRisingFall2026(email, rows); },
    },
  }, { process: { cwd: () => sourceRoot } });
  async function get(document = "level-two", query = "", { forbidParams = false } = {}) {
    const request = new Request(`https://bethelightness.com/library/reiki-rising-fall-2026/materials/${encodeURIComponent(document)}${query}`);
    const params = { then(resolve) {
      events.push({ kind: "params" });
      assert.equal(forbidParams, false, "Denied callers must be rejected before resolving material parameters");
      return Promise.resolve(resolve({ document }));
    } };
    return route.GET(request, { params });
  }
  return { route, events, get };
}
function fileReads(h) { return h.events.filter(event => event.kind === "file-read"); }

test("anonymous material requests redirect to sign-in before resolving parameters or reading files", async () => {
  for (const document of Object.keys(materialFiles)) {
    const h = harness({ user: null, accessRows: [activeRow] });
    const response = await h.get(document, "?download=1", { forbidParams: true });
    assert.equal(response.status, 303);
    const destination = new URL(response.headers.get("location"));
    assert.equal(destination.origin, "https://bethelightness.com");
    assert.equal(destination.pathname, "/login");
    assert.equal(destination.searchParams.get("error"), "Please sign in to open your course.");
    assert.match(response.headers.get("cache-control"), /private, no-store/);
    assert.equal(response.headers.get("content-type"), null);
    assert.equal((await response.arrayBuffer()).byteLength, 0);
    assert.deepEqual(h.events.map(event => event.kind), ["auth"]);
  }
});

test("wrong cohort, inactive, revoked and missing membership cannot read any material", async () => {
  for (const accessRows of [[], [{ ...activeRow, offer_slug: "reiki-rising-spring-2026" }],
    [{ ...activeRow, access_status: "inactive" }], [{ ...activeRow, access_status: "revoked" }],
    [{ ...activeRow, access_status: "pending" }]]) {
    for (const document of Object.keys(materialFiles)) {
      const h = harness({ accessRows });
      const response = await h.get(document, "?download=1", { forbidParams: true });
      assert.equal(response.status, 303);
      assert.equal(response.headers.get("location"), "https://bethelightness.com/account");
      assert.match(response.headers.get("cache-control"), /private, no-store/);
      assert.equal((await response.arrayBuffer()).byteLength, 0);
      assert.equal(fileReads(h).length, 0);
      assert.deepEqual(h.events.map(event => event.kind), ["auth", "access"]);
    }
  }
});

for (const [document, filename] of Object.entries(materialFiles)) {
  test(`${document} opens inline and downloads the complete correct PDF only after cohort authorization`, async () => {
    const expected = await fsPromises.readFile(path.join(materialRoot, filename));
    assert.match(expected.subarray(0, 8).toString(), /^%PDF-/);
    for (const [query, disposition] of [["", "inline"], ["?download=1", "attachment"], ["?download=true", "inline"]]) {
      const h = harness();
      const response = await h.get(document, query);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type"), "application/pdf");
      assert.equal(response.headers.get("content-length"), String(expected.length));
      assert.equal(response.headers.get("content-disposition"), `${disposition}; filename="${filename}"`);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.equal(bytes.equals(expected), true, "A successful response must contain the entire intended file");
      assert.deepEqual(h.events.map(event => event.kind), ["auth", "access", "params", "file-read"]);
      assert.equal(fileReads(h)[0].file, path.join(materialRoot, filename));
      if (document === "level-two") {
        assert.equal(bytes.length <= 4_000_000, true, "The protected serverless response must stay below the deployment limit");
        assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), pdfHash, "Serve the optimized, reviewed Level II artifact");
      }
    }
  });
}

test("unknown IDs, inherited object properties and path traversal attempts return 404 without any file read", async () => {
  for (const document of ["unknown", "", "__proto__", "constructor", "toString", "hasOwnProperty",
    "../../private", "../level-two", "level-two.pdf", "%2e%2e%2fprivate", "level-two/../../private",
    "/etc/passwd", "level-two\u0000", "level-two\r\nX-Injected: value"]) {
    const h = harness();
    const response = await h.get(document, "?download=1");
    assert.equal(response.status, 404, document);
    assert.equal(await response.text(), "Not found");
    assert.equal(fileReads(h).length, 0, document);
    assert.equal(response.headers.get("content-disposition"), null);
  }
});

test("administrator preview access remains allowed through the same private material endpoint", async () => {
  const h = harness({ user: { id: "synthetic-admin", email: "admin@example.invalid" }, accessRows: [] });
  const response = await h.get("level-two", "?download=1");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-disposition"), /^attachment;/);
  assert.equal(fileReads(h).length, 1);
  assert.equal(crypto.createHash("sha256").update(Buffer.from(await response.arrayBuffer())).digest("hex"), pdfHash);
});
