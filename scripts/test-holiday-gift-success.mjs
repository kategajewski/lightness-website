import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

function load(relativePath, dependencies) {
  const source = ts.transpileModule(fs.readFileSync(new URL(relativePath, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.compileFunction(source, ["exports", "require", "console"], { filename: relativePath })(exports, (name) => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
    return dependencies[name];
  }, { error() {} });
  return exports;
}

const session = {
  id: "cs_test_synthetic_success", status: "complete", payment_status: "paid",
  metadata: { purchaseType: "offer", offerSlug: "gift-certificate" },
  customer_details: { email: "synthetic-buyer@example.invalid" },
};

function harness({ sessionPatch = {}, lookupFailure = false, configured = true } = {}) {
  const calls = { retrieve: 0, customerEmail: 0, ownerEmail: 0, metadata: 0, portal: 0, installment: 0 };
  const confirmation = load("../src/lib/checkout-confirmation.ts", {
    "server-only": {},
    "@/lib/email": {
      canSendPurchaseOwnerNotification: () => true,
      async sendPurchaseConfirmationEmail() { calls.customerEmail++; return { skipped: false }; },
      async sendPurchaseOwnerNotificationEmail() { calls.ownerEmail++; return { skipped: false }; },
    },
    "@/lib/event-attendance": { async recordEventAttendanceFromSession() {} },
    "@/lib/env": { integrations: { emailDelivery: true } },
    "@/lib/installment-schedules": { async configureInstallmentScheduleFromSession() { calls.installment++; return "not_required"; } },
    "@/lib/portal-access": { async provisionOfferPortalAccessFromSession() { calls.portal++; return { status: "skipped" }; } },
    "@/lib/stripe/server": { async getStripe() {
      if (!configured) return null;
      return { checkout: { sessions: {
        async retrieve() { calls.retrieve++; if (lookupFailure) throw new Error("Synthetic lookup failure"); return { ...session, ...sessionPatch }; },
        async update() { calls.metadata++; },
      } } };
    } },
  });
  const jsx = (type, props) => ({ type, props });
  const page = load("../src/app/checkout/success/page.tsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "next/link": { default: "link" },
    "@/lib/checkout-confirmation": confirmation,
    "@/lib/offers": { getOfferBySlug: (slug) => ["gift-certificate", "sound-training"].includes(slug) ? { slug, name: slug === "gift-certificate" ? "Gift Certificate" : "Sound Training" } : undefined },
    "@/lib/events": { getEventBySlug: (slug) => slug === "synthetic-event" ? { confirmationTitle: "Your event place is reserved.", confirmationDescription: "The original event confirmation wording.", detailHref: "/synthetic-event" } : undefined },
    "@/lib/site": { site: { links: { courses: "/courses", events: "/events", soundTraining: "/sound-training" } } },
  });
  async function render(fields = {}) {
    return page.default({ searchParams: Promise.resolve({ type: "offer", slug: "gift-certificate", session_id: session.id, ...fields }) });
  }
  return { calls, confirmation: confirmation.processCheckoutSessionConfirmation, render };
}

function text(element) {
  if (element === null || element === undefined || typeof element === "boolean") return "";
  if (Array.isArray(element)) return element.map(text).join(" ");
  if (typeof element !== "object") return String(element);
  return text(element.props?.children);
}

for (const [status, paymentStatus] of [["complete", "unpaid"], ["open", "unpaid"], ["open", "paid"]]) {
  test(`verified ${status}/${paymentStatus} gift checkout stays pending without emails or fulfillment`, async () => {
    const h = harness({ sessionPatch: { status, payment_status: paymentStatus } });
    const result = await h.confirmation(session.id, "success_page");
    assert.equal(result.paymentStatus, "pending");
    assert.equal(result.customerEmail, "skipped");
    assert.equal(result.ownerEmail, "skipped");
    assert.equal(h.calls.customerEmail + h.calls.ownerEmail + h.calls.metadata + h.calls.portal + h.calls.installment, 0);
    assert.ok(!JSON.stringify(result).includes(session.customer_details.email));
  });
}

test("pending bank gift success page does not claim payment completion or certificate delivery", async () => {
  const h = harness({ sessionPatch: { payment_status: "unpaid" } });
  const content = text(await h.render());
  assert.match(content, /Payment Pending/);
  assert.match(content, /Your payment is not confirmed yet/);
  assert.match(content, /Bank payments can take time to process/);
  assert.match(content, /gift certificate will be emailed only after payment succeeds/);
  assert.match(content, /complimentary voucher will arrive in a separate email after successful payment/);
  assert.doesNotMatch(content, /Payment Complete|has been received|on its way to your email/);
  assert.equal(h.calls.retrieve, 1);
  assert.equal(h.calls.customerEmail + h.calls.ownerEmail, 0);
});

for (const options of [{ lookupFailure: true }, { configured: false }]) {
  test(`unavailable Stripe verification returns unknown and never displays a paid gift message: ${JSON.stringify(options)}`, async () => {
    const h = harness(options);
    const result = await h.confirmation(session.id, "success_page");
    assert.equal(result.paymentStatus, "unknown");
    const content = text(await h.render());
    assert.match(content, /Payment Status Unavailable/);
    assert.match(content, /We could not confirm your payment status right now/);
    assert.match(content, /before trying another payment/);
    assert.doesNotMatch(content, /Payment Complete|has been received|on its way to your email/);
    assert.equal(h.calls.customerEmail + h.calls.ownerEmail, 0);
  });
}

test("missing session ID remains unknown and does not initiate a payment lookup or email", async () => {
  const h = harness();
  assert.equal((await h.confirmation(undefined, "success_page")).paymentStatus, "unknown");
  const content = text(await h.render({ session_id: undefined }));
  assert.match(content, /Payment Status Unavailable/);
  assert.doesNotMatch(content, /Payment Complete|has been received/);
  assert.equal(h.calls.retrieve + h.calls.customerEmail + h.calls.ownerEmail, 0);
});

for (const paymentStatus of ["paid", "no_payment_required"]) {
  test(`complete ${paymentStatus} checkout retains the existing paid confirmation process`, async () => {
    const h = harness({ sessionPatch: { payment_status: paymentStatus } });
    const result = await h.confirmation(session.id, "webhook");
    assert.equal(result.paymentStatus, "paid");
    assert.equal(result.customerEmail, "sent");
    assert.equal(result.ownerEmail, "sent");
    assert.equal(h.calls.customerEmail, 1);
    assert.equal(h.calls.ownerEmail, 1);
    const content = text(await h.render());
    assert.match(content, /Payment Complete/);
    assert.match(content, /Your gift certificate purchase has been received/);
    assert.match(content, /A printable certificate PDF with its unique code should be on its way/);
    assert.doesNotMatch(content, /Payment Pending|Payment Status Unavailable/);
  });
}

test("other offer and event confirmation wording stays unchanged", async () => {
  const h = harness({ sessionPatch: { payment_status: "unpaid" } });
  const offerContent = text(await h.render({ slug: "sound-training" }));
  assert.match(offerContent, /Payment Complete/);
  assert.match(offerContent, /Your payment for Sound Training has been received/);
  const eventContent = text(await h.render({ type: "event", slug: undefined, eventSlug: "synthetic-event" }));
  assert.match(eventContent, /Ticket Confirmed/);
  assert.match(eventContent, /Your event place is reserved/);
  assert.match(eventContent, /The original event confirmation wording/);
  assert.doesNotMatch(eventContent, /Bank payments can take time/);
});
