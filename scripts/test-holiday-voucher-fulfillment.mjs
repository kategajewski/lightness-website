import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createHash, randomBytes } from "node:crypto";
import { test } from "node:test";
import ts from "typescript";

function loadTs(relative, dependencies = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(relative, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, Date, Intl, URLSearchParams, console: { error() {} },
    require(name) {
      if (name === "server-only") return {};
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
      return dependencies[name];
    }, ...globals };
  vm.runInNewContext(source, context, { filename: relative });
  return context.exports;
}

const campaignEnv = { HOLIDAY_GIFT_CAMPAIGN_ENABLED: "true", HOLIDAY_GIFT_CAMPAIGN_LAUNCHED_AT: "2026-11-25T00:00:00.000Z" };
class DeliveryDate extends Date {
  constructor(value) { super(value === undefined ? "2027-01-15T12:00:00.000Z" : value); }
  static now() { return Date.parse("2027-01-15T12:00:00.000Z"); }
}
const campaign = loadTs("../src/lib/holiday-gift-campaign.ts", {}, { process: { env: campaignEnv }, Date: DeliveryDate });
const paidEventTime = Date.parse("2026-12-10T12:01:00.000Z") / 1000;
const certificateCode = (id, index) => `LIGHT-${createHash("sha256").update(index === undefined ? id : `${id}:gift:${index}`).digest("hex").slice(0, 10).toUpperCase()}`;

