import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

function load(file, dependencies = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const context = {
    exports: {}, Buffer, URL, Request, Response, Uint8Array,
    console: { error() { throw new Error("Unexpected logging during intake test"); } },
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
      return dependencies[name];
    },
    ...globals,
  };
  vm.runInNewContext(source, context, { filename: file });
  return context.exports;
}

const intake = load("../src/lib/hypnotherapy-intake.ts");
const reiki = load("../src/lib/reiki-intake.ts");
const id = "e62d16ea-46e5-417f-b145-c8a70634be55";

function input(overrides = {}) {
  return {
    submissionId: id,
    formVersion: intake.HYPNOTHERAPY_FORM_VERSION,
    fullName: "Synthetic Client",
    preferredName: "",
    email: "client@example.invalid",
    phone: "555 010 1234",
    address: "",
    maritalStatus: "",
    occupation: "",
    previousHypnotherapy: "",
    previousTherapy: "",
    goals: "Synthetic private answer for testing only.",
    previousEfforts: "",
    medicalConditions: "",
    newsletterConsent: false,
    remoteReadiness: true,
    consentAccepted: true,
    signatureName: "Synthetic Client",
    signatureDate: "2026-10-28",
    website: "",
    startedAt: Date.now() - 10000,
    ...overrides,
  };
}

function reikiInput(overrides = {}) {
  return {
    submissionId: id,
    formVersion: reiki.REIKI_FORM_VERSION,
    fullName: "Synthetic Reiki Client",
    email: "",
    phone: "555 010 1234",
    intentions: "SYNTHETIC PRIVATE REIKI INTENTIONS",
    referralSource: "Synthetic referral",
    previousReiki: "No previous Reiki experience.",
    newsletterConsent: false,
    remoteReadiness: true,
    consentAccepted: true,
    signatureName: "Synthetic Reiki Client",
    signatureDate: "2026-10-31",
    website: "",
    startedAt: Date.now() - 10000,
    ...overrides,
  };
}

function cryptography() {
  const environment = { INTAKE_ENCRYPTION_KEY: crypto.randomBytes(32).toString("base64") };
  const loadedModule = load("../src/lib/intake-crypto.ts", {
    "server-only": {}, "node:crypto": crypto,
  }, { process: { env: environment } });
  return { module: loadedModule, environment };
}

function storageHarness() {
  const encrypted = cryptography();
  const objects = new Map();
  const uploads = [];
  const downloads = [];
  let available = true;
  let downloadError = null;
  const bucket = {
    async upload(path, body, options) {
      uploads.push({ path, options, body: Buffer.from(body) });
      if (objects.has(path)) return { error: { statusCode: "409", message: "The resource already exists" } };
      objects.set(path, Buffer.from(body));
      return { error: null };
    },
    async download(path) {
      downloads.push(path);
      if (downloadError) return { error: downloadError, data: null };
      if (!objects.has(path)) return { error: { statusCode: "404", message: "Object not found" }, data: null };
      return { error: null, data: { async text() { return objects.get(path).toString("utf8"); } } };
    },
    async list() {
      return { error: null, data: [...objects.keys()].map(name => ({ name })) };
    },
  };
  const loadedModule = load("../src/lib/intake-storage.ts", {
    "server-only": {},
    "@/lib/supabase/admin": { createSupabaseAdminClient() {
      return { storage: { from(name) { assert.equal(name, "client-intakes"); return bucket; } } };
    } },
    "@/lib/env": { integrations: { get supabase() { return available; } } },
    "@/lib/intake-crypto": encrypted.module,
    "@/lib/hypnotherapy-intake": intake,
    "@/lib/reiki-intake": reiki,
  });
  return { module: loadedModule, objects, uploads, downloads, crypto: encrypted.module, environment: encrypted.environment,
    setAvailable(value) { available = value; },
    setDownloadError(value) { downloadError = value; },
  };
}

