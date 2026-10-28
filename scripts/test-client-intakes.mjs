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
  });
  return { module: loadedModule, objects, uploads, downloads, crypto: encrypted.module, environment: encrypted.environment,
    setAvailable(value) { available = value; },
    setDownloadError(value) { downloadError = value; },
  };
}

function routeHarness({ configured = true, notificationError = false, saveError = null } = {}) {
  const storage = storageHarness();
  const saves = [];
  const notifications = [];
  const logs = [];
  const loadedModule = load("../src/app/api/client-intake/hypnotherapy/route.ts", {
    "node:crypto": crypto,
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/lib/env": { env: { siteUrl: "https://example.invalid" } },
    "@/lib/hypnotherapy-intake": intake,
    "@/lib/intake-storage": {
      ...storage.module,
      intakeStorageConfigured: () => configured,
      async saveSignedIntake(value) {
        saves.push(value);
        if (saveError) throw saveError;
        return storage.module.saveSignedIntake(value);
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
    async submit(value = input(), { headers = {}, body, url = "https://example.invalid/api/client-intake/hypnotherapy" } = {}) {
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

function adminPage(file, user, { configured = true, storageError = false } = {}) {
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
    "@/lib/intake-storage": {
      intakeStorageConfigured() { return configured; },
      async listSignedIntakes() {
        reads++;
        if (storageError) throw new Error("SYNTHETIC PRIVATE ERROR DETAIL");
        return { records: [], hasNext: false };
      },
      async getSignedIntake() {
        reads++;
        if (storageError) throw new Error("SYNTHETIC PRIVATE ERROR DETAIL");
        return null;
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
