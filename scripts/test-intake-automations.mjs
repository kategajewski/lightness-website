import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

const encryptionKey = Buffer.alloc(32, 7).toString("base64");
const accessToken = "synthetic-oauth-access-never-log";
const refreshToken = "synthetic-oauth-refresh-never-log";
const defaultId = "742edc2b-efb6-4412-8e36-d322ed651eda";
const production = { INTAKE_AUTOMATIONS_ENABLED: "1", VERCEL_ENV: "production", INTAKE_ENCRYPTION_KEY: encryptionKey };

function load(file, dependencies = {}, globals = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = {
    exports: {}, Buffer, Uint8Array, URL, Request, Response,
    process: { env: { ...production } },
    console: { error() { throw new Error("Unexpected automation logging"); } },
    require(name) {
      if (name === "server-only") return {};
      if (name === "node:crypto") return crypto;
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    ...globals,
  };
  vm.runInNewContext(compiled, context, { filename: file });
  return context.exports;
}

function storeHarness(options = {}) {
  const objects = new Map();
  const calls = [];
  let tick = 0;
  const timestamp = () => new Date(Date.UTC(2026, 9, 31, 16, 0, tick++)).toISOString();
  const cipher = load("../src/lib/intake-crypto.ts");
  const client = {
    storage: { from(bucket) {
      assert.equal(bucket, "client-intakes");
      return {
        async upload(path, bytes, settings) {
          calls.push({ operation: "upload", path, upsert: settings.upsert });
          const forced = options.uploadError?.(path, settings);
          if (forced) return { error: forced };
          const previous = objects.get(path);
          if (previous && !settings.upsert) return { error: { statusCode: "409", message: "The resource already exists" } };
          objects.set(path, { bytes: Buffer.from(bytes), created_at: previous?.created_at || timestamp(), updated_at: timestamp() });
          return { error: null };
        },
        async download(path) {
          calls.push({ operation: "download", path });
          const stored = objects.get(path);
          return stored ? { data: { async text() { return stored.bytes.toString(); } }, error: null } : { data: null, error: { statusCode: "404", message: "Object not found" } };
        },
        async list(prefix, settings) {
          calls.push({ operation: "list", prefix, settings });
          assert.equal(settings.sortBy.column, "updated_at");
          assert.equal(settings.sortBy.order, "asc");
          const data = [...objects].filter(([path]) => path.startsWith(prefix + "/") && !path.slice(prefix.length + 1).includes("/"))
            .map(([path, value]) => ({ name: path.slice(prefix.length + 1), ...value }))
            .sort((a, b) => a.updated_at.localeCompare(b.updated_at))
            .slice(settings.offset || 0, (settings.offset || 0) + settings.limit)
            .map(({ name, created_at, updated_at }) => ({ name, created_at, updated_at }));
          return { data, error: null };
        },
        async remove(paths) {
          calls.push({ operation: "remove", paths });
          for (const path of paths) objects.delete(path);
          return { error: null };
        },
      };
    } },
  };
  const loaded = load("../src/lib/intake-automation-store.ts", {
    "@/lib/supabase/admin": { createSupabaseAdminClient: () => client },
    "@/lib/intake-storage": { INTAKE_BUCKET: "client-intakes" },
    "@/lib/intake-crypto": cipher,
  });
  return { module: loaded, objects, calls, cipher };
}

function signedRecord(overrides = {}) {
  return {
    id: defaultId, submittedAt: "2026-10-31T16:30:00.000Z", formVersion: "synthetic-signed-v1", formType: "reiki",
    answers: { fullName: "Synthetic Private Client", phone: "555 010 1234", email: "client@example.invalid", newsletterConsent: true, intentions: "Synthetic private intention, never in marketing or logs", signatureName: "Synthetic Private Client" },
    consent: { paragraphs: ["Original signed consent snapshot"], privacyNotice: "Private", remoteSessionStatement: "Original arrangements", electronicSignatureStatement: "Typed-name consent" },
    signature: { name: "Synthetic Private Client", method: "typed-name", date: "2026-10-31", recordedAt: "2026-10-31T16:30:00.000Z" },
    requestDigest: "a".repeat(64), recordDigest: "b".repeat(64), ...overrides,
  };
}

function pipelineHarness(options = {}) {
  const storage = storeHarness(options);
  const records = new Map();
  const mailchimp = [], archives = [], folders = [], pdfs = [], lookups = [], generated = [], authCalls = [];
  let serial = 0;
  const connection = { email: "owner@example.invalid", refreshToken, clientId: "synthetic-client-id" };
  const loaded = load("../src/lib/intake-automations.ts", {
    "@/lib/intake-storage": { async getSignedIntake(id) { lookups.push(id); return records.get(id) || null; } },
    "@/lib/intake-automation-store": storage.module,
    "@/lib/intake-drive-auth": {
      async getIntakeDriveConnection() { authCalls.push("connection"); return options.noConnection ? null : connection; },
      async getIntakeDriveAccessToken() { authCalls.push("token"); return accessToken; },
      driveConnectionKey() { return "f".repeat(64); },
    },
    "@/lib/intake-drive": {
      async generateDriveId(token) { assert.equal(token, accessToken); const id = `generateddrive${String(++serial).padStart(10, "0")}`; generated.push(id); return id; },
      async ensureDriveFolder(input) {
        if (options.folderError?.(input, folders.length + 1)) throw new Error("Synthetic private folder verification failed");
        if (input.name.length > 160) throw new Error("Synthetic Drive folder label is too long");
        if (!input.parentId) {
          const allocation = await storage.module.readAutomationValue(`ids/root-${"f".repeat(64)}`);
          assert.equal(allocation?.id, input.folderId, "Root ID must be durably reserved before any folder create");
        }
        folders.push(input);
      },
      async archiveIntakeToDrive(input) { archives.push(input); if (options.driveError?.(input, archives.length)) throw new Error(`Provider secret ${refreshToken} and ${input.record.answers.intentions}`); return { id: input.fileId, created: true }; },
    },
    "@/lib/intake-pdf": { async createSignedIntakePdf(record) { pdfs.push(record); return Buffer.from("%PDF-1.7 synthetic private signed copy"); } },
    "@/lib/intake-mailchimp": { async syncIntakeNewsletterToMailchimp(input) { mailchimp.push(input); if (options.mailchimpError?.(input, mailchimp.length)) throw new Error(`Provider secret ${accessToken} and private answer`); return options.mailchimpResult || (input.newsletterConsent ? { outcome: "synced", status: "subscribed" } : { outcome: "not-requested" }); } },
  }, { process: { env: { ...production, ...options.env } } });
  return { module: loaded, storage, records, mailchimp, archives, folders, pdfs, lookups, generated, authCalls };
}

async function queueRecord(h, record = signedRecord()) {
  await h.module.enqueueIntakeAutomations(record.id);
  h.records.set(record.id, record);
  return record;
}

function routeHarness(h, options = {}) {
  const afters = [], notifications = [], events = [], logs = [];
  const normalized = { submissionId: defaultId, website: "", startedAt: Date.now() - 5_000 };
  class IntakeConflictError extends Error {}
  const route = load("../src/app/api/client-intake/reiki/route.ts", {
    "next/server": { after(fn) { afters.push(fn); }, NextResponse: { json(value, settings) { return new Response(JSON.stringify(value), settings); } } },
    "@/lib/env": { env: { siteUrl: "https://bethelightness.com" } },
    "@/lib/reiki-intake": { validateReikiIntake() { return { success: true, data: normalized }; } },
    "@/lib/intake-storage": { IntakeConflictError, intakeStorageConfigured: () => true, async saveSignedReikiIntake() {
      events.push("signed-write");
      assert.ok(h.storage.objects.has(`automation/jobs/${defaultId}.json`), "Durable queue pointer must exist before signed write");
      if (options.saveError) throw new Error("Synthetic signed persistence failure");
      h.records.set(defaultId, signedRecord());
      return { id: defaultId, submittedAt: signedRecord().submittedAt, duplicate: Boolean(options.duplicate) };
    } },
    "@/lib/email": { async sendClientIntakeOwnerNotification(value) { notifications.push(value); } },
    "@/lib/intake-automations": { async enqueueIntakeAutomations(id) { events.push("enqueue"); return h.module.enqueueIntakeAutomations(id); }, processIntakeAutomations: h.module.processIntakeAutomations },
  }, { console: { error(message) { logs.push(message); } } });
  return {
    async submit() { return route.POST(new Request("https://bethelightness.com/api/client-intake/reiki", { method: "POST", headers: { Origin: "https://bethelightness.com", "Content-Type": "application/json" }, body: JSON.stringify({ synthetic: true }) })); },
    afters, notifications, events, logs,
  };
}

test("Drive initialization reserves and verifies the private root without reading any intake or contacting Mailchimp", async () => {
  const h = pipelineHarness();
  const result = await h.module.initializeIntakeDriveArchive();
  assert.equal(result.destination, "f".repeat(64));
  assert.equal(result.rootId, h.generated[0]);
  assert.equal(h.folders.length, 1);
  assert.equal(h.folders[0].name, "Client Intake Records");
  assert.equal(h.folders[0].parentId, undefined);
  assert.deepEqual(h.authCalls, ["connection", "token"]);
  assert.equal(h.lookups.length + h.mailchimp.length + h.pdfs.length + h.archives.length, 0);
  assert.equal([...h.storage.objects.keys()].some(key => key.includes("/jobs/") || key.includes("/done/")), false);
});

test("repeat initialization and subsequent client processing reuse the exact reserved root", async () => {
  const h = pipelineHarness();
  const first = await h.module.initializeIntakeDriveArchive();
  const allocationPath = `automation/ids/root-${first.destination}.json`;
  const originalAllocation = h.storage.objects.get(allocationPath).bytes.toString();
  const second = await h.module.initializeIntakeDriveArchive();
  assert.equal(second.rootId, first.rootId);
  assert.equal(h.generated.length, 1);
  await queueRecord(h);
  assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, true);
  assert.equal(h.archives[0].archiveFolderId, first.rootId);
  assert.equal(new Set(h.folders.filter(folder => !folder.parentId).map(folder => folder.folderId)).size, 1);
  assert.equal(h.storage.objects.get(allocationPath).bytes.toString(), originalAllocation);
});

