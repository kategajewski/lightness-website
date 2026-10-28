import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

const source = ts.transpileModule(fs.readFileSync(new URL("../src/lib/email.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const reference = { id: "e62d16ea-46e5-417f-b145-c8a70634be55", submittedAt: "2026-10-28T19:00:00.000Z" };

function harness({ resend = true, gmail = true, rejected = false, forwarding = " owner@example.invalid, second@example.invalid, owner@example.invalid ", admins = ["second@example.invalid", "admin@example.invalid"] } = {}) {
  const requests = [];
  const messages = [];
  const errors = [];
  const env = {
    emailFrom: "Lightness <sender@example.invalid>", contactForwardTo: forwarding,
    resendApiKey: resend ? "synthetic-resend-key" : "",
    gmailAuthUser: gmail ? "sender@example.invalid" : "",
    gmailAppPassword: gmail ? "synthetic-gmail-password" : "",
    siteUrl: "https://example.invalid",
  };
  const dependencies = {
    nodemailer: { default: { createTransport: () => ({ sendMail: async message => { messages.push(message); return { messageId: "synthetic-only" }; } }) } },
    "@/lib/env": { env, integrations: {} },
    "@/lib/gift-certificates": {}, "@/lib/offers": {}, "@/lib/reiki-rising-live-calls": {},
    "@/lib/site": { site: { adminEmails: admins, links: {} } },
  };
  const context = {
    exports: {}, Buffer, URL,
    console: { error: (...args) => errors.push(args) },
    require(name) { assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`); return dependencies[name]; },
    fetch: async (url, options) => {
      assert.equal(url, "https://api.resend.com/emails");
      requests.push({ url, options, body: JSON.parse(options.body) });
      return { ok: !rejected, status: rejected ? 422 : 200, text: async () => "Synthetic provider rejection" };
    },
  };
  vm.runInNewContext(source, context, { filename: "email.ts" });
  return { email: context.exports, requests, messages, errors };
}

const recipients = ["owner@example.invalid", "second@example.invalid", "admin@example.invalid"];

test("intake notifications send distinct owner addresses as a Resend recipient array without Gmail fallback", async () => {
  const h = harness();
  const result = await h.email.sendClientIntakeOwnerNotification(reference);
  assert.equal(result.skipped, false);
  assert.equal(h.requests.length, 1);
  assert.deepEqual(h.requests[0].body.to, recipients);
  assert.equal(h.messages.length, 0);
  assert.equal(h.errors.length, 0);
  const body = h.requests[0].body;
  assert.deepEqual(Object.keys(body).sort(), ["from", "html", "subject", "text", "to"]);
  assert.equal(body.subject, "A signed client intake is ready to review");
  assert.equal(body.text, `A signed client intake is ready to review\n\nSubmission reference: ${reference.id}\nSubmitted at: ${reference.submittedAt}\nhttps://bethelightness.com/client-intakes`);
  assert.equal(body.attachments, undefined);
  assert.equal(body.reply_to, undefined);
});

test("intake notification Gmail transport accepts the same owner recipient array", async () => {
  const h = harness({ resend: false });
  assert.equal((await h.email.sendClientIntakeOwnerNotification(reference)).skipped, false);
  assert.equal(h.requests.length, 0);
  assert.equal(h.messages.length, 1);
  assert.deepEqual(Array.from(h.messages[0].to), recipients);
  assert.equal(h.messages[0].attachments, undefined);
  assert.equal(h.messages[0].replyTo, undefined);
});

test("a rejected Resend request preserves the recipient array for Gmail fallback", async () => {
  const h = harness({ rejected: true });
  assert.equal((await h.email.sendClientIntakeOwnerNotification(reference)).skipped, false);
  assert.equal(h.requests.length, 1);
  assert.deepEqual(h.requests[0].body.to, recipients);
  assert.equal(h.messages.length, 1);
  assert.deepEqual(Array.from(h.messages[0].to), recipients);
  assert.equal(h.errors.length, 1);
});

for (const resend of [true, false]) {
  test(`existing single-recipient email remains a string through ${resend ? "Resend" : "Gmail"}`, async () => {
    const h = harness({ resend });
    await h.email.sendPasswordRecoveryEmail({ email: "client@example.invalid", recoveryUrl: "https://example.invalid/reset?token=synthetic" });
    assert.equal(resend ? h.requests[0].body.to : h.messages[0].to, "client@example.invalid");
    assert.equal(h.requests.length, resend ? 1 : 0);
    assert.equal(h.messages.length, resend ? 0 : 1);
  });
}

test("unconfigured intake notifications skip without calling either mail provider", async () => {
  const h = harness({ resend: false, gmail: false });
  assert.equal((await h.email.sendClientIntakeOwnerNotification(reference)).skipped, true);
  assert.equal(h.requests.length + h.messages.length, 0);
});

test("Resend failure without Gmail remains an error for the save-safe caller to handle", async () => {
  const h = harness({ rejected: true, gmail: false });
  await assert.rejects(() => h.email.sendClientIntakeOwnerNotification(reference), /Resend email failed: 422/);
  assert.equal(h.requests.length, 1);
  assert.equal(h.messages.length, 0);
});
