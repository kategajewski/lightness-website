import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import test from "node:test";

// Install @electric-sql/pglite locally or point this at a temporary installation.
const require = createRequire(process.env.HOLIDAY_SQL_TEST_MODULE_ROOT
  ? path.join(process.env.HOLIDAY_SQL_TEST_MODULE_ROOT, "package.json")
  : import.meta.url);
const { PGlite } = require("@electric-sql/pglite");
const sql = await readFile(new URL("../supabase/migrations/202611250001_holiday_promotional_vouchers.sql", import.meta.url), "utf8");
const db = new PGlite();
await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
// Supabase commonly grants broad privileges to these roles through defaults.
await db.exec("alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;");
await db.exec(sql);

async function issue(overrides = {}) {
  const suffix = randomUUID();
  const input = {
    campaign_id: "a-little-light-2026", checkout_session_id: `cs_test_${suffix}`,
    payment_intent_id: `pi_${suffix}`, paid_certificate_code: "LIGHT-1234-567890",
    code: `HOLIDAY-${randomBytes(12).toString("hex").toUpperCase()}`,
    purchaser_email: "synthetic@example.test", purchaser_name: "Synthetic Purchaser",
    purchased_amount_cents: 10000, face_value_cents: 1500, stripe_livemode: false,
    issued_at: new Date().toISOString(),
    valid_from: new Date(Date.now() - 3600000).toISOString(),
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    ...overrides,
  };
  const result = await db.query("select * from public.issue_holiday_voucher($1::jsonb)", [JSON.stringify(input)]);
  return { input, voucher: result.rows[0] };
}

async function redeem(voucher, overrides = {}) {
  const input = {
    requestId: randomUUID(), voucherId: voucher.id, amountCents: 500,
    serviceId: "private-reiki", serviceAt: new Date().toISOString(),
    bookingReference: randomUUID(), redeemedBy: "admin@example.test", recipientName: "Synthetic Recipient",
    hasOtherPromotion: false, allowedServices: ["private-reiki"], allowPartial: true,
    maxVouchersPerBooking: 1, serviceMustOccurDuringValidity: true, ...overrides,
  };
  const result = await db.query(`select * from public.redeem_holiday_voucher(
    $1::uuid,$2::uuid,$3::integer,$4::text,$5::timestamptz,$6::text,$7::text,$8::text,
    $9::boolean,$10::text[],$11::boolean,$12::integer,$13::boolean
  )`, Object.values(input));
  return { input, voucher: result.rows[0] };
}

async function refund(voucher, amount, overrides = {}) {
  const input = { eventId: `evt_${randomUUID()}`, paymentIntentId: voucher.payment_intent_id,
    stripeLivemode: voucher.stripe_livemode, cumulativeRefundedCents: amount,
    originalChargeAmountCents: voucher.purchased_amount_cents, campaignId: voucher.campaign_id, ...overrides };
  const result = await db.query("select * from public.adjust_holiday_vouchers_for_refund($1,$2,$3,$4,$5,$6)", Object.values(input));
  return { input, voucher: result.rows[0] };
}

async function restore(redemptionId, overrides = {}) {
  const input = { requestId: randomUUID(), redemptionId, policyEligible: true,
    policyReference: "Synthetic cancellation meets the existing policy", restoredBy: "admin@example.test", ...overrides };
  const result = await db.query("select * from public.restore_holiday_voucher_redemption($1,$2,$3,$4,$5)", Object.values(input));
  return { input, voucher: result.rows[0] };
}

async function redemptionId(voucher) {
  return (await db.query("select id from public.holiday_voucher_redemptions where voucher_id=$1 order by redeemed_at desc limit 1", [voucher.id])).rows[0].id;
}