test("initialization without an owner connection fails generically before token or Drive operations", async () => {
  const h = pipelineHarness({ noConnection: true });
  await assert.rejects(() => h.module.initializeIntakeDriveArchive(), /^Error: Google Drive is not connected\.$/);
  assert.deepEqual(h.authCalls, ["connection"]);
  assert.equal(h.generated.length + h.folders.length + h.lookups.length + h.mailchimp.length, 0);
});

test("failed root verification does not report initialization ready or allocate another root on retry", async () => {
  let fail = true;
  const h = pipelineHarness({ folderError: () => fail });
  await assert.rejects(() => h.module.initializeIntakeDriveArchive(), /folder verification failed/);
  assert.equal(h.generated.length, 1);
  assert.equal(h.lookups.length + h.mailchimp.length, 0);
  fail = false;
  const result = await h.module.initializeIntakeDriveArchive();
  assert.equal(result.rootId, h.generated[0]);
  assert.equal(h.generated.length, 1);
});

for (const environment of ["preview", "development", ""]) {
  test(`initialization rejects ${environment || "missing"} deployment environment before any provider access`, async () => {
    const h = pipelineHarness({ env: { VERCEL_ENV: environment } });
    await assert.rejects(() => h.module.initializeIntakeDriveArchive(), /initialization is unavailable/);
    assert.equal(h.authCalls.length + h.storage.calls.length + h.generated.length + h.lookups.length + h.mailchimp.length, 0);
  });
}