function routeHarness({ configured = true, notificationError = false, saveError = null, formType = "hypnotherapy" } = {}) {
  const isReiki = formType === "reiki";
  const saveMethod = isReiki ? "saveSignedReikiIntake" : "saveSignedIntake";
  const storage = storageHarness();
  const saves = [];
  const notifications = [];
  const logs = [];
  const loadedModule = load(`../src/app/api/client-intake/${formType}/route.ts`, {
    "node:crypto": crypto,
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/lib/env": { env: { siteUrl: "https://example.invalid" } },
    "@/lib/hypnotherapy-intake": intake,
    "@/lib/reiki-intake": reiki,
    "@/lib/intake-storage": {
      ...storage.module,
      intakeStorageConfigured: () => configured,
      async [saveMethod](value) {
        saves.push(value);
        if (saveError) throw saveError;
        return storage.module[saveMethod](value);
      },
    },
    "@/lib/email": { async sendClientIntakeOwnerNotification(value) {
      notifications.push(value);
      if (notificationError) throw new Error("Synthetic delivery error");
    } },
  }, {
    process: { env: storage.environment },
    console: { error: (...args) => logs.push(args) },
  });
  return { storage, saves, notifications, logs,
    async submit(value = isReiki ? reikiInput() : input(), { headers = {}, body, url = `https://example.invalid/api/client-intake/${formType}` } = {}) {
      return loadedModule.POST(new Request(url, {
        method: "POST",
        headers: { origin: "https://example.invalid", "content-type": "application/json", ...headers },
        body: body ?? JSON.stringify(value),
      }));
    },
  };
}

test("intake validation normalizes answers and keeps optional mailing consent explicit", () => {
  const result = intake.validateHypnotherapyIntake(input({
    fullName: "  Synthetic Client  ", email: " CLIENT@EXAMPLE.INVALID ",
    goals: "  A synthetic goal.  ", newsletterConsent: "true",
  }));
  assert.equal(result.success, true);
  assert.equal(result.data.fullName, "Synthetic Client");
  assert.equal(result.data.email, "client@example.invalid");
  assert.equal(result.data.goals, "A synthetic goal.");
  assert.equal(result.data.newsletterConsent, false);
  assert.equal(intake.validateHypnotherapyIntake(input({ newsletterConsent: true })).data.newsletterConsent, true);
});

test("intake validation rejects stale forms, missing consent, invalid dates and overlong answers", () => {
  for (const [field, value] of [
    ["submissionId", "client-supplied-path/../../secret"], ["formVersion", "old-version"],
    ["consentAccepted", false], ["remoteReadiness", "true"], ["signatureName", " "],
    ["signatureDate", "2026-02-30"], ["email", "invalid"], ["phone", "123"],
    ["goals", ""], ["medicalConditions", "x".repeat(4001)], ["fullName", { unexpected: true }],
  ]) {
    const result = intake.validateHypnotherapyIntake(input({ [field]: value }));
    assert.equal(result.success, false, field);
    assert.ok(result.errors[field], field);
  }
});

test("intake encryption binds records to their ID, detects tampering and requires the original key", () => {
  const { module: loadedModule, environment } = cryptography();
  const record = { id, private: "SYNTHETIC PRIVATE CONTENT" };
  const first = loadedModule.encryptIntake(record, id);
  const second = loadedModule.encryptIntake(record, id);
  assert.equal(JSON.stringify(first).includes(record.private), false);
  assert.notEqual(first.iv, second.iv);
  assert.equal(JSON.stringify(loadedModule.decryptIntake(first, id)), JSON.stringify(record));
  assert.throws(() => loadedModule.decryptIntake(first, crypto.randomUUID()));
  assert.throws(() => loadedModule.decryptIntake({ ...first, tag: Buffer.alloc(16).toString("base64") }, id));
  assert.throws(() => loadedModule.decryptIntake({ ...first, ciphertext: Buffer.from("modified").toString("base64") }, id));
  environment.INTAKE_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
  assert.throws(() => loadedModule.decryptIntake(first, id));
  environment.INTAKE_ENCRYPTION_KEY = "";
  assert.equal(loadedModule.intakeEncryptionConfigured(), false);
  assert.throws(() => loadedModule.encryptIntake(record, id));
});

