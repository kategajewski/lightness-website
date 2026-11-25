import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

const source = ts.transpileModule(fs.readFileSync(new URL("../src/lib/holiday-gift-campaign.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = { exports: {}, process: { env: {} }, Date, Intl, URLSearchParams };
vm.runInNewContext(source, context);
const c = context.exports;
const settings = {
  enabled: true, launchedAt: "2026-11-25T00:00:00.000Z",
  rules: c.APPROVED_HOLIDAY_RULES,
};
const paidAt = Date.parse("2026-12-15T23:00:00-05:00") / 1000;
function paidSession(tier) {
  const body = new URLSearchParams();
  c.addHolidayCheckoutMetadata(body, { key: tier.optionKey, amountCents: tier.purchaseCents }, new Date("2026-12-10T12:00:00Z"), settings);
  const metadata = { purchaseType: "offer", offerSlug: "gift-certificate", optionKey: tier.optionKey };
  for (const [key, value] of body) if (key.startsWith("metadata[")) metadata[key.slice(9, -1)] = value;
  return { id: "cs_test_synthetic", status: "complete", payment_status: "paid", currency: "usd", payment_intent: "pi_test_synthetic", amount_total: tier.purchaseCents, amount_subtotal: tier.purchaseCents, total_details: { amount_discount: 0 }, metadata };
}

for (const tier of c.HOLIDAY_CAMPAIGN.tiers) {
  test(`$${tier.purchaseCents / 100} pays full face value and qualifies for separate $${tier.bonusCents / 100} voucher`, () => {
    const body = new URLSearchParams({ "line_items[0][price]": "price_untrusted_mapping" });
    assert.equal(c.addHolidayCheckoutMetadata(body, { key: tier.optionKey, amountCents: tier.purchaseCents }, new Date("2026-12-01"), settings), true);
    assert.equal(body.has("line_items[0][price]"), false);
    assert.equal(body.get("line_items[0][price_data][unit_amount]"), String(tier.purchaseCents));
    assert.equal(body.get("metadata[holidayBonusCents]"), String(tier.bonusCents));
    const result = c.qualifyHolidayPurchase(paidSession(tier), paidAt, settings);
    assert.equal(result.bonusCents, tier.bonusCents);
    assert.equal(result.purchaseCents, tier.purchaseCents);
  });
}

test("campaign launches explicitly and closes at midnight December 16 Eastern", () => {
  assert.equal(c.isHolidayCampaignActive(new Date("2026-11-24T23:59:59.999Z"), settings), false);
  assert.equal(c.isHolidayCampaignActive(new Date(settings.launchedAt), settings), true);
  assert.equal(c.isHolidayCampaignActive(new Date("2026-12-16T04:59:59.999Z"), settings), true);
  assert.equal(c.isHolidayCampaignActive(new Date("2026-12-16T05:00:00.000Z"), settings), false);
  assert.equal(c.isHolidayCampaignActive(new Date("2026-12-16T18:00:00Z"), settings), false);
});

test("disabled or unapproved campaign never advertises or stamps a checkout", () => {
  const now = new Date("2026-12-01");
  for (const override of [{ enabled: false }, { rules: null }, { launchedAt: "" }]) {
    assert.equal(c.isHolidayCampaignActive(now, { ...settings, ...override }), false);
    assert.equal(c.addHolidayCheckoutMetadata(new URLSearchParams(), { key: "gift-50", amountCents: 5000 }, now, { ...settings, ...override }), false);
  }
});

test("stale checkout pages after cutoff cannot create promotional eligibility", () => {
  const body = new URLSearchParams();
  assert.equal(c.addHolidayCheckoutMetadata(body, { key: "gift-500", amountCents: 50000 }, new Date("2026-12-16T05:00:00Z"), settings), false);
  assert.equal(body.has("metadata[holidayCampaignId]"), false);
});

test("verified payment initiation time governs eligibility when bank settlement happens later", () => {
  const session = paidSession(c.HOLIDAY_CAMPAIGN.tiers[0]);
  assert.ok(c.qualifyHolidayPurchase(session, Date.parse("2026-12-16T04:59:59Z") / 1000, settings));
  assert.equal(c.qualifyHolidayPurchase(session, Date.parse("2026-12-16T05:00:00Z") / 1000, settings), null);
});

test("completed unpaid snapshots can be recorded as initiation proof without issuing a voucher", () => {
  const session = { ...paidSession(c.HOLIDAY_CAMPAIGN.tiers[0]), payment_status: "unpaid" };
  const inspected = c.inspectHolidayCampaignOrder(session, settings);
  assert.equal(inspected.purchaseCents, 5000);
  assert.equal(inspected.bonusCents, 500);
  assert.equal(c.qualifyHolidayPurchase(session, paidAt, settings), null);
  assert.equal(c.inspectHolidayCampaignOrder({ ...session, status: "open", created: paidAt - 10000 }, settings), null);
});

test("completed proof after the deadline is retained for an explicit ineligible decision", () => {
  const session = paidSession(c.HOLIDAY_CAMPAIGN.tiers[0]);
  assert.ok(c.inspectHolidayCampaignOrder(session, settings));
  assert.equal(c.qualifyHolidayPurchase(session, Date.parse("2026-12-16T05:00:01Z") / 1000, settings), null);
});

test("checkout discloses the bank settlement exception without treating an open checkout as payment", () => {
  const body = new URLSearchParams();
  c.addHolidayCheckoutMetadata(body, { key: "gift-50", amountCents: 5000 }, new Date("2026-12-10"), settings);
  const text = body.get("custom_text[submit][message]");
  assert.match(text, /Initiate payment by December 15, 2026 at 11:59 PM Eastern/);
  assert.match(text, /Bank payments initiated by then qualify if settlement finishes later/);
  assert.match(text, /Opening a checkout alone does not qualify/);
  assert.ok(text.length <= 1200);
});

test("unpaid, discounted, wrong-currency and altered amount sessions do not qualify", () => {
  const session = paidSession(c.HOLIDAY_CAMPAIGN.tiers[1]);
  for (const override of [
    { payment_status: "unpaid" }, { payment_status: "no_payment_required" }, { status: "open" },
    { currency: "cad" }, { amount_total: 9999 }, { amount_subtotal: 5000 },
    { total_details: { amount_discount: 1 } }, { payment_intent: null },
    { metadata: { ...session.metadata, holidayBonusCents: "99999" } },
    { metadata: { ...session.metadata, holidayPurchaseCents: "1" } },
    { metadata: { ...session.metadata, holidayCampaignId: "another-campaign" } },
    { metadata: { ...session.metadata, holidayLaunchAt: "2026-01-01" } },
    { metadata: { ...session.metadata, offerSlug: "sound-training" } },
  ]) assert.equal(c.qualifyHolidayPurchase({ ...session, ...override }, paidAt, settings), null);
});

test("the existing $140 amount receives its approved $15 bonus", () => {
  assert.equal(c.holidayBonusForOption("gift-140", settings.rules), 1500);
  assert.equal(c.holidayBonusForOption("gift-custom", settings.rules), 0);
  const session = paidSession({ optionKey: "gift-140", purchaseCents: 14000 });
  assert.equal(c.qualifyHolidayPurchase(session, paidAt, settings).bonusCents, 1500);
});

test("custom amounts earn the highest transaction tier without rounding purchased cents", () => {
  for (const [total, bonus] of [
    [4999, 0], [5000, 500], [9999, 500], [10000, 1500], [14000, 1500],
    [14999, 1500], [15000, 2500], [24999, 2500], [25000, 5000],
    [49999, 5000], [50000, 10000], [100000, 10000],
  ]) assert.equal(c.holidayBonusForTotal(total), bonus, String(total));
  assert.equal(c.holidayBonusForTotal(5000.1), 0);
  assert.equal(c.holidayBonusForTotal(NaN), 0);
  assert.equal(c.formatHolidayMoney(12537), "$125.37");
  assert.equal(c.formatHolidayMoney(50), "$0.50");
  const session = paidSession({ optionKey: "gift-custom", purchaseCents: 12537 });
  const qualified = c.qualifyHolidayPurchase(session, paidAt, settings);
  assert.equal(qualified.purchaseCents, 12537);
  assert.equal(qualified.bonusCents, 1500);
});

test("multiple certificates earn one bonus from their combined full-value transaction", () => {
  for (const [key, unit, quantity, bonus] of [["gift-50", 5000, 2, 1500], ["gift-custom", 12537, 2, 5000], ["gift-500", 50000, 3, 10000]]) {
    const body = new URLSearchParams({ "line_items[0][quantity]": String(quantity) });
    assert.equal(c.addHolidayCheckoutMetadata(body, { key, amountCents: unit, purchaseCents: unit * quantity, quantity }, new Date("2026-12-01"), settings), true);
    assert.equal(body.get("line_items[0][price_data][unit_amount]"), String(unit));
    assert.equal(body.get("line_items[0][quantity]"), String(quantity));
    assert.equal(body.get("metadata[holidayBonusCents]"), String(bonus));
    const metadata = { purchaseType: "offer", offerSlug: "gift-certificate", optionKey: key };
    for (const [name, value] of body) if (name.startsWith("metadata[")) metadata[name.slice(9, -1)] = value;
    const session = { ...paidSession(c.HOLIDAY_CAMPAIGN.tiers[0]), metadata, amount_total: unit * quantity, amount_subtotal: unit * quantity };
    assert.equal(c.qualifyHolidayPurchase(session, paidAt, settings).bonusCents, bonus);
    assert.equal(c.qualifyHolidayPurchase({ ...session, amount_total: unit }, paidAt, settings), null);
    assert.equal(c.qualifyHolidayPurchase({ ...session, metadata: { ...metadata, giftQuantity: "1" } }, paidAt, settings), null);
  }
});

test("redemption boundaries follow Eastern Time before and after DST", () => {
  assert.equal(c.isHolidayVoucherDateValid(new Date("2027-01-01T04:59:59.999Z")), false);
  assert.equal(c.isHolidayVoucherDateValid(new Date("2027-01-01T05:00:00Z")), true);
  assert.equal(c.isHolidayVoucherDateValid(new Date("2027-04-01T03:59:59.999Z")), true);
  assert.equal(c.isHolidayVoucherDateValid(new Date("2027-04-01T04:00:00Z")), false);
});
