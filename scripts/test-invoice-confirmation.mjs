import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

const source = ts.transpileModule(
  fs.readFileSync(new URL("../src/lib/invoice-confirmation.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

function fixture(overrides = {}) {
  const invoice = {
    id: "in_test_enrollment",
    billing_reason: "manual",
    collection_method: "send_invoice",
    status: "paid",
    amount_remaining: 0,
    amount_paid: 77700,
    total: 77700,
    currency: "usd",
    customer_email: "Student@Example.com",
    customer_name: "Test Student",
    created: 1,
    status_transitions: { paid_at: 2 },
    metadata: {
      purchaseType: "offer",
      offerSlug: "reiki-rising",
      enrollmentAutomation: "reiki-rising-fall-2026",
      enrollmentAmountCents: "77700",
    },
    ...overrides,
  };
  const calls = { portal: 0, welcome: 0, owner: 0, updates: 0 };
  const state = {
    portalFails: false,
    emailFails: false,
    ownerFails: false,
    emailSkipped: false,
    portalResult: {
      status: "provisioned",
      accessSlug: "reiki-rising-fall-2026",
      temporaryPassword: "test-only-password",
    },
    integrations: { emailDelivery: true, supabase: true },
  };
  const dependencies = {
    "server-only": {},
    "@/lib/env": { integrations: state.integrations },
    "@/lib/stripe/server": {
      getStripe: async () => ({
        invoices: {
          retrieve: async () => structuredClone(invoice),
          update: async (_id, { metadata }) => {
            calls.updates++;
            Object.assign(invoice.metadata, metadata);
          },
        },
      }),
    },
    "@/lib/portal-access": {
      provisionOfferPortalAccessFromSession: async (purchase) => {
        calls.portal++;
        assert.equal(purchase.customer_details.email, "student@example.com");
        assert.equal(purchase.metadata.offerSlug, "reiki-rising");
        return state.portalFails ? { status: "failed" } : state.portalResult;
      },
    },
    "@/lib/email": {
      canSendPurchaseOwnerNotification: () => true,
      sendPurchaseConfirmationEmail: async (purchase, portal) => {
        calls.welcome++;
        assert.equal(purchase.amount_total, 77700);
        assert.equal(purchase.metadata.paymentSource, "invoice");
        assert.equal(portal.accessSlug, "reiki-rising-fall-2026");
        if (state.emailFails) throw new Error("mail unavailable");
        return { skipped: state.emailSkipped };
      },
      sendPurchaseOwnerNotificationEmail: async () => {
        calls.owner++;
        if (state.ownerFails) throw new Error("owner mail unavailable");
        return { skipped: false };
      },
    },
  };
  const context = {
    exports: {},
    require: (name) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  };
  vm.runInNewContext(source, context);
  return { run: () => context.exports.processInvoiceConfirmation(invoice.id), invoice, calls, state };
}

test("paid private invoice enrolls with the actual amount and records delivery", async () => {
  const f = fixture();
  assert.equal((await f.run()).status, "complete");
  assert.deepEqual(f.calls, { portal: 1, welcome: 1, owner: 1, updates: 2 });
  assert.ok(f.invoice.metadata.customerEmailSentAt);
  assert.equal(f.invoice.metadata.portalAccessSlug, "reiki-rising-fall-2026");
  await f.run();
  assert.deepEqual(f.calls, { portal: 1, welcome: 1, owner: 1, updates: 2 });
});

test("unpaid, partial and unrelated invoices do not enroll or send email", async () => {
  for (const override of [
    { status: "open" },
    { amount_remaining: 100 },
    { metadata: {} },
    { billing_reason: "subscription_cycle" },
    { collection_method: "charge_automatically" },
  ]) {
    const f = fixture(override);
    assert.notEqual((await f.run()).status, "complete");
    assert.deepEqual(f.calls, { portal: 0, welcome: 0, owner: 0, updates: 0 });
  }
});

test("invalid payment totals, missing identity and invalid amounts fail closed", async () => {
  for (const override of [
    { total: 111100 }, { amount_paid: 50000 }, { currency: "eur" },
    { customer_email: null },
  ]) {
    const f = fixture(override);
    await assert.rejects(f.run, /do not match/);
    assert.equal(f.calls.portal, 0);
  }
  for (const amount of ["", "0", "NaN", "77700.5"]) {
    const f = fixture();
    f.invoice.metadata.enrollmentAmountCents = amount;
    await assert.rejects(f.run, /do not match/);
  }
});

test("portal or delivery failure remains retryable without a false sent marker", async () => {
  const f = fixture();
  f.state.portalFails = true;
  await assert.rejects(f.run, /portal access is not ready/);
  assert.equal(f.calls.welcome, 0);
  f.state.portalFails = false;
  f.state.emailFails = true;
  await assert.rejects(f.run, /mail unavailable/);
  assert.equal(f.invoice.metadata.customerEmailSentAt, undefined);
  f.state.emailFails = false;
  assert.equal((await f.run()).status, "complete");
});

test("owner retry does not regenerate credentials or resend student email", async () => {
  const f = fixture();
  f.state.ownerFails = true;
  await assert.rejects(f.run, /owner mail unavailable/);
  f.state.ownerFails = false;
  await f.run();
  assert.equal(f.calls.portal, 1);
  assert.equal(f.calls.welcome, 1);
  assert.equal(f.calls.owner, 2);
});

test("missing integrations, skipped email and wrong cohort remain retryable", async () => {
  const f = fixture();
  f.state.integrations.emailDelivery = false;
  await assert.rejects(f.run, /not configured/);
  f.state.integrations.emailDelivery = true;
  f.state.emailSkipped = true;
  await assert.rejects(f.run, /was not sent/);
  assert.equal(f.invoice.metadata.customerEmailSentAt, undefined);
  f.state.portalResult.accessSlug = "reiki-rising";
  await assert.rejects(f.run, /portal access is not ready/);
});

test("existing students can receive a recovery link without a password reset", async () => {
  const f = fixture();
  f.state.portalResult = {
    status: "provisioned",
    accessSlug: "reiki-rising-fall-2026",
    setupUrl: "https://example.com/portal-setup?token=test-only",
  };
  assert.equal((await f.run()).status, "complete");
});
