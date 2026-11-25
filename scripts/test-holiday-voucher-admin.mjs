import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(relativePath, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(relativePath, import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.compileFunction(source, ["exports", "require", "process"], { filename: relativePath })(exports, (name) => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
    return dependencies[name];
  }, process);
  return exports;
}

const campaign = load("../src/lib/holiday-gift-campaign.ts");
const order = load("../src/lib/holiday-gift-order.ts");
const voucherId = "11111111-1111-4111-8111-111111111111";
const redemptionId = "22222222-2222-4222-8222-222222222222";
const requestId = "33333333-3333-4333-8333-333333333333";

class Redirect extends Error {
  constructor(url) { super(url); this.url = url; }
}

function form(changes = {}) {
  const data = new FormData();
  const fields = {
    voucherId, requestId, redemptionId, mode: "live", page: "1", amount: "5.01",
    bookingReference: "booking-123", serviceId: "rest-receive", recipientName: "Gift recipient",
    noOtherPromotion: "yes", policyEligible: "yes", policyReference: "Canceled within the existing policy",
    ...changes,
  };
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

function harness({ user = { email: "admin@example.invalid" }, patch = {}, deliveryStatus = "sent", listing = [] } = {}) {
  const calls = { read: [], redeem: [], restore: [], deliver: [], list: [], revalidate: [], auth: 0 };
  const voucher = {
    id: voucherId, campaign_id: campaign.HOLIDAY_CAMPAIGN.id, stripe_livemode: true,
    status: "issued", balance_cents: 1500, face_value_cents: 1500, entitlement_cents: 1500,
    code: "HOLIDAY-SYNTHETIC-CODE", purchased_amount_cents: 10000, amount_refunded_cents: 0,
    refund_review_required: false, issued_at: "2026-11-24T19:00:00Z", valid_from: "2000-01-01T05:00:00Z", expires_at: "2100-04-01T04:00:00Z",
    purchaser_email: "purchaser@example.invalid", purchaser_name: "Synthetic Purchaser", paid_certificate_code: "LIGHT-SYNTHETIC", payment_intent_id: "pi_synthetic", checkout_session_id: "cs_synthetic",
    holiday_voucher_redemptions: [{ id: redemptionId, service_id: "rest-receive", amount_cents: 100, redeemed_at: "2026-11-24T19:00:00Z", redeemed_by: "admin@example.invalid", booking_reference: "synthetic-booking" }],
    holiday_voucher_redemption_reversals: [], holiday_voucher_refund_adjustments: [],
    holiday_voucher_email_outbox: { status: "pending", attempts: 0 }, ...patch,
  };
  const dependencies = {
    "next/navigation": { redirect(url) { throw new Redirect(url); } },
    "next/cache": { revalidatePath(path) { calls.revalidate.push(path); } },
    "@/lib/holiday-gift-campaign": campaign,
    "@/lib/holiday-gift-order": order,
    "@/lib/member-access": { async getCurrentUserWithAccess() { calls.auth++; return { user }; } },
    "@/lib/site": { isAdminEmail(email) { return email === "admin@example.invalid"; } },
    "@/lib/holiday-voucher-store": {
      async getHolidayVoucher(id) { calls.read.push(id); return voucher; },
      async redeemHolidayVoucher(input, policy) { calls.redeem.push({ input, policy }); return voucher; },
      async restoreHolidayVoucherRedemption(input) { calls.restore.push(input); return voucher; },
      async listHolidayVouchers(input) { calls.list.push(input); return { vouchers: listing, count: listing.length }; },
    },
    "@/lib/holiday-voucher-fulfillment": {
      async deliverHolidayVoucher(input) { calls.deliver.push(input); return { status: deliveryStatus }; },
    },
  };
  const actions = load("../src/app/admin/holiday-vouchers/actions.ts", dependencies);
  return { calls, voucher, actions, dependencies };
}

async function redirected(action, data, notice) {
  await assert.rejects(() => action(data), (error) => error instanceof Redirect && error.url.includes(`notice=${notice}`));
}

for (const action of ["redeemHolidayVoucherAction", "restoreHolidayVoucherCreditAction", "retryHolidayVoucherEmailAction"]) {
  for (const user of [null, { email: "member@example.invalid" }]) {
    test(`${action} checks admin authorization before accessing voucher data for ${user ? "a member" : "a signed-out visitor"}`, async () => {
      const h = harness({ user });
      await assert.rejects(() => h.actions[action](form()), (error) => error instanceof Redirect && error.url.startsWith(user ? "/account" : "/login"));
      assert.equal(h.calls.auth, 1);
      assert.equal(h.calls.read.length + h.calls.redeem.length + h.calls.restore.length + h.calls.deliver.length, 0);
    });
  }
}

test("redemption preserves decimal cents, recorded admin identity and approved redemption restrictions", async () => {
  const h = harness();
  await redirected(h.actions.redeemHolidayVoucherAction, form(), "redeemed");
  assert.equal(h.calls.redeem.length, 1);
  const { input, policy } = h.calls.redeem[0];
  assert.equal(input.amountCents, 501);
  assert.equal(input.requestId, requestId);
  assert.equal(input.redeemedBy, "admin@example.invalid");
  assert.equal(input.hasOtherPromotion, false);
  assert.equal(input.serviceAt, null);
  assert.equal(policy.allowPartialRedemptions, true);
  assert.equal(policy.maxVouchersPerBooking, null);
  assert.equal(policy.serviceMustOccurDuringValidity, false);
  assert.deepEqual(policy.allowedServiceIds, campaign.APPROVED_HOLIDAY_RULES.eligibleServiceIds);
});

for (const changes of [
  { amount: "1e2" }, { amount: "0" }, { amount: "5.001" }, { amount: "16" },
  { serviceId: "course" }, { noOtherPromotion: "" }, { requestId: "bad" },
  { bookingReference: "" }, { bookingReference: "a".repeat(161) }, { recipientName: "a".repeat(161) }, { mode: "test" },
]) {
  test(`invalid redemption input is rejected without a balance mutation: ${JSON.stringify(changes)}`, async () => {
    const h = harness();
    await redirected(h.actions.redeemHolidayVoucherAction, form(changes), "redemption-invalid");
    assert.equal(h.calls.redeem.length, 0);
  });
}

test("redemption retry retains its request ID even when the displayed balance has since changed", async () => {
  const h = harness();
  await redirected(h.actions.redeemHolidayVoucherAction, form(), "redeemed");
  h.voucher.balance_cents = 0;
  await redirected(h.actions.redeemHolidayVoucherAction, form(), "redeemed");
  assert.equal(h.calls.redeem[0].input.requestId, h.calls.redeem[1].input.requestId);
});

test("restoration requires cancellation-policy confirmation and a redemption belonging to the selected voucher", async () => {
  for (const changes of [{ policyEligible: "" }, { policyReference: "" }, { redemptionId: requestId }]) {
    const h = harness();
    await redirected(h.actions.restoreHolidayVoucherCreditAction, form(changes), "restoration-invalid");
    assert.equal(h.calls.restore.length, 0);
  }
  const h = harness();
  await redirected(h.actions.restoreHolidayVoucherCreditAction, form(), "restored");
  assert.equal(h.calls.restore.length, 1);
  assert.equal(h.calls.restore[0].policyEligible, true);
  assert.equal(h.calls.restore[0].restoredBy, "admin@example.invalid");
  assert.equal(h.calls.restore[0].requestId, requestId);
});

for (const status of ["review", "sent", "sending"]) {
  test(`email delivery held in ${status} state cannot be manually resent`, async () => {
    const h = harness({ patch: { holiday_voucher_email_outbox: { status } } });
    await redirected(h.actions.retryHolidayVoucherEmailAction, form(), "email-held");
    assert.equal(h.calls.deliver.length, 0);
  });
}

test("pending email is retried through the guarded fulfillment helper", async () => {
  const h = harness();
  await redirected(h.actions.retryHolidayVoucherEmailAction, form(), "email-checked");
  assert.equal(h.calls.deliver.length, 1);
});

test("the guarded helper's delivery hold is shown as a hold", async () => {
  const h = harness({ deliveryStatus: "review" });
  await redirected(h.actions.retryHolidayVoucherEmailAction, form(), "email-held");
});

function pageHarness(options) {
  const h = harness(options);
  const element = (type, props) => ({ type, props });
  const page = load("../src/app/admin/holiday-vouchers/page.tsx", {
    ...h.dependencies,
    "node:crypto": { randomUUID: () => requestId },
    "react/jsx-runtime": { jsx: element, jsxs: element, Fragment: "fragment" },
    "next/link": { default: "link" },
    "@/components/page-shell": { PageShell: "shell" },
    "./actions": h.actions,
  });
  return { ...h, page };
}

test("the admin page checks authorization before listing vouchers", async () => {
  for (const user of [null, { email: "member@example.invalid" }]) {
    const h = pageHarness({ user });
    await assert.rejects(() => h.page.default({ searchParams: Promise.resolve({}) }), Redirect);
    assert.equal(h.calls.list.length, 0);
  }
});

test("the admin page defaults to live transactions and keeps test pagination separate", async () => {
  const live = pageHarness();
  await live.page.default({ searchParams: Promise.resolve({}) });
  assert.equal(live.calls.list[0].livemode, true);
  assert.equal(live.calls.list[0].offset, 0);
  assert.equal(live.page.metadata.robots.index, false);
  const testMode = pageHarness();
  await testMode.page.default({ searchParams: Promise.resolve({ mode: "test", page: "2" }) });
  assert.equal(testMode.calls.list[0].livemode, false);
  assert.equal(testMode.calls.list[0].offset, 25);
});

function elementText(element) {
  if (element === null || element === undefined || typeof element === "boolean") return "";
  if (Array.isArray(element)) return element.map(elementText).join("");
  if (typeof element !== "object") return String(element);
  return typeof element.type === "function" ? elementText(element.type(element.props)) : elementText(element.props?.children);
}

for (const [name, patch] of [
  ["expired", { expires_at: "2001-04-01T04:00:00Z" }],
  ["not yet valid", { valid_from: "2100-01-01T05:00:00Z", expires_at: "2101-04-01T04:00:00Z" }],
  ["held for refund review", { status: "refund_review", refund_review_required: true }],
  ["voided", { status: "voided" }],
]) {
  test(`${name} voucher displays zero usable credit while retaining its recorded balance`, async () => {
    const fixture = harness({ patch }).voucher;
    const h = pageHarness({ listing: [fixture] });
    const content = elementText(await h.page.default({ searchParams: Promise.resolve({}) }));
    assert.ok(content.includes("Available to redeem now$0"));
    assert.ok(content.includes("Recorded promotional balance$15"));
    assert.ok(!content.includes("Record a redemption"));
  });
}

test("a refund-adjusted but unused voucher is not described as partially redeemed", async () => {
  const fixture = harness({ patch: { entitlement_cents: 500, balance_cents: 500, holiday_voucher_redemptions: [] } }).voucher;
  const h = pageHarness({ listing: [fixture] });
  const content = elementText(await h.page.default({ searchParams: Promise.resolve({}) }));
  assert.ok(content.includes("Available after refund adjustment"));
  assert.ok(!content.includes("Partially redeemed"));
  assert.ok(content.includes("Available to redeem now$5"));
});