test("validated route durably reserves a job before signed storage and schedules processing after response", async () => {
  const h = pipelineHarness(); const route = routeHarness(h);
  const response = await route.submit();
  assert.equal(response.status, 201);
  assert.deepEqual(route.events, ["enqueue", "signed-write"]);
  assert.equal(route.afters.length, 1);
  assert.equal(h.archives.length, 0);
  assert.equal(route.notifications.length, 1);
  await route.afters[0]();
  assert.equal(h.archives.length, 1);
});

test("queue persistence failure prevents an untracked signed write", async () => {
  const h = pipelineHarness({ uploadError: path => path.startsWith("automation/jobs/") ? { statusCode: "503", message: "Synthetic storage error" } : null });
  const route = routeHarness(h); const response = await route.submit();
  assert.equal(response.status, 503);
  assert.deepEqual(route.events, ["enqueue"]);
  assert.equal(route.afters.length, 0);
  assert.equal(route.notifications.length, 0);
});

test("failed signed write retains its prewrite pointer and never acknowledges an absent signed record", async () => {
  const h = pipelineHarness(); const route = routeHarness(h, { saveError: true });
  assert.equal((await route.submit()).status, 503);
  const jobPath = `automation/jobs/${defaultId}.json`;
  const before = h.storage.objects.get(jobPath).updated_at;
  const result = await h.module.processIntakeAutomations(defaultId);
  assert.equal(result.complete, false);
  assert.ok(h.storage.objects.has(jobPath));
  assert.ok(h.storage.objects.get(jobPath).updated_at > before);
  assert.equal(h.mailchimp.length + h.archives.length, 0);
  assert.equal(h.storage.calls.some(c => c.operation === "remove"), false);
});