test("SQL applies and one transaction issues one voucher plus one outbox row", async () => {
  const { input, voucher } = await issue();
  const retry = await issue({ ...input, code: `HOLIDAY-${randomBytes(12).toString("hex").toUpperCase()}` });
  assert.equal(retry.voucher.id, voucher.id);
  assert.equal(retry.voucher.code, voucher.code);
  assert.equal(retry.voucher.balance_cents, 1500);
  const outbox = await db.query("select * from public.holiday_voucher_email_outbox where voucher_id=$1", [voucher.id]);
  assert.equal(outbox.rows.length, 1);
  await assert.rejects(issue({ ...input, face_value_cents: 2500 }), /retry does not match/);
});

test("balance deductions are atomic, retries are idempotent and request IDs cannot change payload", async () => {
  const { voucher } = await issue();
  const first = await redeem(voucher);
  assert.equal(first.voucher.balance_cents, 1000);
  const retry = await redeem(voucher, first.input);
  assert.equal(retry.voucher.balance_cents, 1000);
  await assert.rejects(redeem(voucher, { ...first.input, amountCents: 501 }), /retry does not match/);
  await assert.rejects(redeem(voucher, { amountCents: 1001 }), /enough available/);
  const rows = await db.query("select * from public.holiday_voucher_redemptions where voucher_id=$1", [voucher.id]);
  assert.equal(rows.rows.length, 1);
  const other = await issue();
  await assert.rejects(redeem(other.voucher, { ...first.input, voucherId: other.voucher.id }), /retry does not match/);
});

test("redemption rejects missing policy, other promotions and ineligible services", async () => {
  const { voucher } = await issue();
  await assert.rejects(redeem(voucher, { allowedServices: [] }), /Approved voucher/);
  await assert.rejects(redeem(voucher, { hasOtherPromotion: true }), /other promotions/);
  await assert.rejects(redeem(voucher, { serviceId: "course" }), /not eligible/);
  await assert.rejects(redeem(voucher, { allowPartial: false }), /redeemed in full/);
  await assert.rejects(redeem(voucher, { amountCents: 0 }), /positive amount/);
});

test("redemption enforces validity, holds and the explicit appointment-date policy", async () => {
  const future = await issue({ valid_from: new Date(Date.now() + 60000).toISOString() });
  await assert.rejects(redeem(future.voucher), /not valid yet/);
  const expired = await issue({ valid_from: "2020-01-01T05:00:00Z", expires_at: "2020-04-01T04:00:00Z" });
  await assert.rejects(redeem(expired.voucher), /has expired/);
  const { voucher } = await issue();
  await assert.rejects(redeem(voucher, { serviceAt: null }), /session must take place/);
  await assert.rejects(redeem(voucher, { serviceAt: "2030-01-01T05:00:00Z" }), /session must take place/);
  const later = await redeem(voucher, { serviceAt: "2030-01-01T05:00:00Z", serviceMustOccurDuringValidity: false });
  assert.equal(later.voucher.balance_cents, 1000);
  await db.query("update public.holiday_vouchers set status='refund_review' where id=$1", [voucher.id]);
  await assert.rejects(redeem(voucher), /on hold or voided/);
});

test("one booking cannot use multiple vouchers when the approved maximum is one", async () => {
  const first = await issue();
  const second = await issue();
  const bookingReference = randomUUID();
  await redeem(first.voucher, { bookingReference });
  await assert.rejects(redeem(second.voucher, { bookingReference }), /maximum number/);
  const approvedMultiple = await redeem(second.voucher, { bookingReference, maxVouchersPerBooking: 2 });
  assert.equal(approvedMultiple.voucher.balance_cents, 1000);
});

