import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadTs(relative, dependencies = {}, globals = {}) {
  const output = ts.transpileModule(fs.readFileSync(new URL(relative, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const context = { exports: {}, Buffer, URL, URLSearchParams, Intl, Date, console,
    require(name) { return Object.hasOwn(dependencies, name) ? dependencies[name] : require(name); }, ...globals };
  // Keep objects in the host realm for pdf-lib's strict native type checks.
  new Function(...Object.keys(context), output)(...Object.values(context));
  return context.exports;
}
const order = loadTs("../src/lib/holiday-gift-order.ts");
const options = [50, 100, 140, 150, 250, 500].map((amount) => ({ key: `gift-${amount}`, amountCents: amount * 100 }));
const settings = { campaignActive: true, options };

test("decimal custom amounts retain exact purchased cents", () => {
  for (const [input, cents] of [["0.01", 1], ["0.10", 10], ["125.37", 12537], ["250", 25000], [" 050.5 ", 5050]]) {
    assert.equal(order.parseGiftAmountCents(input), cents);
  }
  const result = order.parseHolidayGiftOrder({ optionKey: "gift-custom", customAmount: "125.37", quantity: "2" }, settings);
  assert.equal(result.unitAmountCents, 12537);
  assert.equal(result.totalAmountCents, 25074);
});

test("malformed amounts and quantities never silently round or truncate", () => {
  for (const amount of ["", "0", "-50", "+50", "1e2", "50.001", "50usd", "5,000", "Infinity", "NaN", "999999.999", "1000000"]) {
    assert.equal(order.parseGiftAmountCents(amount), null, amount);
  }
  for (const quantity of ["", "0", "-1", "1.5", "1e2", "2x", "01", "101", "Infinity"]) {
    assert.equal(order.parseHolidayGiftOrder({ optionKey: "gift-50", quantity }, settings), null, quantity);
  }
  assert.equal(order.parseHolidayGiftOrder({ optionKey: "gift-custom", customAmount: "999999.99", quantity: "2" }, settings), null);
});

test("listed amounts, quantity and custom fields are validated together", () => {
  for (const option of options) {
    const result = order.parseHolidayGiftOrder({ optionKey: option.key, quantity: "3" }, settings);
    assert.equal(result.unitAmountCents, option.amountCents);
    assert.equal(result.totalAmountCents, option.amountCents * 3);
  }
  assert.equal(order.parseHolidayGiftOrder({ optionKey: "gift-fake", quantity: "1" }, settings), null);
  assert.equal(order.parseHolidayGiftOrder({ optionKey: "gift-50", customAmount: "500" }, settings), null);
});

test("Stripe's 50-cent minimum applies to the total while individual certificates may be smaller", () => {
  assert.equal(order.parseHolidayGiftOrder({ optionKey: "gift-custom", customAmount: "0.49" }, settings), null);
  assert.equal(order.parseHolidayGiftOrder({ optionKey: "gift-custom", customAmount: "0.01", quantity: "49" }, settings), null);
  const orderAtMinimum = order.parseHolidayGiftOrder({ optionKey: "gift-custom", customAmount: "0.01", quantity: "50" }, settings);
  assert.equal(orderAtMinimum.unitAmountCents, 1);
  assert.equal(orderAtMinimum.totalAmountCents, 50);
  assert.equal(order.parseHolidayGiftOrder({ optionKey: "gift-custom", customAmount: "0.50" }, settings).totalAmountCents, 50);
});

test("campaign expiration rejects stale custom and multiple orders while retaining normal amounts", () => {
  const expired = { ...settings, campaignActive: false };
  assert.equal(order.parseHolidayGiftOrder({ optionKey: "gift-custom", customAmount: "100" }, expired), null);
  assert.equal(order.parseHolidayGiftOrder({ optionKey: "gift-100", quantity: "2" }, expired), null);
  assert.equal(order.parseHolidayGiftOrder({ optionKey: "gift-140" }, expired).totalAmountCents, 14000);
});

test("fulfillment trusts a consistent payment snapshot independent of campaign expiration", () => {
  const metadata = { giftUnitAmountCents: "12537", giftQuantity: "2", giftTotalAmountCents: "25074" };
  assert.equal(order.giftOrderFromMetadata(metadata, 25074).unitAmountCents, 12537);
  assert.equal(order.giftOrderFromMetadata({}, 5000), null);
  for (const modified of [
    { ...metadata, giftQuantity: "3" }, { ...metadata, giftQuantity: undefined },
    { ...metadata, giftTotalAmountCents: "1" }, { ...metadata, giftUnitAmountCents: "12537x" },
  ]) assert.throws(() => order.giftOrderFromMetadata(modified, 25074));
  assert.throws(() => order.giftOrderFromMetadata(metadata, 12537));
});

function checkoutHarness(active = true) {
  const requests = [];
  const stamps = [];
  const offer = { slug: "gift-certificate", name: "Gift Certificate", format: "one_time", purchaseOptions: options };
  const route = loadTs("../src/app/api/checkout/route.ts", {
    "next/server": { NextResponse: { redirect: (location, { status }) => ({ location, status }) } },
    "@/lib/env": { env: { siteUrl: "https://example.invalid", stripeSecretKey: "synthetic-only" }, integrations: { stripe: true } },
    "@/lib/offers": { getOfferBySlug: (slug) => slug === offer.slug ? offer : null, isPurchaseOptionAvailable: () => true },
    "@/lib/reiki-rising-agreement": {},
    "@/lib/holiday-gift-order": order,
    "@/lib/holiday-gift-campaign": { isHolidayCampaignActive: () => active, addHolidayCheckoutMetadata: (_body, data) => stamps.push(data) },
  }, { fetch: async (url, input) => { requests.push({ url, body: new URLSearchParams(input.body) }); return { ok: true, json: async () => ({ url: "https://checkout.stripe.invalid/synthetic" }) }; } });
  async function post(fields) {
    const form = new FormData();
    for (const [key, value] of Object.entries({ slug: offer.slug, ...fields })) form.set(key, value);
    return route.POST(new Request("https://example.invalid/api/checkout", { method: "POST", body: form }));
  }
  return { post, requests, stamps };
}

test("checkout charges each full custom face value and stamps the transaction total", async () => {
  const h = checkoutHarness();
  const result = await h.post({ optionKey: "gift-custom", customAmount: "125.37", quantity: "2" });
  assert.equal(result.status, 303);
  assert.equal(h.requests.length, 1);
  const body = h.requests[0].body;
  assert.equal(body.get("line_items[0][price_data][unit_amount]"), "12537");
  assert.equal(body.get("line_items[0][quantity]"), "2");
  assert.equal(body.get("metadata[giftTotalAmountCents]"), "25074");
  assert.equal(body.get("metadata[giftQuantity]"), "2");
  assert.equal(body.get("metadata[optionKey]"), "gift-custom");
  assert.equal(body.has("allow_promotion_codes"), false);
  assert.equal(h.stamps[0].purchaseCents, 25074);
  assert.equal(h.stamps[0].quantity, 2);
});

test("invalid and expired custom or multiple checkout never contacts Stripe", async () => {
  for (const [active, fields] of [
    [true, { optionKey: "gift-custom", customAmount: "100x" }],
    [true, { optionKey: "gift-50", quantity: "-2" }],
    [false, { optionKey: "gift-custom", customAmount: "100" }],
    [false, { optionKey: "gift-50", quantity: "2" }],
  ]) {
    const h = checkoutHarness(active);
    assert.match((await h.post(fields)).location, /gift-certificate\?order=invalid$/);
    assert.equal(h.requests.length, 0);
  }
});

test("all existing listed amounts still use their exact full face value", async () => {
  for (const option of options) {
    const h = checkoutHarness();
    await h.post({ optionKey: option.key });
    assert.equal(h.requests.length, 1);
    assert.equal(h.requests[0].body.get("line_items[0][price_data][unit_amount]"), String(option.amountCents));
    assert.equal(h.requests[0].body.get("line_items[0][quantity]"), "1");
  }
});

const gift = loadTs("../src/lib/gift-certificates.ts", { "@/lib/holiday-gift-order": order });
test("single certificate codes stay compatible and multiple codes remain stable and distinct", async () => {
  const sessionId = "cs_test_synthetic_multi";
  assert.equal(gift.createGiftCertificateCode(sessionId), gift.createGiftCertificateCode(sessionId, undefined));
  assert.notEqual(gift.createGiftCertificateCode(sessionId), gift.createGiftCertificateCode(sessionId, 1));
  assert.notEqual(gift.createGiftCertificateCode(sessionId, 1), gift.createGiftCertificateCode(sessionId, 2));
  assert.equal(gift.createGiftCertificateCode(sessionId, 2), gift.createGiftCertificateCode(sessionId, 2));
});

function emailHarness() {
  const messages = [];
  const giftInputs = [];
  const env = { emailFrom: "sender@example.invalid", gmailAuthUser: "sender@example.invalid", gmailAppPassword: "synthetic-only", resendApiKey: "", contactForwardTo: "owner@example.invalid", siteUrl: "https://example.invalid" };
  const email = loadTs("../src/lib/email.ts", {
    nodemailer: { createTransport: () => ({ sendMail: async (message) => { messages.push(message); } }) },
    "@/lib/env": { env, integrations: { emailDelivery: true } },
    "@/lib/gift-certificates": { ...gift, createGiftCertificatePdf: async (input) => { giftInputs.push(input); return gift.createGiftCertificatePdf(input); } },
    "@/lib/offers": { getOfferBySlug: (slug) => slug === "gift-certificate" ? { slug, purchaseOptions: options.map((x) => ({ ...x, priceLabel: `$${x.amountCents / 100}`, label: `$${x.amountCents / 100} Gift Certificate` })) } : undefined },
    "@/lib/reiki-rising-live-calls": {},
    "@/lib/site": { site: { adminEmails: [], links: { giftCertificate: "/gift-certificate", contact: "/contact" } } },
  });
  return { email, messages, giftInputs };
}
const session = {
  id: "cs_test_synthetic_multi", amount_total: 25074, currency: "usd", created: 1795536000,
  payment_status: "paid", customer_details: { email: "buyer@example.invalid", name: "Synthetic Buyer" },
  metadata: { purchaseType: "offer", offerSlug: "gift-certificate", optionKey: "gift-custom", giftUnitAmountCents: "12537", giftQuantity: "2", giftTotalAmountCents: "25074" },
};
test("a combined payment emails separate full-value original PDFs with distinct codes", async () => {
  const h = emailHarness();
  await h.email.sendPurchaseConfirmationEmail(session);
  assert.equal(h.messages.length, 1);
  assert.equal(h.messages[0].to, "buyer@example.invalid");
  assert.equal(h.messages[0].attachments.length, 2);
  assert.deepEqual(h.giftInputs.map((x) => x.amountLabel), ["$125.37", "$125.37"]);
  assert.deepEqual(h.giftInputs.map((x) => x.certificateIndex), [1, 2]);
  assert.notEqual(h.messages[0].attachments[0].filename, h.messages[0].attachments[1].filename);
  assert.ok(h.messages[0].attachments.every((x) => x.content.subarray(0, 4).toString() === "%PDF"));
  assert.match(h.messages[0].text, /Payment received: \$250.74/);
  assert.match(h.messages[0].text, /Paid certificate 1: \$125.37/);
  assert.match(h.messages[0].text, /Paid certificate 2: \$125.37/);
  assert.doesNotMatch(h.messages[0].text, /complimentary promotional voucher/i);
});

test("owner notification lists every issued paid certificate code", async () => {
  const h = emailHarness();
  await h.email.sendPurchaseOwnerNotificationEmail(session);
  assert.equal(h.messages.length, 1);
  for (const index of [1, 2]) assert.ok(h.messages[0].text.includes(gift.createGiftCertificateCode(session.id, index)));
  assert.ok(!h.messages[0].text.includes(gift.createGiftCertificateCode(session.id)));
});

test("a single certificate keeps the original code and one full-value PDF", async () => {
  for (const metadata of [
    { purchaseType: "offer", offerSlug: "gift-certificate", optionKey: "gift-50" },
    { purchaseType: "offer", offerSlug: "gift-certificate", optionKey: "gift-50", giftUnitAmountCents: "5000", giftQuantity: "1", giftTotalAmountCents: "5000" },
  ]) {
    const h = emailHarness();
    await h.email.sendPurchaseConfirmationEmail({ ...session, amount_total: 5000, metadata });
    assert.equal(h.messages[0].attachments.length, 1);
    assert.equal(h.giftInputs[0].certificateIndex, undefined);
    assert.ok(h.messages[0].attachments[0].filename.includes(gift.createGiftCertificateCode(session.id)));
    assert.match(h.messages[0].text, /Paid gift certificate: \$50(?:\.00)?\. Code:/);
  }
});

test("tampered payment snapshots cannot email face value exceeding the payment", async () => {
  const h = emailHarness();
  await assert.rejects(h.email.sendPurchaseConfirmationEmail({ ...session, amount_total: 12537 }), /does not match payment/);
  assert.equal(h.messages.length, 0);
});