test("matching client retry requeues processing without repeating the owner notification", async () => {
  const h = pipelineHarness(); const route = routeHarness(h, { duplicate: true });
  assert.equal((await route.submit()).status, 200);
  assert.equal(route.afters.length, 1);
  assert.equal(route.notifications.length, 0);
  await route.afters[0]();
  assert.equal(h.archives.length, 1);
});

test("overlapping immutable reservations return one stored winner and leave ciphertext unchanged", async () => {
  const h = storeHarness(); const key = "ids/overlap";
  const values = await Promise.all(Array.from({ length: 12 }, (_, n) => h.module.reserveAutomationValue(key, { id: `candidate-${n}`, identity: "same-logical-item" })));
  assert.equal(new Set(values.map(v => v.id)).size, 1);
  const bytes = h.objects.get("automation/ids/overlap.json").bytes.toString();
  await h.module.reserveAutomationValue(key, { id: "different-later-candidate", identity: "same-logical-item" });
  assert.equal(h.objects.get("automation/ids/overlap.json").bytes.toString(), bytes);
  assert.equal(bytes.includes("candidate"), false);
});

test("overlapping processors reuse exactly one persisted root, client folder and PDF ID", async () => {
  const h = pipelineHarness(); await queueRecord(h);
  await Promise.all([h.module.processIntakeAutomations(defaultId), h.module.processIntakeAutomations(defaultId)]);
  assert.ok(h.archives.length >= 1);
  assert.equal(new Set(h.archives.map(x => x.archiveFolderId)).size, 1);
  assert.equal(new Set(h.archives.map(x => x.clientFolderId)).size, 1);
  assert.equal(new Set(h.archives.map(x => x.fileId)).size, 1);
  assert.equal(new Set(h.archives.map(x => x.clientKey)).size, 1);
  assert.equal((await h.storage.module.readAutomationValue(`done/${defaultId}-drive`)).fileId, h.archives[0].fileId);
});

test("Mailchimp failure leaves Drive complete and retries only Mailchimp next time", async () => {
  const h = pipelineHarness({ mailchimpError: (_input, attempt) => attempt === 1 }); await queueRecord(h);
  assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, false);
  assert.equal(h.archives.length, 1);
  assert.equal((await h.storage.module.readAutomationValue(`done/${defaultId}-drive`)).outcome, "archived");
  assert.equal(await h.storage.module.readAutomationValue(`done/${defaultId}-mailchimp`), null);
  assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, true);
  assert.equal(h.archives.length, 1);
  assert.equal(h.mailchimp.length, 2);
});

test("Drive failure leaves Mailchimp complete and retries only the same Drive ID next time", async () => {
  const h = pipelineHarness({ driveError: (_input, attempt) => attempt === 1 }); await queueRecord(h);
  assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, false);
  assert.equal((await h.storage.module.readAutomationValue(`done/${defaultId}-mailchimp`)).outcome, "member-subscribed");
  assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, true);
  assert.equal(h.mailchimp.length, 1);
  assert.equal(h.archives.length, 2);
  assert.equal(h.archives[0].fileId, h.archives[1].fileId);
});