test("signed storage writes ciphertext only and preserves consent, signature and server receipt", async () => {
  const h = storageHarness();
  const answer = input();
  const receipt = await h.module.saveSignedIntake(answer);
  assert.equal(receipt.id, id);
  assert.equal(receipt.duplicate, false);
  assert.ok(Number.isFinite(Date.parse(receipt.submittedAt)));
  assert.equal(h.objects.size, 1);
  assert.equal(h.uploads[0].path, `${id}.json`);
  assert.equal(h.uploads[0].options.upsert, false);
  const ciphertext = h.uploads[0].body.toString("utf8");
  assert.equal(ciphertext.includes(answer.fullName), false);
  assert.equal(ciphertext.includes(answer.email), false);
  assert.equal(ciphertext.includes(answer.goals), false);
  const record = await h.module.getSignedIntake(id);
  assert.equal(record.answers.goals, answer.goals);
  assert.equal(record.answers.consentAccepted, true);
  assert.equal(record.answers.website, undefined);
  assert.equal(record.answers.startedAt, undefined);
  assert.equal(record.consent.paragraphs[0], intake.HYPNOTHERAPY_CONSENT_PARAGRAPHS[0]);
  assert.equal(record.signature.name, answer.signatureName);
  assert.equal(record.signature.recordedAt, receipt.submittedAt);
  assert.equal(record.formVersion, intake.HYPNOTHERAPY_FORM_VERSION);
});

test("retries return the original receipt but cannot replace an already signed form", async () => {
  const h = storageHarness();
  const answer = input();
  const first = await h.module.saveSignedIntake(answer);
  const originalBytes = h.objects.get(`${id}.json`).toString("utf8");
  const repeated = await h.module.saveSignedIntake({ ...answer, startedAt: Date.now() - 15000 });
  assert.equal(repeated.duplicate, true);
  assert.equal(repeated.submittedAt, first.submittedAt);
  assert.equal(h.objects.get(`${id}.json`).toString("utf8"), originalBytes);
  await assert.rejects(h.module.saveSignedIntake({ ...answer, goals: "Changed answer" }), h.module.IntakeConflictError);
  assert.equal(h.objects.get(`${id}.json`).toString("utf8"), originalBytes);
  assert.equal(h.objects.size, 1);
});

test("storage distinguishes missing records from unavailable storage and detects broken record fingerprints", async () => {
  const h = storageHarness();
  assert.equal(await h.module.getSignedIntake(id), null);
  h.setDownloadError({ statusCode: "400", message: "Object not found" });
  assert.equal(await h.module.getSignedIntake(id), null);
  h.setDownloadError({ statusCode: "400", message: "Invalid bucket configuration" });
  await assert.rejects(h.module.getSignedIntake(id), /could not be opened/);
  h.setDownloadError({ statusCode: "503", message: "Storage unavailable" });
  await assert.rejects(h.module.getSignedIntake(id), /could not be opened/);
  h.setDownloadError(null);
  await h.module.saveSignedIntake(input());
  const record = await h.module.getSignedIntake(id.toUpperCase());
  record.answers.goals = "Modified after signature";
  h.objects.set(`${id}.json`, Buffer.from(JSON.stringify(h.crypto.encryptIntake(record, id))));
  await assert.rejects(h.module.getSignedIntake(id), /could not be verified/);
});

test("POST refuses invalid origin, type, body, consent and bot checks without any storage write", async () => {
  const h = routeHarness();
  const cases = [
    { options: { headers: { origin: "https://unrelated.invalid" } }, status: 403 },
    { options: { headers: { "content-type": "text/plain" } }, status: 415 },
    { options: { body: "{not json" }, status: 400 },
    { options: { headers: { "content-length": "48001" } }, status: 413 },
    { options: { body: JSON.stringify(input({ goals: "x".repeat(49000) })) }, status: 413 },
    { value: input({ consentAccepted: false }), status: 400 },
    { value: input({ formVersion: "old" }), status: 400 },
    { value: input({ website: "bot field" }), status: 400 },
    { value: input({ startedAt: Date.now() }), status: 400 },
    { value: input({ startedAt: 0 }), status: 400 },
  ];
  for (const item of cases) assert.equal((await h.submit(item.value, item.options)).status, item.status);
  assert.equal(h.saves.length, 0);
  assert.equal(h.storage.uploads.length, 0);
  assert.equal(h.notifications.length, 0);
  assert.equal(h.logs.length, 0);
  const unavailable = routeHarness({ configured: false });
  assert.equal((await unavailable.submit()).status, 503);
  assert.equal(unavailable.saves.length, 0);
});