function paidSession(tier = campaign.HOLIDAY_CAMPAIGN.tiers[0], overrides = {}) {
  const optionKey = tier.optionKey;
  const total = tier.purchaseCents;
  const body = new URLSearchParams();
  campaign.addHolidayCheckoutMetadata(body, { key: optionKey, amountCents: total }, new Date("2026-12-01T12:00:00Z"));
  const metadata = { purchaseType: "offer", offerSlug: "gift-certificate", optionKey };
  for (const [key, value] of body) if (key.startsWith("metadata[")) metadata[key.slice(9, -1)] = value;
  return {
    id: `cs_test_${optionKey}`, status: "complete", payment_status: "paid", currency: "usd",
    amount_total: total, amount_subtotal: total, total_details: { amount_discount: 0 },
    payment_intent: `pi_test_${optionKey}`, livemode: false,
    customer_details: { email: "synthetic-buyer@example.invalid", name: "Synthetic Buyer" },
    metadata, ...overrides,
  };
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

/** Mock the transactional store contract; the companion SQL suite tests its real locking. */
function harness(inputSession = paidSession(), { payment = {}, charge = {}, deliveryFailures = 0, emailConfigured = true } = {}) {
  const vouchers = new Map();
  const initiations = new Map();
  const initiationReceipts = new Map();
  const initiationInputs = [];
  const outboxes = new Map();
  const issueInputs = [];
  const refundInputs = [];
  const emailAttempts = [];
  const providerDeliveries = new Map();
  const errors = [];
  const h = { vouchers, initiations, initiationReceipts, initiationInputs, outboxes, issueInputs, refundInputs, emailAttempts, providerDeliveries, errors,
    currentSession: structuredClone(inputSession), initiationSaveFailures: 0, confirmationCalls: 0, originalCertificateDeliveries: 0,
    deliveryFailures, blockDelivery: null, deliveryStarted: deferred(), confirmation: { customerEmail: "sent", ownerEmail: "sent" } };
  const paymentRecord = { id: inputSession.payment_intent, status: "succeeded", currency: "usd", amount: inputSession.amount_total,
    amount_received: inputSession.amount_total, livemode: false, latest_charge: "ch_test_synthetic", ...payment };
  const chargeRecord = { id: "ch_test_synthetic", amount: inputSession.amount_total, amount_refunded: 0,
    livemode: false, payment_intent: inputSession.payment_intent, ...charge };
  h.charge = chargeRecord;
  h.payment = paymentRecord;
  const stripe = {
    checkout: { sessions: { retrieve: async (id) => { assert.equal(id, inputSession.id); return h.currentSession; } } },
    paymentIntents: { retrieve: async (id) => { assert.equal(id, inputSession.payment_intent); return paymentRecord; } },
    charges: { retrieve: async (id) => { assert.equal(id, chargeRecord.id); return chargeRecord; } },
    webhooks: { constructEvent(payload, signature, secret) {
      if (signature !== "synthetic-valid-signature" || secret !== "synthetic-secret") throw new Error("Synthetic invalid signature");
      return JSON.parse(payload);
    } },
  };
  const initiationStore = {
    async recordHolidayPaymentInitiation(input) {
      initiationInputs.push(input);
      if (h.initiationSaveFailures > 0) { h.initiationSaveFailures -= 1; throw new Error("Synthetic database outage"); }
      const record = { campaign_id: input.campaignId, checkout_session_id: input.checkoutSessionId,
        payment_intent_id: input.paymentIntentId, stripe_livemode: input.stripeLivemode,
        purchase_amount_cents: input.purchaseAmountCents, currency: input.currency, initiated_at: input.initiatedAt,
        completed_event_id: input.completedEventId, event_type: input.eventType, holiday_launch_at: input.holidayLaunchAt };
      const key = `${input.campaignId}:${input.checkoutSessionId}`;
      if (initiationReceipts.has(record.completed_event_id)) {
        assert.deepEqual(initiationReceipts.get(record.completed_event_id), record, "The same signed event cannot change its payload");
      } else initiationReceipts.set(record.completed_event_id, record);
      if (initiations.has(key)) {
        const financialIdentity = (proof) => {
          const identity = { ...proof };
          delete identity.initiated_at;
          delete identity.completed_event_id;
          return identity;
        };
        assert.deepEqual(financialIdentity(initiations.get(key)), financialIdentity(record), "A receipt cannot change financial identity");
        if (Date.parse(record.initiated_at) < Date.parse(initiations.get(key).initiated_at)) initiations.set(key, record);
      } else initiations.set(key, record);
      return { ...initiations.get(key) };
    },
    async getHolidayPaymentInitiation(campaignId, sessionId) {
      const record = initiations.get(`${campaignId}:${sessionId}`);
      return record ? { ...record } : null;
    },
  };
  const store = {
    async issueHolidayVoucher(input) {
      issueInputs.push(input);
      const key = `${input.campaign_id}:${input.checkout_session_id}`;
      if (vouchers.has(key)) return { ...vouchers.get(key) };
      const voucher = { ...input, id: `voucher-${vouchers.size + 1}`, code: "HOLIDAY-000000000000000000000001",
        entitlement_cents: input.face_value_cents, balance_cents: input.face_value_cents, status: "issued" };
      vouchers.set(key, voucher);
      outboxes.set(voucher.id, { status: "pending", attempts: 0, amountCents: voucher.face_value_cents });
      return { ...voucher };
    },
    async adjustHolidayVouchersForRefund(input) {
      refundInputs.push(input);
      const voucher = [...vouchers.values()].find((item) => item.payment_intent_id === input.paymentIntentId && item.stripe_livemode === input.stripeLivemode);
      if (!voucher) return [];
      const retained = voucher.purchased_amount_cents - input.cumulativeRefundedCents;
      voucher.entitlement_cents = Math.min(voucher.face_value_cents, campaign.holidayBonusForTotal(retained));
      voucher.balance_cents = voucher.entitlement_cents;
      voucher.status = retained === 0 ? "voided" : "issued";
      const outbox = outboxes.get(voucher.id);
      if (outbox.attempts === 0) outbox.amountCents = voucher.entitlement_cents;
      return [{ ...voucher }];
    },
    async claimHolidayVoucherEmail(id) {
      const outbox = outboxes.get(id);
      if (outbox.status === "sent") return { claimed: false, reason: "sent" };
      if (outbox.status === "sending") return { claimed: false, reason: "busy" };
      if (outbox.status === "review") return { claimed: false, reason: "review" };
      const voucher = [...vouchers.values()].find((item) => item.id === id);
      if (voucher.status !== "issued" || voucher.entitlement_cents === 0) return { claimed: false, reason: "held" };
      outbox.status = "sending";
      outbox.attempts += 1;
      outbox.claimToken = `claim-${outbox.attempts}`;
      return { claimed: true, claimToken: outbox.claimToken, amountCents: outbox.amountCents };
    },
    async completeHolidayVoucherEmail(id, token, providerId) {
      const outbox = outboxes.get(id);
      assert.equal(outbox.claimToken, token);
      outbox.status = "sent";
      outbox.providerId = providerId;
    },
    async failHolidayVoucherEmail(id, token, message) {
      const outbox = outboxes.get(id);
      assert.equal(outbox.claimToken, token);
      outbox.status = "failed";
      errors.push(message);
    },
  };
  const email = {
    canSendHolidayVoucherEmail: () => emailConfigured,
    async sendHolidayVoucherEmail(input) {
      emailAttempts.push(input);
      h.deliveryStarted.resolve();
      if (h.blockDelivery) await h.blockDelivery.promise;
      if (h.deliveryFailures > 0) { h.deliveryFailures -= 1; throw new Error("Synthetic provider outage"); }
      if (!providerDeliveries.has(input.voucherId)) providerDeliveries.set(input.voucherId, { ...input });
      return { providerId: `provider-${input.voucherId}` };
    },
  };
  const fulfillment = loadTs("../src/lib/holiday-voucher-fulfillment.ts", {
    "@/lib/gift-certificates": { createGiftCertificateCode: certificateCode },
    "@/lib/holiday-gift-campaign": campaign,
    "@/lib/holiday-payment-initiation-store": initiationStore,
    "@/lib/holiday-voucher-store": store,
    "@/lib/holiday-voucher-email": email,
    "@/lib/stripe/server": { getStripe: async () => stripe },
  }, { Date: DeliveryDate });
  const route = loadTs("../src/app/api/stripe/webhook/route.ts", {
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    "@/lib/env": { env: { stripeWebhookSecret: "synthetic-secret" } },
    "@/lib/checkout-confirmation": { processCheckoutSessionConfirmation: async () => {
      h.confirmationCalls += 1;
      if (h.confirmation.customerEmail === "sent") h.originalCertificateDeliveries += 1;
      return h.confirmation;
    } },
    "@/lib/invoice-confirmation": { processInvoiceConfirmation: async () => {} },
    "@/lib/holiday-voucher-fulfillment": fulfillment,
    "@/lib/stripe/server": { getStripe: async () => stripe },
  });
  h.fulfillment = fulfillment;
  h.event = (session = inputSession, overrides = {}) => ({ id: "evt_test_synthetic", created: paidEventTime,
    type: "checkout.session.completed", data: { object: session }, ...overrides });
  h.post = (event = h.event(), signature = "synthetic-valid-signature") => route.POST(new Request("https://example.invalid/api/stripe/webhook", {
    method: "POST", headers: signature ? { "stripe-signature": signature } : {}, body: JSON.stringify(event),
  }));
  return h;
}

for (const tier of campaign.HOLIDAY_CAMPAIGN.tiers) {
  test(`verified $${tier.purchaseCents / 100} payment issues and separately emails exactly one $${tier.bonusCents / 100} voucher`, async () => {
    const session = paidSession(tier);
    const h = harness(session);
    assert.equal((await h.post()).status, 200);
    assert.equal(h.vouchers.size, 1);
    const issued = h.issueInputs[0];
    assert.equal(issued.purchased_amount_cents, tier.purchaseCents);
    assert.equal(issued.face_value_cents, tier.bonusCents);
    assert.equal(issued.purchaser_email, session.customer_details.email);
    assert.equal(issued.paid_certificate_code, certificateCode(session.id));
    assert.equal(issued.valid_from, campaign.HOLIDAY_CAMPAIGN.validFrom);
    assert.equal(issued.expires_at, campaign.HOLIDAY_CAMPAIGN.expiresAt);
    assert.equal(h.emailAttempts.length, 1);
    assert.equal(h.emailAttempts[0].amountCents, tier.bonusCents);
    assert.equal(h.providerDeliveries.size, 1);
    assert.equal((await h.post()).status, 200);
    assert.equal(h.vouchers.size, 1);
    assert.equal(h.emailAttempts.length, 1);
  });
}

test("concurrent webhook deliveries converge on one voucher and one email claim", async () => {
  const h = harness();
  h.blockDelivery = deferred();
  const first = h.post();
  await h.deliveryStarted.promise;
  assert.equal((await h.post()).status, 500);
  assert.equal(h.vouchers.size, 1);
  assert.equal(h.emailAttempts.length, 1);
  h.blockDelivery.resolve();
  assert.equal((await first).status, 200);
  assert.equal((await h.post()).status, 200);
  assert.equal(h.providerDeliveries.size, 1);
  assert.equal(h.emailAttempts.length, 1);
});

test("the processor must confirm a succeeded payment for the full purchased USD value", async () => {
  for (const payment of [{ status: "processing" }, { status: "canceled" }, { currency: "cad" }, { livemode: true }, { amount: 4999 }, { amount_received: 4999 }]) {
    const h = harness(paidSession(), { payment });
    assert.equal((await h.post()).status, 500);
    assert.equal(h.vouchers.size, 0);
    assert.equal(h.emailAttempts.length, 0);
  }
});

test("late delivery uses signed initiation time while issuance records the actual processing time", async () => {
  assert.ok(DeliveryDate.now() > Date.parse(campaign.HOLIDAY_CAMPAIGN.purchaseEndsAt));
  const h = harness();
  const timely = h.event(undefined, { created: Date.parse("2026-12-16T04:59:59Z") / 1000 });
  assert.equal((await h.post(timely)).status, 200);
  assert.equal(h.vouchers.size, 1);
  assert.equal(h.initiationInputs[0].initiatedAt, "2026-12-16T04:59:59.000Z");
  assert.equal(h.issueInputs[0].issued_at, "2027-01-15T12:00:00.000Z");
  const late = harness();
  assert.equal((await late.post(late.event(undefined, { created: Date.parse("2026-12-16T05:00:00Z") / 1000 }))).status, 200);
  assert.equal(late.vouchers.size, 0);
  assert.equal(late.initiations.size, 1);
});

test("an unpaid checkout waits for its asynchronous successful-payment event", async () => {
  const paid = paidSession();
  const h = harness(paid);
  const unpaid = { ...paid, payment_status: "unpaid" };
  h.currentSession = unpaid;
  h.confirmation = { customerEmail: "skipped", ownerEmail: "skipped", paymentStatus: "pending" };
  assert.equal((await h.post(h.event(unpaid))).status, 200);
  assert.equal(h.vouchers.size, 0);
  assert.equal(h.initiations.size, 1);
  h.currentSession = paid;
  h.confirmation = { customerEmail: "sent", ownerEmail: "sent", paymentStatus: "paid" };
  assert.equal((await h.post(h.event(paid, { id: "evt_test_async", type: "checkout.session.async_payment_succeeded" }))).status, 200);
  assert.equal(h.vouchers.size, 1);
});

const beforeCutoff = Date.parse("2026-12-16T04:59:59.000Z") / 1000;
const afterCutoff = Date.parse("2026-12-18T12:00:00.000Z") / 1000;

test("bank settlement after the deadline qualifies from durable timely initiation and sends once", async () => {
  const paid = paidSession();
  const pending = { ...paid, payment_status: "unpaid" };
  const h = harness(paid);
  h.currentSession = pending;
  h.confirmation = { customerEmail: "skipped", ownerEmail: "skipped", paymentStatus: "pending" };
  const completed = h.event(pending, { created: beforeCutoff });
  assert.equal((await h.post(completed)).status, 200);
  assert.equal(h.initiations.size, 1);
  assert.equal(h.vouchers.size, 0);
  assert.equal(h.emailAttempts.length, 0);
  h.currentSession = paid;
  h.confirmation = { customerEmail: "sent", ownerEmail: "sent", paymentStatus: "paid" };
  const settled = h.event(paid, { id: "evt_test_settled_later", type: "checkout.session.async_payment_succeeded", created: afterCutoff });
  assert.equal((await h.post(settled)).status, 200);
  assert.equal((await h.post(settled)).status, 200);
  assert.equal(h.vouchers.size, 1);
  assert.equal(h.emailAttempts.length, 1);
  assert.equal(h.initiationInputs.length, 1);
  assert.equal([...h.initiations.values()][0].initiated_at, "2026-12-16T04:59:59.000Z");
});

test("opening a checkout before the cutoff cannot qualify a payment initiated afterward", async () => {
  const paid = paidSession(undefined, { created: beforeCutoff - 3600 });
  // A metadata hint from a browser cannot replace the signed completed-event timestamp.
  paid.metadata.paymentInitiatedAt = "2026-12-15T23:00:00-05:00";
  const pending = { ...paid, payment_status: "unpaid" };
  const h = harness(paid);
  h.currentSession = pending;
  h.confirmation = { customerEmail: "skipped", ownerEmail: "skipped", paymentStatus: "pending" };
  const lateCompletion = h.event(pending, { created: beforeCutoff + 1 });
  assert.equal((await h.post(lateCompletion)).status, 200);
  assert.equal((await h.post(lateCompletion)).status, 200);
  assert.equal(h.initiations.size, 1);
  assert.equal([...h.initiations.values()][0].initiated_at, "2026-12-16T05:00:00.000Z");
  h.currentSession = paid;
  h.confirmation = { customerEmail: "sent", ownerEmail: "sent", paymentStatus: "paid" };
  assert.equal((await h.post(h.event(paid, { id: "evt_test_late_settlement", type: "checkout.session.async_payment_succeeded", created: afterCutoff }))).status, 200);
  assert.equal(h.vouchers.size, 0);
  assert.equal(h.emailAttempts.length, 0);
  assert.equal(h.confirmationCalls, 3, "The original paid certificate still uses the existing confirmation process");
});

test("out-of-order bank success retries until completed proof arrives and reconciles current paid state", async () => {
  const paid = paidSession();
  const pendingSnapshot = { ...paid, payment_status: "unpaid" };
  const h = harness(paid);
  const settledFirst = h.event(paid, { id: "evt_test_async_first", type: "checkout.session.async_payment_succeeded", created: afterCutoff });
  assert.equal((await h.post(settledFirst)).status, 500);
  assert.equal(h.initiations.size, 0);
  assert.equal(h.vouchers.size, 0);
  assert.equal(h.confirmationCalls, 1);
  assert.equal(h.originalCertificateDeliveries, 1);
  h.confirmation = { customerEmail: "already_sent", ownerEmail: "already_sent", paymentStatus: "paid" };
  // The completed snapshot is unpaid but Stripe's current session has already settled.
  assert.equal((await h.post(h.event(pendingSnapshot, { created: beforeCutoff }))).status, 200);
  assert.equal(h.vouchers.size, 1);
  assert.equal((await h.post(settledFirst)).status, 200);
  assert.equal(h.emailAttempts.length, 1);
  assert.equal(h.originalCertificateDeliveries, 1);
});

test("distinct completed Event IDs converge on earliest authenticated initiation without another voucher or email", async () => {
  const paid = paidSession();
  const h = harness(paid);
  // A later duplicate arrives first and cannot establish predeadline eligibility.
  assert.equal((await h.post(h.event(paid, { id: "evt_test_late_duplicate_first", created: afterCutoff }))).status, 200);
  assert.equal(h.vouchers.size, 0);
  h.confirmation = { customerEmail: "already_sent", ownerEmail: "already_sent", paymentStatus: "paid" };
  assert.equal((await h.post(h.event(paid, { id: "evt_test_actual_earlier_completion", created: beforeCutoff }))).status, 200);
  assert.equal(h.vouchers.size, 1);
  assert.equal(h.emailAttempts.length, 1);
  assert.equal([...h.initiations.values()][0].completed_event_id, "evt_test_actual_earlier_completion");
  assert.equal([...h.initiations.values()][0].initiated_at, "2026-12-16T04:59:59.000Z");
  assert.equal((await h.post(h.event(paid, { id: "evt_test_another_late_duplicate", created: afterCutoff + 60 }))).status, 200);
  assert.equal(h.initiationReceipts.size, 3);
  assert.equal(h.initiations.size, 1);
  assert.equal(h.vouchers.size, 1);
  assert.equal(h.emailAttempts.length, 1);
});

test("unpaid completed snapshots cannot bypass original certificate delivery once the current session is paid", async () => {
  for (const customerEmail of ["skipped", "failed"]) {
    const paid = paidSession();
    const h = harness(paid);
    h.confirmation = { customerEmail, ownerEmail: "sent", paymentStatus: "pending" };
    const event = h.event({ ...paid, payment_status: "unpaid" }, { created: beforeCutoff });
    assert.equal((await h.post(event)).status, 500);
    assert.equal(h.initiations.size, 1);
    assert.equal(h.vouchers.size, 0);
    h.confirmation = { customerEmail: "already_sent", ownerEmail: "already_sent", paymentStatus: "paid" };
    assert.equal((await h.post(event)).status, 200);
    assert.equal(h.vouchers.size, 1);
  }
});

test("proof storage failure delivers the original certificate and retries only the complimentary fulfillment", async () => {
  const h = harness();
  h.initiationSaveFailures = 1;
  assert.equal((await h.post()).status, 500);
  assert.equal(h.initiations.size, 0);
  assert.equal(h.confirmationCalls, 1);
  assert.equal(h.originalCertificateDeliveries, 1);
  assert.equal(h.emailAttempts.length, 0);
  h.confirmation = { customerEmail: "already_sent", ownerEmail: "already_sent", paymentStatus: "paid" };
  assert.equal((await h.post()).status, 200);
  assert.equal(h.initiations.size, 1);
  assert.equal(h.vouchers.size, 1);
  assert.equal(h.originalCertificateDeliveries, 1);
  assert.equal(h.emailAttempts.length, 1);
});

test("settlement must match the stored session, intent, mode, amount and campaign launch", async () => {
  const mutations = [
    (session) => { session.payment_intent = "pi_test_another"; },
    (session) => { session.livemode = true; },
    (session) => { session.currency = "cad"; },
    (session) => { session.metadata.holidayLaunchAt = "2026-11-01T00:00:00.000Z"; },
    (session) => { session.amount_total -= 1; },
  ];
  for (const mutate of mutations) {
    const paid = paidSession();
    const pending = { ...paid, payment_status: "unpaid" };
    const h = harness(paid);
    h.currentSession = pending;
    assert.equal((await h.post(h.event(pending, { created: beforeCutoff }))).status, 200);
    h.currentSession = structuredClone(paid);
    mutate(h.currentSession);
    assert.equal((await h.post(h.event(paid, { id: "evt_test_binding", type: "checkout.session.async_payment_succeeded", created: afterCutoff }))).status, 500);
    assert.equal(h.vouchers.size, 0);
  }
});

test("bank success without any completion evidence never falls back to session.created", async () => {
  const paid = paidSession(undefined, { created: beforeCutoff - 86400 });
  const h = harness(paid);
  assert.equal((await h.post(h.event(paid, { type: "checkout.session.async_payment_succeeded", created: afterCutoff }))).status, 500);
  assert.equal(h.initiations.size, 0);
  assert.equal(h.vouchers.size, 0);
});

test("an async success whose current checkout is not yet paid remains retryable", async () => {
  const paid = paidSession();
  const pending = { ...paid, payment_status: "unpaid" };
  const h = harness(paid);
  h.currentSession = pending;
  assert.equal((await h.post(h.event(pending, { created: beforeCutoff }))).status, 200);
  assert.equal((await h.post(h.event(paid, { id: "evt_test_stale_current", type: "checkout.session.async_payment_succeeded", created: afterCutoff }))).status, 500);
  assert.equal(h.vouchers.size, 0);
});

test("a refund arriving before issuance is re-read before any voucher email is sent", async () => {
  const session = paidSession(campaign.HOLIDAY_CAMPAIGN.tiers[3]);
  const h = harness(session, { charge: { amount_refunded: session.amount_total } });
  assert.equal((await h.post(h.event(undefined, { id: "evt_refund_first", type: "charge.refunded", data: { object: { id: h.charge.id } } }))).status, 200);
  assert.equal(h.vouchers.size, 0);
  assert.equal((await h.post()).status, 200);
  assert.equal(h.vouchers.size, 1);
  const voucher = [...h.vouchers.values()][0];
  assert.equal(voucher.status, "voided");
  assert.equal(voucher.balance_cents, 0);
  assert.equal(h.emailAttempts.length, 0);
});

test("a partial refund before the first email delivers the reduced qualifying entitlement", async () => {
  const session = paidSession(campaign.HOLIDAY_CAMPAIGN.tiers[3]);
  const h = harness(session, { charge: { amount_refunded: 5000 } });
  assert.equal((await h.post()).status, 200);
  assert.equal(h.issueInputs[0].face_value_cents, 5000);
  assert.equal([...h.vouchers.values()][0].balance_cents, 2500);
  assert.equal(h.emailAttempts[0].amountCents, 2500);
});

test("provider failure remains retryable without another voucher or a false sent marker", async () => {
  const h = harness(paidSession(), { deliveryFailures: 1 });
  assert.equal((await h.post()).status, 500);
  assert.equal(h.vouchers.size, 1);
  assert.equal([...h.outboxes.values()][0].status, "failed");
  assert.equal(h.providerDeliveries.size, 0);
  assert.equal((await h.post()).status, 200);
  assert.equal(h.vouchers.size, 1);
  assert.equal(h.emailAttempts.length, 2);
  assert.equal(h.emailAttempts[0].voucherId, h.emailAttempts[1].voucherId);
  assert.equal(h.emailAttempts[0].amountCents, h.emailAttempts[1].amountCents);
  assert.equal([...h.outboxes.values()][0].status, "sent");
  assert.equal(h.providerDeliveries.size, 1);
});

test("missing email configuration fails the webhook for retry", async () => {
  const h = harness(paidSession(), { emailConfigured: false });
  assert.equal((await h.post()).status, 500);
  assert.equal(h.emailAttempts.length, 0);
  assert.equal([...h.outboxes.values()][0].status, "pending");
});

test("failed or skipped paid certificate delivery cannot silently complete the campaign purchase", async () => {
  for (const customerEmail of ["failed", "skipped"]) {
    const h = harness();
    h.confirmation = { customerEmail, ownerEmail: "sent" };
    assert.equal((await h.post()).status, 500, customerEmail);
    assert.equal(h.vouchers.size, 0);
    assert.equal(h.emailAttempts.length, 0);
    assert.equal(h.initiations.size, 1);
  }
});

test("unverified webhook payloads cannot issue a voucher or send an email", async () => {
  for (const signature of ["", "synthetic-invalid-signature"]) {
    const h = harness();
    assert.equal((await h.post(undefined, signature)).status, 400);
    assert.equal(h.vouchers.size, 0);
    assert.equal(h.emailAttempts.length, 0);
    assert.equal(h.initiations.size, 0);
  }
});

test("refund storage supplies the canonical issuance campaign to its SQL function", async () => {
  const calls = [];
  const store = loadTs("../src/lib/holiday-voucher-store.ts", {
    "node:crypto": { randomBytes },
    "@/lib/holiday-gift-campaign": campaign,
    "@/lib/supabase/admin": { createSupabaseAdminClient: () => ({ rpc: async (name, input) => {
      calls.push({ name, input });
      return { data: [], error: null };
    } }) },
  });
  await store.adjustHolidayVouchersForRefund({ eventId: "evt_test_refund", paymentIntentId: "pi_test_synthetic",
    stripeLivemode: false, cumulativeRefundedCents: 500, originalChargeAmountCents: 5000 });
  assert.equal(calls[0].name, "adjust_holiday_vouchers_for_refund");
  assert.equal(calls[0].input.p_campaign_id, campaign.HOLIDAY_CAMPAIGN.id);
});