test("failed status bookkeeping cannot suppress the other provider", async () => {
  const h = pipelineHarness({ mailchimpError: () => true, uploadError: path => path.startsWith("automation/status/") ? { statusCode: "503", message: "Synthetic status unavailable" } : null });
  await queueRecord(h);
  assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, false);
  assert.equal(h.archives.length, 1);
  assert.ok(await h.storage.module.readAutomationValue(`done/${defaultId}-drive`));
});

test("unconfigured providers stay independently pending without making false completion receipts", async () => {
  const h = pipelineHarness({ noConnection: true, mailchimpResult: { outcome: "not-configured" } }); await queueRecord(h);
  assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, false);
  assert.equal(await h.storage.module.readAutomationValue(`done/${defaultId}-drive`), null);
  assert.equal(await h.storage.module.readAutomationValue(`done/${defaultId}-mailchimp`), null);
  assert.equal((await h.storage.module.readAutomationValue(`status/${defaultId}-drive`)).code, "connection-needed");
  assert.equal((await h.storage.module.readAutomationValue(`status/${defaultId}-mailchimp`)).code, "connection-needed");
  assert.equal(h.archives.length, 0);
});

test("no opt-in completes as not-requested and does not block PDF archival", async () => {
  const h = pipelineHarness(); const record = signedRecord(); record.answers.newsletterConsent = false; record.answers.email = "";
  await queueRecord(h, record);
  assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, true);
  assert.equal((await h.storage.module.readAutomationValue(`done/${defaultId}-mailchimp`)).outcome, "not-requested");
  assert.equal(h.archives.length, 1);
});

test("completed providers are never repeated even when a stale pointer or client retry reappears", async () => {
  const h = pipelineHarness(); await queueRecord(h);
  assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, true);
  const driveBytes = h.storage.objects.get(`automation/done/${defaultId}-drive.json`).bytes.toString();
  const mcBytes = h.storage.objects.get(`automation/done/${defaultId}-mailchimp.json`).bytes.toString();
  await h.module.enqueueIntakeAutomations(defaultId);
  assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, true);
  assert.equal(h.archives.length, 1);
  assert.equal(h.mailchimp.length, 1);
  assert.equal(h.storage.objects.get(`automation/done/${defaultId}-drive.json`).bytes.toString(), driveBytes);
  assert.equal(h.storage.objects.get(`automation/done/${defaultId}-mailchimp.json`).bytes.toString(), mcBytes);
});

test("a prior completion digest mismatch is rejected without overwriting signed delivery evidence", async () => {
  const h = pipelineHarness(); await queueRecord(h);
  await h.module.processIntakeAutomations(defaultId);
  const original = h.storage.objects.get(`automation/done/${defaultId}-drive.json`).bytes.toString();
  h.records.set(defaultId, signedRecord({ recordDigest: "c".repeat(64) }));
  await h.module.enqueueIntakeAutomations(defaultId);
  await assert.rejects(() => h.module.processIntakeAutomations(defaultId), /does not match its delivery receipt/);
  assert.equal(h.storage.objects.get(`automation/done/${defaultId}-drive.json`).bytes.toString(), original);
  assert.equal(h.mailchimp.length, 1);
  assert.equal(h.archives.length, 1);
  assert.ok(h.storage.objects.has(`automation/jobs/${defaultId}.json`));
});

for (const env of [{ VERCEL_ENV: "preview" }, { VERCEL_ENV: "development" }, { INTAKE_AUTOMATIONS_ENABLED: "0" }, { INTAKE_AUTOMATIONS_ENABLED: "" }]) {
  test(`disabled environment ${JSON.stringify(env)} cannot enqueue or export signed records`, async () => {
    const h = pipelineHarness({ env }); h.records.set(defaultId, signedRecord());
    assert.equal(await h.module.enqueueIntakeAutomations(defaultId), false);
    assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, false);
    const result = await h.module.processPendingIntakeAutomations();
    assert.equal(result.processed, 0);
    assert.equal(result.completed, 0);
    assert.equal(h.storage.calls.length + h.archives.length + h.mailchimp.length, 0);
  });
}