test("POST returns a private receipt and metadata-only notification, with safe duplicate handling", async () => {
  const h = routeHarness();
  const answer = input();
  const first = await h.submit(answer);
  assert.equal(first.status, 201);
  assert.match(first.headers.get("cache-control"), /no-store/);
  assert.equal(first.headers.get("referrer-policy"), "no-referrer");
  const receipt = await first.json();
  assert.equal(JSON.stringify(receipt).includes(answer.goals), false);
  assert.deepEqual(Object.keys(h.notifications[0]).sort(), ["id", "submittedAt"]);
  assert.equal(h.notifications[0].id, id);
  const repeat = await h.submit(answer);
  assert.equal(repeat.status, 200);
  assert.equal(h.notifications.length, 1);
  const conflict = await h.submit({ ...answer, signatureName: "Different signature" });
  assert.equal(conflict.status, 409);
  assert.equal(h.storage.objects.size, 1);
  assert.equal(h.notifications.length, 1);
});

test("notification failure preserves a saved intake and logs no submitted answers", async () => {
  const h = routeHarness({ notificationError: true });
  const response = await h.submit();
  assert.equal(response.status, 201);
  assert.equal(h.storage.objects.size, 1);
  assert.equal(h.logs.length, 1);
  assert.deepEqual(h.logs[0], ["Client intake owner notification could not be delivered."]);
  const failed = routeHarness({ saveError: new Error("Provider error: SYNTHETIC PRIVATE CONTENT") });
  assert.equal((await failed.submit()).status, 503);
  assert.equal(failed.notifications.length, 0);
  assert.deepEqual(failed.logs[0], ["Client intake persistence failed."]);
});

class Redirect extends Error {
  constructor(href) { super("Redirect"); this.href = href; }
}

function adminPage(file, user, { configured = true, storageError = false, records = [] } = {}) {
  let reads = 0;
  const jsx = (type, props) => ({ type, props });
  const loadedModule = load(file, {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/link": { default() {} },
    "next/navigation": { redirect(href) { throw new Redirect(href); }, notFound() { throw new Error("Not found"); } },
    "@/components/page-shell": { PageShell() {} },
    "@/components/print-intake-button": { PrintIntakeButton() {} },
    "@/lib/member-access": { async getCurrentUserWithAccess() { return { user }; } },
    "@/lib/site": { isAdminEmail: email => email === "admin@example.invalid" },
    "@/lib/hypnotherapy-intake": intake,
    "@/lib/reiki-intake": reiki,
    "@/lib/intake-storage": {
      intakeStorageConfigured() { return configured; },
      async listSignedIntakes() {
        reads++;
        if (storageError) throw new Error("SYNTHETIC PRIVATE ERROR DETAIL");
        return { records, hasNext: false };
      },
      async getSignedIntake() {
        reads++;
        if (storageError) throw new Error("SYNTHETIC PRIVATE ERROR DETAIL");
        return records[0] ?? null;
      },
    },
  });
  return { async render() {
    return loadedModule.default({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) });
  }, reads: () => reads };
}

test("both private intake pages verify identity and admin permission before any intake access", async () => {
  for (const file of ["../src/app/client-intakes/page.tsx", "../src/app/client-intakes/[id]/page.tsx"]) {
    for (const user of [null, { email: "client@example.invalid" }]) {
      const h = adminPage(file, user);
      await assert.rejects(h.render(), error => error instanceof Redirect && error.href.startsWith(user ? "/account" : "/login"));
      assert.equal(h.reads(), 0);
    }
  }
});

test("both private intake pages fail closed when configuration or private storage is unavailable", async () => {
  for (const file of ["../src/app/client-intakes/page.tsx", "../src/app/client-intakes/[id]/page.tsx"]) {
    const unconfigured = adminPage(file, { email: "admin@example.invalid" }, { configured: false });
    const unavailableTree = JSON.stringify(await unconfigured.render());
    assert.match(unavailableTree, /temporarily unavailable/i);
    assert.equal(unconfigured.reads(), 0);
    const failed = adminPage(file, { email: "admin@example.invalid" }, { storageError: true });
    const failedTree = JSON.stringify(await failed.render());
    assert.match(failedTree, /temporarily unavailable/i);
    assert.equal(failedTree.includes("SYNTHETIC PRIVATE ERROR DETAIL"), false);
    assert.equal(failed.reads(), 1);
  }
});

