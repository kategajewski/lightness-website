import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

function load(file, dependencies) {
  const source = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, URLSearchParams, require(name) {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(source, context);
  return context.exports;
}

class Redirect extends Error {
  constructor(href) {
    super("Redirect");
    this.href = href;
  }
}

function createHarness() {
  const stored = [];
  const forwarded = [];
  const security = load("../src/lib/form-security.ts", {
    "@/lib/env": { env: {}, integrations: { turnstile: false } },
  });
  const action = load("../src/app/contact/actions.ts", {
    "next/navigation": { redirect(href) { throw new Redirect(href); } },
    "@/lib/env": { integrations: { supabase: true, emailForwarding: true } },
    "@/lib/email": { async sendInquiryForwardEmail(input) {
      forwarded.push(JSON.parse(JSON.stringify(input)));
    } },
    "@/lib/form-security": security,
    "@/lib/supabase/admin": { createSupabaseAdminClient() {
      return { from(table) {
        assert.equal(table, "contact_inquiries");
        return { async insert(row) {
          stored.push(JSON.parse(JSON.stringify(row)));
          return { error: null };
        } };
      } };
    } },
  });
  return { stored, forwarded, async submit(overrides = {}) {
    const form = new FormData();
    const fields = {
      name: "Rose Client", email: "client@example.com", message: "A custom mala, please.",
      inquiryType: "rose-frequency", redirectTo: "/divine-rose-frequencies",
      orderStyle: "108-bead mala", quantity: "1", startedAt: String(Date.now() - 5000),
      ...overrides,
    };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) form.set(key, value);
    }
    try {
      await action.submitContactInquiry(form);
      assert.fail("Expected a redirect after submission");
    } catch (error) {
      if (!(error instanceof Redirect)) throw error;
      return new URL(error.href, "https://bethelightness.com");
    }
  } };
}

test("custom order referral is trimmed and preserved in storage and forwarded details", async () => {
  const harness = createHarness();
  const referral = 'Rose & Light <Shop> "North"';
  const result = await harness.submit({ referralSource: `  ${referral}  ` });
  assert.equal(result.pathname, "/divine-rose-frequencies");
  assert.equal(result.searchParams.get("status"), "success");
  assert.equal(harness.stored.length, 1);
  assert.equal(harness.forwarded.length, 1);
  assert.equal(harness.stored[0].inquiry_type, "rose-frequency");
  assert.ok(harness.stored[0].message.split("\n").includes(`Referred by: ${referral}`));
  assert.deepEqual(harness.forwarded[0].customOrderDetails.filter(detail => detail.label === "Referred by"), [
    { label: "Referred by", value: referral },
  ]);
  assert.equal(harness.forwarded[0].message, "A custom mala, please.");
});

test("omitted, empty and whitespace-only referrals succeed without an empty referral line", async () => {
  for (const referralSource of [undefined, "", "   "]) {
    const harness = createHarness();
    const result = await harness.submit({ referralSource });
    assert.equal(result.searchParams.get("status"), "success");
    assert.equal(harness.stored.length, 1);
    assert.equal(harness.forwarded.length, 1);
    assert.equal(harness.stored[0].message, [
      "Divine Rose Frequency Custom Order",
      "Preferred style: 108-bead mala",
      "Quantity: 1",
      "",
      "Message:",
      "A custom mala, please.",
    ].join("\n"));
    assert.deepEqual(harness.forwarded[0].customOrderDetails, [
      { label: "Preferred style", value: "108-bead mala" },
      { label: "Quantity", value: "1" },
    ]);
  }
});

test("general inquiries ignore custom order referral fields", async () => {
  const harness = createHarness();
  const result = await harness.submit({ inquiryType: "general", redirectTo: "/contact", referralSource: "Rose Shop" });
  assert.equal(result.pathname, "/contact");
  assert.equal(result.searchParams.get("status"), "success");
  assert.equal(harness.stored.length, 1);
  assert.equal(harness.stored[0].inquiry_type, "general");
  assert.equal(harness.stored[0].message, "A custom mala, please.");
  assert.equal(harness.forwarded.length, 1);
  assert.deepEqual(harness.forwarded[0].customOrderDetails, []);
});

test("providing a referral does not bypass existing required fields", async () => {
  for (const field of ["name", "email", "message"]) {
    const harness = createHarness();
    const result = await harness.submit({ [field]: "   ", referralSource: "Rose Shop" });
    assert.equal(result.searchParams.get("status"), "error");
    assert.equal(result.searchParams.get("message"), "Please complete the required fields.");
    assert.deepEqual(harness.stored, []);
    assert.deepEqual(harness.forwarded, []);
  }
});