test("more than20 missing older prewrites rotate behind newer signed jobs across runs", async () => {
  const h = pipelineHarness();
  const missing = Array.from({ length: 25 }, () => crypto.randomUUID());
  for (const id of missing) await h.module.enqueueIntakeAutomations(id);
  await queueRecord(h);
  const first = await h.module.processPendingIntakeAutomations();
  assert.equal(first.processed, 20);
  assert.equal(first.completed, 0);
  assert.equal(h.archives.length, 0);
  const second = await h.module.processPendingIntakeAutomations();
  assert.equal(second.processed, 20);
  assert.equal(second.completed, 1);
  assert.equal(h.archives.length, 1);
  assert.ok(h.lookups.includes(defaultId));
  for (const id of missing) assert.ok(h.storage.objects.has(`automation/jobs/${id}.json`));
  assert.equal(h.storage.objects.has(`automation/jobs/${defaultId}.json`), false);
});

test("only the guardian marketing identity crosses to Mailchimp and no token or answers enter operational receipts", async () => {
  const h = pipelineHarness({ mailchimpError: () => true });
  const record = signedRecord({ formType: "childrens-reiki" }); record.answers.childName = "Synthetic Private Child";
  await queueRecord(h, record);
  await h.module.processIntakeAutomations(defaultId);
  assert.deepEqual(Object.keys(h.mailchimp[0]).sort(), ["email", "name", "newsletterConsent"]);
  assert.equal(h.mailchimp[0].name, record.answers.fullName);
  assert.equal(JSON.stringify(h.mailchimp).includes(record.answers.childName), false);
  assert.equal(JSON.stringify(h.mailchimp).includes(record.answers.intentions), false);
  assert.equal(h.pdfs[0], record);
  const status = await h.storage.module.readAutomationValue(`status/${defaultId}-mailchimp`);
  assert.deepEqual(Object.keys(status).sort(), ["checkedAt", "code"]);
  const operational = [];
  for (const path of h.storage.objects.keys()) {
    assert.equal(path.includes(record.answers.fullName), false);
    const key = path.slice("automation/".length, -".json".length);
    operational.push(await h.storage.module.readAutomationValue(key));
  }
  const serialized = JSON.stringify(operational);
  for (const secret of [accessToken, refreshToken, record.answers.fullName, record.answers.phone, record.answers.email, record.answers.childName, record.answers.intentions]) assert.equal(serialized.includes(secret), false, secret);
});

for (const [label, fullName, childName] of [
  ["maximum-length child and guardian", "🧑".repeat(75), "孩".repeat(150)],
  ["surrogate pair at the truncation boundary", "Å".repeat(146) + "😀ZZ", "A"],
  ["maximum-length adult Unicode name", "🧑".repeat(75), undefined],
]) {
  test(`${label} archives with a bounded display label and the original identity`, async () => {
    assert.equal(fullName.length, 150);
    const h = pipelineHarness();
    const record = signedRecord({ formType: childName ? "childrens-reiki" : "reiki" });
    record.answers.fullName = fullName;
    if (childName) record.answers.childName = childName;
    const originalAnswers = JSON.stringify(record.answers);
    await queueRecord(h, record);
    assert.equal((await h.module.processIntakeAutomations(defaultId)).complete, true);
    const clientFolder = h.folders.find(folder => folder.parentId);
    const fullLabel = childName ? `${childName} (guardian: ${fullName})` : fullName;
    assert.ok(clientFolder.name.length <= 160);
    assert.ok(fullLabel.startsWith(clientFolder.name));
    if (!childName) assert.equal(clientFolder.name, fullName);
    const finalUnit = clientFolder.name.charCodeAt(clientFolder.name.length - 1);
    assert.equal(finalUnit >= 0xd800 && finalUnit <= 0xdbff, false, "Display label must not end with a split surrogate pair");
    const expectedKey = crypto.createHmac("sha256", encryptionKey).update(JSON.stringify([
      fullName.normalize("NFKC").trim().toLowerCase(),
      record.answers.phone.replace(/\D/g, ""),
      childName ? childName.normalize("NFKC").trim().toLowerCase() : "",
    ])).digest("hex");
    assert.equal(clientFolder.clientKey, expectedKey);
    assert.equal(h.archives[0].clientKey, expectedKey);
    assert.equal(JSON.stringify(record.answers), originalAnswers);
    assert.equal(h.pdfs[0], record);
  });
}