test("initial form HTML prevents answers from entering a GET URL when JavaScript has not initialized", () => {
  const component = load("../src/components/hypnotherapy-intake-form.tsx", {
    react: React,
    "react/jsx-runtime": jsxRuntime,
    "@/lib/hypnotherapy-intake": intake,
    "@/lib/reiki-intake": reiki,
    "./hypnotherapy-intake-form.module.css": { default: {} },
  });
  const html = renderToStaticMarkup(React.createElement(component.HypnotherapyIntakeForm));
  const form = html.match(/<form\b[^>]*>/)?.[0];
  assert.ok(form, "The intake form is server rendered");
  assert.match(form, /method="post"/i);
  assert.match(form, /action="\/api\/client-intake\/hypnotherapy"/);
  assert.match(html, /<noscript>[\s\S]*Please enable JavaScript[\s\S]*<\/noscript>/);
  assert.match(html, /<fieldset\b[^>]*disabled=""/);
  assert.match(html, /<button\b[^>]*type="submit"[^>]*disabled=""/);
  // Answers stay locked while a receipt is uncertain, but the retry action must remain outside that lock.
  const fieldsets = [];
  let submitButtons = 0;
  for (const match of html.matchAll(/<\/?(?:fieldset|button)\b[^>]*>/gi)) {
    const tag = match[0];
    if (/^<fieldset\b/i.test(tag)) fieldsets.push(/\bdisabled(?:\s|=|>)/i.test(tag));
    else if (/^<\/fieldset\b/i.test(tag)) fieldsets.pop();
    else if (/^<button\b/i.test(tag) && /\btype="submit"/i.test(tag)) {
      submitButtons++;
      assert.equal(fieldsets.some(Boolean), false, "Submit/retry has no disabled fieldset ancestor");
    }
  }
  assert.equal(submitButtons, 1);
});


test("browser-facing Host accepts a same-origin form behind Next internal hostname without trusting forwarded hosts", async () => {
  const h = routeHarness({ configured: false });
  const url = "http://localhost:3390/api/client-intake/hypnotherapy";
  assert.equal((await h.submit(input(), { url, headers: { origin: "http://127.0.0.1:3390", host: "127.0.0.1:3390" } })).status, 503);
  assert.equal((await h.submit(input(), { url, headers: { origin: "https://unrelated.invalid", host: "127.0.0.1:3390" } })).status, 403);
  assert.equal((await h.submit(input(), { url, headers: { origin: "http://unrelated.invalid", host: "127.0.0.1:3390@unrelated.invalid" } })).status, 403);
  assert.equal((await h.submit(input(), { url, headers: { origin: "http://unrelated.invalid", "x-forwarded-host": "unrelated.invalid" } })).status, 403);
  assert.equal(h.saves.length, 0);
});

test("Reiki validation permits no email and requires it only for an explicit newsletter request", () => {
  assert.equal(reiki.validateReikiIntake(reikiInput()).success, true);
  const missingEmail = reiki.validateReikiIntake(reikiInput({ newsletterConsent: true }));
  assert.equal(missingEmail.success, false);
  assert.ok(missingEmail.errors.email);
  const subscribed = reiki.validateReikiIntake(reikiInput({ newsletterConsent: true, email: " CLIENT@EXAMPLE.INVALID " }));
  assert.equal(subscribed.success, true);
  assert.equal(subscribed.data.email, "client@example.invalid");
  assert.equal(reiki.validateReikiIntake(reikiInput({ newsletterConsent: "true" })).data.newsletterConsent, false);
});