test("email claims serialize retries, retain one provider receipt and block stale claim tokens", async () => {
  const { voucher } = await issue();
  const first = (await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim;
  assert.equal(first.claimed, true);
  assert.equal(first.amountCents, 1500);
  const busy = (await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim;
  assert.deepEqual(busy, { claimed: false, reason: "busy" });
  const invalid = await db.query("select public.complete_holiday_voucher_email($1,$2,$3) as saved", [voucher.id, randomUUID(), "fake-message"]);
  assert.equal(invalid.rows[0].saved, false);
  await db.query("select public.complete_holiday_voucher_email($1,$2,$3)", [voucher.id, first.claimToken, "provider-message-id"]);
  const sent = (await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim;
  assert.deepEqual(sent, { claimed: false, reason: "sent" });
});

test("ambiguous email attempts stop before the provider idempotency window expires", async () => {
  const { voucher } = await issue();
  await db.query("update public.holiday_voucher_email_outbox set initial_attempt_at=now()-interval '23 hours', status='failed' where voucher_id=$1", [voucher.id]);
  const claim = (await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim;
  assert.deepEqual(claim, { claimed: false, reason: "review" });
});

test("email delivery reflects refunds before first claim and freezes content for later provider retries", async () => {
  const { voucher } = await issue({ purchased_amount_cents: 50000, face_value_cents: 10000 });
  await refund(voucher, 25000);
  const first = (await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim;
  assert.equal(first.amountCents, 5000);
  await db.query("select public.fail_holiday_voucher_email($1,$2,$3,$4)", [voucher.id, first.claimToken, "Synthetic temporary timeout", false]);
  await refund(voucher, 36000);
  const retry = (await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim;
  assert.equal(retry.claimed, true);
  assert.equal(retry.amountCents, 5000);
  const current = (await db.query("select entitlement_cents from public.holiday_vouchers where id=$1", [voucher.id])).rows[0];
  assert.equal(current.entitlement_cents, 1500);
});

test("abandoned email claims retry within the provider window and failed receipts cannot overwrite newer claims", async () => {
  const { voucher } = await issue();
  const first = (await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim;
  await db.query("update public.holiday_voucher_email_outbox set claimed_at=now()-interval '6 minutes' where voucher_id=$1", [voucher.id]);
  const second = (await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim;
  assert.equal(second.claimed, true);
  assert.notEqual(second.claimToken, first.claimToken);
  const stale = (await db.query("select public.fail_holiday_voucher_email($1,$2,$3,$4) as saved", [voucher.id, first.claimToken, "stale failure", false])).rows[0].saved;
  assert.equal(stale, false);
  const saved = (await db.query("select public.fail_holiday_voucher_email($1,$2,$3,$4) as saved", [voucher.id, second.claimToken, "Ambiguous delivery requires review", true])).rows[0].saved;
  assert.equal(saved, true);
  const review = (await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim;
  assert.deepEqual(review, { claimed: false, reason: "review" });
});

test("paid value and issuance details are immutable and unprivileged users have no access", async () => {
  const { voucher } = await issue();
  await assert.rejects(db.query("update public.holiday_vouchers set face_value_cents=2000 where id=$1", [voucher.id]), /immutable/);
  await redeem(voucher);
  await assert.rejects(db.query("update public.holiday_vouchers set balance_cents=1500 where id=$1", [voucher.id]), /matching ledger entries/);
  await db.exec("set role anon");
  try {
    await assert.rejects(db.query("select * from public.holiday_vouchers"), /permission denied/);
    await assert.rejects(db.query("select public.claim_holiday_voucher_email($1)", [voucher.id]), /permission denied/);
  } finally { await db.exec("reset role"); }
  await db.exec("set role authenticated");
  try {
    await assert.rejects(db.query("select * from public.holiday_voucher_refund_adjustments"), /permission denied/);
    await assert.rejects(db.query("select public.issue_holiday_voucher('{}'::jsonb)"), /permission denied/);
  } finally { await db.exec("reset role"); }
  await db.exec("set role service_role");
  try {
    await assert.rejects(db.query("update public.holiday_vouchers set balance_cents=0 where id=$1", [voucher.id]), /permission denied/);
    const result = await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id]);
    assert.equal(result.rows[0].claim.claimed, true);
  } finally { await db.exec("reset role"); }
});

test("partial refunds recalculate the tier from retained value without changing original issued value", async () => {
  const { voucher } = await issue({ purchased_amount_cents: 50000, face_value_cents: 10000 });
  const partial = await refund(voucher, 25000);
  assert.equal(partial.voucher.face_value_cents, 10000);
  assert.equal(partial.voucher.entitlement_cents, 5000);
  assert.equal(partial.voucher.balance_cents, 5000);
  assert.equal(partial.voucher.amount_refunded_cents, 25000);
  assert.equal(partial.voucher.refund_review_required, false);
  const retry = await refund(voucher, 25000, partial.input);
  assert.equal(retry.voucher.balance_cents, 5000);
  const staleRetry = await refund(voucher, 20000, { ...partial.input, cumulativeRefundedCents: 20000 });
  assert.equal(staleRetry.voucher.entitlement_cents, 5000);
  const outOfOrder = await refund(voucher, 10000);
  assert.equal(outOfOrder.voucher.entitlement_cents, 5000);
  assert.equal(outOfOrder.voucher.amount_refunded_cents, 25000);
  const lowerTier = await refund(voucher, 36000);
  assert.equal(lowerTier.voucher.entitlement_cents, 1500);
  const noTier = await refund(voucher, 49000);
  assert.equal(noTier.voucher.entitlement_cents, 0);
  assert.equal(noTier.voucher.balance_cents, 0);
  const claim = (await db.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim;
  assert.deepEqual(claim, { claimed: false, reason: "held" });
});

test("refund entitlement uses all five exact tier boundaries and caps custom amounts above $500", async () => {
  for (const [kept, expectedBonus] of [
    [4999, 0], [5000, 500], [9999, 500], [10000, 1500], [14999, 1500],
    [15000, 2500], [24999, 2500], [25000, 5000], [49999, 5000], [50000, 10000], [55000, 10000],
  ]) {
    const { voucher } = await issue({ purchased_amount_cents: 60000, face_value_cents: 10000 });
    const adjusted = await refund(voucher, 60000 - kept);
    assert.equal(adjusted.voucher.entitlement_cents, expectedBonus, `retained amount ${kept}`);
    assert.equal(adjusted.voucher.balance_cents, expectedBonus);
  }
});

test("refunds hold excess redeemed credit for review and full refunds void remaining credit", async () => {
  const { voucher } = await issue({ purchased_amount_cents: 50000, face_value_cents: 10000 });
  await redeem(voucher, { amountCents: 7500 });
  const partial = await refund(voucher, 25000);
  assert.equal(partial.voucher.status, "refund_review");
  assert.equal(partial.voucher.refund_review_required, true);
  assert.equal(partial.voucher.balance_cents, 0);
  await assert.rejects(redeem(voucher), /on hold or voided/);
  const full = await refund(voucher, 50000);
  assert.equal(full.voucher.status, "voided");
  assert.equal(full.voucher.refund_review_required, true);
  assert.equal(full.voucher.balance_cents, 0);
  const unused = await issue();
  const fullUnused = await refund(unused.voucher, unused.voucher.purchased_amount_cents);
  assert.equal(fullUnused.voucher.status, "voided");
  assert.equal(fullUnused.voucher.refund_review_required, false);
});

test("refund adjustments verify mode and charge amount and do not touch unrelated paid purchases", async () => {
  const { voucher } = await issue();
  const wrongMode = await refund(voucher, 5000, { stripeLivemode: true });
  assert.equal(wrongMode.voucher, undefined);
  await assert.rejects(refund(voucher, 5000, { originalChargeAmountCents: 15000 }), /does not match/);
  await assert.rejects(refund(voucher, 10001), /verified Stripe charge/);
  const paidFields = (await db.query("select purchased_amount_cents,paid_certificate_code from public.holiday_vouchers where id=$1", [voucher.id])).rows[0];
  assert.equal(paidFields.purchased_amount_cents, 10000);
  assert.equal(paidFields.paid_certificate_code, "LIGHT-1234-567890");
});

test("replayed refund events reconcile newer current totals without losing older delivery idempotency", async () => {
  const { voucher } = await issue({ purchased_amount_cents: 50000, face_value_cents: 10000 });
  const first = await refund(voucher, 10000);
  assert.equal(first.voucher.entitlement_cents, 5000);
  const replayWithNewerCharge = await refund(voucher, 40000, { ...first.input, cumulativeRefundedCents: 40000 });
  assert.equal(replayWithNewerCharge.voucher.entitlement_cents, 1500);
  assert.equal(replayWithNewerCharge.voucher.amount_refunded_cents, 40000);
  const olderReplay = await refund(voucher, 10000, first.input);
  assert.equal(olderReplay.voucher.entitlement_cents, 1500);
  assert.equal(olderReplay.voucher.amount_refunded_cents, 40000);
  const events = (await db.query("select * from public.holiday_voucher_refund_adjustments where voucher_id=$1", [voucher.id])).rows;
  assert.equal(events.length, 1);
  assert.equal(events[0].cumulative_refunded_cents, 40000);
  await assert.rejects(refund(voucher, 40000, { ...first.input, paymentIntentId: "pi_wrong", cumulativeRefundedCents: 40000 }), /retry does not match/);
});

test("a refund seen before voucher issuance does not consume its event ID", async () => {
  const suffix = randomUUID();
  const paymentIntentId = `pi_${suffix}`;
  const eventId = `evt_${suffix}`;
  const before = await db.query("select * from public.adjust_holiday_vouchers_for_refund($1,$2,$3,$4,$5,$6)",
    [eventId, paymentIntentId, false, 5000, 10000, "a-little-light-2026"]);
  assert.equal(before.rows.length, 0);
  const { voucher } = await issue({ payment_intent_id: paymentIntentId });
  const after = await refund(voucher, 5000, { eventId });
  assert.equal(after.voucher.entitlement_cents, 500);
  assert.equal(after.voucher.amount_refunded_cents, 5000);
});

test("eligible cancellations restore once, preserve expiry and require policy attestation", async () => {
  const { voucher } = await issue();
  await redeem(voucher);
  const id = await redemptionId(voucher);
  await assert.rejects(restore(id, { policyEligible: false }), /existing cancellation policy/);
  await assert.rejects(restore(id, { policyReference: "" }), /existing cancellation policy/);
  const first = await restore(id);
  assert.equal(first.voucher.balance_cents, 1500);
  assert.equal(first.voucher.expires_at.toISOString(), voucher.expires_at.toISOString());
  const retry = await restore(id, first.input);
  assert.equal(retry.voucher.balance_cents, 1500);
  const duplicate = await restore(id);
  assert.equal(duplicate.voucher.balance_cents, 1500);
  const rows = await db.query("select * from public.holiday_voucher_redemption_reversals where voucher_id=$1", [voucher.id]);
  assert.equal(rows.rows.length, 1);
  assert.equal(rows.rows[0].restored_amount_cents, 500);
});

test("cancellation restoration cannot exceed refund-adjusted entitlement or reactivate a fully refunded voucher", async () => {
  const { voucher } = await issue({ purchased_amount_cents: 50000, face_value_cents: 10000 });
  await redeem(voucher, { amountCents: 7500 });
  const id = await redemptionId(voucher);
  await refund(voucher, 25000);
  const restored = await restore(id);
  assert.equal(restored.voucher.balance_cents, 5000);
  assert.equal(restored.voucher.status, "issued");
  assert.equal(restored.voucher.refund_review_required, false);
  const reversal = (await db.query("select * from public.holiday_voucher_redemption_reversals where redemption_id=$1", [id])).rows[0];
  assert.equal(reversal.reversed_amount_cents, 7500);
  assert.equal(reversal.restored_amount_cents, 5000);
  const full = await issue();
  await redeem(full.voucher);
  const fullId = await redemptionId(full.voucher);
  await refund(full.voucher, full.voucher.purchased_amount_cents);
  const stillVoid = await restore(fullId);
  assert.equal(stillVoid.voucher.status, "voided");
  assert.equal(stillVoid.voucher.balance_cents, 0);
  assert.equal(stillVoid.voucher.refund_review_required, false);
});

test.after(async () => db.close());
