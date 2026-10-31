import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import { test } from "node:test";

const require = createRequire(process.env.LIGHTNESS_TEST_DEPENDENCY_ROOT
  ? path.join(process.env.LIGHTNESS_TEST_DEPENDENCY_ROOT, "package.json")
  : new URL("../package.json", import.meta.url));
const ts = require("typescript");
const source = ts.transpileModule(fs.readFileSync(new URL("../src/lib/intake-mailchimp.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const defaultInput = { name: "Synthetic Guardian", email: " CLIENT@EXAMPLE.INVALID ", newsletterConsent: true };

function json(value, status = 200) { return new Response(JSON.stringify(value), { status }); }
function harness({ configured = true, doubleOptin = false, memberStatus = "subscribed", fetch: responder,
  apiKey = "synthetic-placeholder-us1", audienceId = "audience123" } = {}) {
  const calls = [];
  const context = {
    exports: {}, Buffer, AbortSignal,
    console: new Proxy({}, { get() { return () => { throw new Error("Unexpected logging in Mailchimp helper"); }; } }),
    require(name) {
      if (name === "server-only") return {};
      if (name === "node:crypto") return crypto;
      if (name === "@/lib/env") return { env: { mailchimpApiKey: apiKey, mailchimpAudienceId: audienceId }, integrations: { mailchimp: configured } };
      throw new Error(`Unexpected dependency: ${name}`);
    },
    async fetch(url, init) {
      calls.push({ url, init });
      return responder ? responder(url, init, calls.length) : calls.length % 2 === 1 ? json({ double_optin: doubleOptin }) : json({ status: memberStatus });
    },
  };
  vm.runInNewContext(source, context, { filename: "intake-mailchimp.ts" });
  return { ...context.exports, calls };
}

test("unchecked, absent and string consent never contact Mailchimp", async () => {
  const h = harness();
  for (const newsletterConsent of [false, undefined, "true", 1]) {
    const result = await h.syncIntakeNewsletterToMailchimp({ ...defaultInput, newsletterConsent });
    assert.equal(result.outcome, "not-requested");
  }
  assert.equal(h.calls.length, 0);
});

test("missing integration configuration is explicit and never contacts Mailchimp", async () => {
  const h = harness({ configured: false });
  assert.equal(h.intakeMailchimpConfigured(), false);
  assert.equal((await h.syncIntakeNewsletterToMailchimp(defaultInput)).outcome, "not-configured");
  assert.equal(h.calls.length, 0);
});

test("an explicit opt-in sends only normalized email and name with a new-member status", async () => {
  const h = harness();
  const result = await h.syncIntakeNewsletterToMailchimp({ ...defaultInput,
    childName: "Private Child", medicalConditions: "Private answer", signatureName: "Private signature",
    formType: "childrens-reiki", submissionId: "private-record-id", tags: ["private-service-tag"],
  });
  assert.equal(result.outcome, "synced");
  assert.equal(result.status, "subscribed");
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[0].url, "https://us1.api.mailchimp.com/3.0/lists/audience123?fields=double_optin");
  assert.equal(h.calls[0].init.body, undefined);
  const request = h.calls[1];
  assert.equal(request.url, `https://us1.api.mailchimp.com/3.0/lists/audience123/members/${crypto.createHash("md5").update("client@example.invalid").digest("hex")}`);
  assert.equal(request.init.method, "PUT");
  assert.deepEqual(JSON.parse(request.init.body), {
    email_address: "client@example.invalid", status_if_new: "subscribed", merge_fields: { FNAME: "Synthetic", LNAME: "Guardian" },
  });
  for (const call of h.calls) {
    assert.equal(call.init.cache, "no-store");
    assert.equal(call.init.redirect, "error");
    assert.ok(call.init.signal instanceof AbortSignal);
  }
});

test("double opt-in audiences create pending members without bypassing confirmation", async () => {
  const h = harness({ doubleOptin: true, memberStatus: "pending" });
  const result = await h.syncIntakeNewsletterToMailchimp(defaultInput);
  assert.equal(result.status, "pending");
  const payload = JSON.parse(h.calls[1].init.body);
  assert.equal(payload.status_if_new, "pending");
  assert.equal(Object.hasOwn(payload, "status"), false);
});

test("existing subscribed, unsubscribed, cleaned, pending and transactional statuses stay untouched on retries", async () => {
  for (const initialStatus of ["subscribed", "unsubscribed", "cleaned", "pending", "transactional"]) {
    let storedStatus = initialStatus;
    let subscriptionChanges = 0;
    const h = harness({ fetch(url, init) {
      if (url.includes("?fields=")) return json({ double_optin: true });
      const payload = JSON.parse(init.body);
      if (payload.status && payload.status !== storedStatus) { storedStatus = payload.status; subscriptionChanges += 1; }
      assert.equal(Object.hasOwn(payload, "tags"), false);
      return json({ status: storedStatus });
    } });
    const first = await h.syncIntakeNewsletterToMailchimp(defaultInput);
    const retry = await h.syncIntakeNewsletterToMailchimp(defaultInput);
    assert.equal(first.status, initialStatus);
    assert.equal(retry.status, initialStatus);
    assert.equal(storedStatus, initialStatus);
    assert.equal(subscriptionChanges, 0);
    assert.equal(h.calls[1].url, h.calls[3].url);
    assert.equal(h.calls[1].init.body, h.calls[3].init.body);
  }
});

test("a retry after an uncertain first response creates only one new member and one confirmation", async () => {
  let storedStatus;
  let confirmations = 0;
  let newMembers = 0;
  const h = harness({ fetch(url, init, call) {
    if (url.includes("?fields=")) return json({ double_optin: true });
    const payload = JSON.parse(init.body);
    if (!storedStatus) {
      storedStatus = payload.status_if_new;
      newMembers += 1;
      if (storedStatus === "pending") confirmations += 1;
    }
    if (call === 2) throw new Error("Synthetic response lost after acceptance");
    return json({ status: storedStatus });
  } });
  await assert.rejects(() => h.syncIntakeNewsletterToMailchimp(defaultInput), error => error.retryable === true);
  assert.equal((await h.syncIntakeNewsletterToMailchimp(defaultInput)).status, "pending");
  assert.equal(newMembers, 1);
  assert.equal(confirmations, 1);
});

test("a failed or malformed audience lookup never attempts a subscription", async () => {
  for (const response of [json({ error: "Private provider response" }, 503), json({}), json({ double_optin: "false" }), json([])]) {
    const h = harness({ fetch() { return response; } });
    await assert.rejects(() => h.syncIntakeNewsletterToMailchimp(defaultInput), error => error.retryable === true && !error.message.includes("Private"));
    assert.equal(h.calls.length, 1);
  }
});

test("invalid contacts or API destinations fail before any network request", async () => {
  for (const config of [{ apiKey: "synthetic-https://bad.invalid" }, { audienceId: "bad/../../path" }, {}]) {
    const h = harness(config);
    const value = Object.keys(config).length ? defaultInput : { ...defaultInput, email: "not-an-email" };
    await assert.rejects(() => h.syncIntakeNewsletterToMailchimp(value), error => error.retryable === false);
    assert.equal(h.calls.length, 0);
  }
});

test("provider and network errors are generic and classified without preserving sensitive error bodies", async () => {
  for (const [status, retryable] of [[400, false], [401, false], [403, false], [408, true], [429, true], [500, true], [503, true]]) {
    const h = harness({ fetch(url) {
      return url.includes("?fields=") ? json({ double_optin: false }) : json({ detail: "Private provider payload client@example.invalid" }, status);
    } });
    await assert.rejects(() => h.syncIntakeNewsletterToMailchimp(defaultInput), error => {
      assert.equal(error.retryable, retryable);
      assert.equal(error.message, "The email update preference could not be synchronized.");
      assert.equal(error.cause, undefined);
      return true;
    });
  }
  const h = harness({ fetch() { throw new Error("Private network error client@example.invalid"); } });
  await assert.rejects(() => h.syncIntakeNewsletterToMailchimp(defaultInput), error => error.retryable === true && !JSON.stringify(error).includes("client@example.invalid"));
});

test("a malformed member result does not report a successful synchronization", async () => {
  for (const body of [{}, { status: "unknown" }, [], null]) {
    const h = harness({ fetch(url) { return url.includes("?fields=") ? json({ double_optin: false }) : json(body); } });
    await assert.rejects(() => h.syncIntakeNewsletterToMailchimp(defaultInput), error => error.retryable === true);
  }
});