test("Reiki signed storage preserves its own consent and signature inside ciphertext", async () => {
  const h = storageHarness();
  const answer = reikiInput();
  const receipt = await h.module.saveSignedReikiIntake(answer);
  const bytes = h.objects.get(`${id}.json`).toString("utf8");
  for (const privateValue of [answer.fullName, answer.intentions, answer.signatureName]) assert.equal(bytes.includes(privateValue), false);
  assert.equal(h.uploads[0].options.upsert, false);
  const record = await h.module.getSignedIntake(id);
  assert.equal(record.formType, "reiki");
  assert.equal(record.formVersion, reiki.REIKI_FORM_VERSION);
  assert.equal(record.answers.intentions, answer.intentions);
  assert.equal(record.answers.email, "");
  assert.equal(record.answers.website, undefined);
  assert.equal(record.answers.startedAt, undefined);
  assert.equal(JSON.stringify(record.consent.paragraphs), JSON.stringify(reiki.REIKI_CONSENT_PARAGRAPHS));
  assert.equal(record.consent.privacyNotice, reiki.REIKI_PRIVACY_NOTICE);
  assert.equal(record.consent.remoteSessionStatement, reiki.REIKI_REMOTE_SESSION_STATEMENT);
  assert.equal(record.consent.electronicSignatureStatement, reiki.REIKI_ELECTRONIC_SIGNATURE_STATEMENT);
  assert.equal(record.signature.method, "typed-name");
  assert.equal(record.signature.name, answer.signatureName);
  assert.equal(record.signature.date, answer.signatureDate);
  assert.equal(record.signature.recordedAt, receipt.submittedAt);
  assert.equal(record.requestDigest, h.crypto.intakeDigest(record.answers));
  const { recordDigest, ...unsigned } = record;
  assert.equal(recordDigest, h.crypto.intakeDigest(unsigned));
});

test("legacy hypnotherapy records retain original fingerprint, shape and immutable retry compatibility", async () => {
  const h = storageHarness();
  const { website: _website, startedAt: _startedAt, ...answers } = input();
  void _website; void _startedAt;
  const submittedAt = "2026-10-28T12:00:00.000Z";
  const unsigned = {
    id, submittedAt, formVersion: answers.formVersion, answers,
    consent: { paragraphs: intake.HYPNOTHERAPY_CONSENT_PARAGRAPHS, privacyNotice: intake.HYPNOTHERAPY_PRIVACY_NOTICE, remoteSessionStatement: intake.REMOTE_SESSION_STATEMENT, electronicSignatureStatement: intake.ELECTRONIC_SIGNATURE_STATEMENT },
    signature: { method: "typed-name", name: answers.signatureName, date: answers.signatureDate, recordedAt: submittedAt },
    requestDigest: h.crypto.intakeDigest(answers),
  };
  const legacy = { ...unsigned, recordDigest: h.crypto.intakeDigest(unsigned) };
  const originalBytes = JSON.stringify(h.crypto.encryptIntake(legacy, id));
  h.objects.set(`${id}.json`, Buffer.from(originalBytes));
  const opened = await h.module.getSignedIntake(id);
  assert.equal(JSON.stringify(opened), JSON.stringify(legacy));
  assert.equal(Object.hasOwn(opened, "formType"), false);
  const receipt = await h.module.saveSignedIntake(input());
  assert.equal(receipt.duplicate, true);
  assert.equal(receipt.submittedAt, submittedAt);
  assert.equal(h.objects.get(`${id}.json`).toString("utf8"), originalBytes);
  const otherId = crypto.randomUUID();
  await h.module.saveSignedIntake(input({ submissionId: otherId }));
  const newlySigned = await h.module.getSignedIntake(otherId);
  assert.deepEqual(Object.keys(newlySigned), Object.keys(legacy));
  assert.equal(Object.hasOwn(newlySigned, "formType"), false);
});

test("Reiki retries retain their receipt and signed bytes, and neither modality can replace the other", async () => {
  const h = storageHarness();
  const answer = reikiInput();
  const receipt = await h.module.saveSignedReikiIntake(answer);
  const originalBytes = h.objects.get(`${id}.json`).toString("utf8");
  const retry = await h.module.saveSignedReikiIntake({ ...answer, startedAt: Date.now() - 15000 });
  assert.equal(retry.duplicate, true);
  assert.equal(retry.submittedAt, receipt.submittedAt);
  await assert.rejects(h.module.saveSignedReikiIntake({ ...answer, intentions: "A changed intention" }), h.module.IntakeConflictError);
  await assert.rejects(h.module.saveSignedIntake(input()), h.module.IntakeConflictError);
  assert.equal(h.objects.get(`${id}.json`).toString("utf8"), originalBytes);
  const hypnotherapyId = crypto.randomUUID();
  await h.module.saveSignedIntake(input({ submissionId: hypnotherapyId }));
  const hypnotherapyBytes = h.objects.get(`${hypnotherapyId}.json`).toString("utf8");
  await assert.rejects(h.module.saveSignedReikiIntake({ ...answer, submissionId: hypnotherapyId }), h.module.IntakeConflictError);
  assert.equal(h.objects.get(`${hypnotherapyId}.json`).toString("utf8"), hypnotherapyBytes);
  const inbox = await h.module.listSignedIntakes();
  assert.equal(inbox.records.length, 2);
  assert.equal(inbox.records.filter(record => record.formType === "reiki").length, 1);
});

test("Reiki POST refuses invalid input, foreign origins and bot submissions before saving", async () => {
  const h = routeHarness({ formType: "reiki" });
  const cases = [
    { options: { headers: { origin: "https://unrelated.invalid" } }, status: 403 },
    { options: { headers: { "content-type": "text/plain" } }, status: 415 },
    { options: { body: "{not json" }, status: 400 },
    { options: { body: "[]" }, status: 400 },
    { options: { headers: { "content-length": "48001" } }, status: 413 },
    { options: { body: JSON.stringify(reikiInput({ intentions: "x".repeat(49000) })) }, status: 413 },
    ...[ ["fullName", ""], ["phone", "123"], ["intentions", ""], ["formVersion", intake.HYPNOTHERAPY_FORM_VERSION], ["consentAccepted", false], ["remoteReadiness", false], ["signatureName", ""], ["signatureDate", "2026-02-30"], ["website", "bot field"], ["startedAt", 0], ["startedAt", Date.now()] ].map(([key, value]) => ({ value: reikiInput({ [key]: value }), status: 400 })),
    { value: reikiInput({ newsletterConsent: true }), status: 400 },
  ];
  for (const item of cases) assert.equal((await h.submit(item.value, item.options)).status, item.status);
  assert.equal(h.saves.length, 0);
  assert.equal(h.notifications.length, 0);
  assert.equal(h.storage.objects.size, 0);
  assert.equal(h.logs.length, 0);
  const unavailable = routeHarness({ formType: "reiki", configured: false });
  assert.equal((await unavailable.submit()).status, 503);
  assert.equal(unavailable.saves.length, 0);
});

test("Reiki POST saves without an email and returns only a private receipt and metadata notification", async () => {
  const h = routeHarness({ formType: "reiki" });
  const answer = reikiInput();
  const first = await h.submit(answer);
  assert.equal(first.status, 201);
  assert.match(first.headers.get("cache-control"), /private, no-store/);
  assert.equal(first.headers.get("referrer-policy"), "no-referrer");
  assert.match(first.headers.get("x-robots-tag"), /noindex/);
  const receipt = await first.json();
  assert.deepEqual(Object.keys(receipt).sort(), ["duplicate", "id", "submittedAt"]);
  assert.equal(JSON.stringify(receipt).includes(answer.intentions), false);
  assert.deepEqual(Object.keys(h.notifications[0]).sort(), ["id", "submittedAt"]);
  assert.equal((await h.submit(answer)).status, 200);
  assert.equal(h.notifications.length, 1);
  assert.equal((await h.submit({ ...answer, signatureName: "Changed Signature" })).status, 409);
  assert.equal(h.notifications.length, 1);
  assert.equal(h.storage.objects.size, 1);
});

test("Reiki POST limits new attempts from a connection while still accepting a matching retry", async () => {
  const h = routeHarness({ formType: "reiki" });
  const options = { headers: { "x-real-ip": "192.0.2.15" } };
  const first = reikiInput();
  assert.equal((await h.submit(first, options)).status, 201);
  for (let index = 0; index < 5; index++) assert.equal((await h.submit(reikiInput({ submissionId: crypto.randomUUID() }), options)).status, 201);
  assert.equal((await h.submit(reikiInput({ submissionId: crypto.randomUUID() }), options)).status, 429);
  assert.equal((await h.submit(first, options)).status, 200);
  assert.equal(h.storage.objects.size, 6);
  assert.equal(h.notifications.length, 6);
});

test("Reiki notification and storage failures log no answers and preserve a successful signed save", async () => {
  const h = routeHarness({ formType: "reiki", notificationError: true });
  assert.equal((await h.submit()).status, 201);
  assert.equal(h.storage.objects.size, 1);
  assert.deepEqual(h.logs, [["Client intake owner notification could not be delivered."]]);
  const failed = routeHarness({ formType: "reiki", saveError: new Error("Synthetic private provider detail") });
  assert.equal((await failed.submit()).status, 503);
  assert.deepEqual(failed.logs, [["Client intake persistence failed."]]);
  assert.equal(failed.notifications.length, 0);
});

test("Reiki POST keeps the existing browser-facing Host guard without trusting forwarded hosts", async () => {
  const h = routeHarness({ formType: "reiki", configured: false });
  const url = "http://localhost:3390/api/client-intake/reiki";
  assert.equal((await h.submit(reikiInput(), { url, headers: { origin: "http://127.0.0.1:3390", host: "127.0.0.1:3390" } })).status, 503);
  assert.equal((await h.submit(reikiInput(), { url, headers: { origin: "https://unrelated.invalid", host: "127.0.0.1:3390" } })).status, 403);
  assert.equal((await h.submit(reikiInput(), { url, headers: { origin: "http://unrelated.invalid", "x-forwarded-host": "unrelated.invalid" } })).status, 403);
  assert.equal(h.saves.length, 0);
});

test("admin inbox and details distinguish Reiki from legacy hypnotherapy and retain stored consent", async () => {
  const h = storageHarness();
  await h.module.saveSignedReikiIntake(reikiInput());
  await h.module.saveSignedIntake(input({ submissionId: crypto.randomUUID() }));
  const { records } = await h.module.listSignedIntakes();
  const user = { email: "admin@example.invalid" };
  const inbox = JSON.stringify(await adminPage("../src/app/client-intakes/page.tsx", user, { records }).render());
  assert.match(inbox, /\/client-intake\/reiki/);
  assert.match(inbox, /\/client-intake\/hypnotherapy/);
  assert.match(inbox, /Reiki, new client/);
  assert.match(inbox, /Hypnotherapy/);
  const reikiRecord = records.find(record => record.formType === "reiki");
  reikiRecord.consent = { ...reikiRecord.consent, paragraphs: ["Historical Reiki consent snapshot"], privacyNotice: "Historical Reiki privacy notice" };
  const detail = JSON.stringify(await adminPage("../src/app/client-intakes/[id]/page.tsx", user, { records: [reikiRecord] }).render());
  assert.match(detail, /"title":"Client intake"/);
  for (const label of Object.values(reiki.REIKI_INTAKE_ANSWER_LABELS)) assert.ok(detail.includes(label), label);
  assert.match(detail, /SYNTHETIC PRIVATE REIKI INTENTIONS/);
  assert.match(detail, /Not provided/);
  assert.match(detail, /Historical Reiki consent snapshot/);
  assert.match(detail, /Historical Reiki privacy notice/);
  assert.equal(detail.includes(intake.HYPNOTHERAPY_CONSENT_PARAGRAPHS[0]), false);
  assert.equal(detail.includes(intake.INTAKE_ANSWER_LABELS.goals), false);
  const hypnotherapyRecord = records.find(record => record.formType !== "reiki");
  const hypnotherapyDetail = JSON.stringify(await adminPage("../src/app/client-intakes/[id]/page.tsx", user, { records: [hypnotherapyRecord] }).render());
  assert.ok(hypnotherapyDetail.includes(intake.INTAKE_ANSWER_LABELS.goals));
  assert.ok(hypnotherapyDetail.includes(intake.HYPNOTHERAPY_CONSENT_PARAGRAPHS[0]));
  assert.equal(hypnotherapyDetail.includes(reikiRecord.answers.intentions), false);
});
