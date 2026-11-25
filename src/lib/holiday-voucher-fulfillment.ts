import "server-only";
import type Stripe from "stripe";
import { createGiftCertificateCode } from "@/lib/gift-certificates";
import { HOLIDAY_CAMPAIGN, inspectHolidayCampaignOrder, isHolidayCampaignActive, qualifyHolidayPurchase } from "@/lib/holiday-gift-campaign";
import {
  getHolidayPaymentInitiation, recordHolidayPaymentInitiation, type HolidayPaymentInitiation,
} from "@/lib/holiday-payment-initiation-store";
import { canSendHolidayVoucherEmail, sendHolidayVoucherEmail } from "@/lib/holiday-voucher-email";
import {
  adjustHolidayVouchersForRefund, claimHolidayVoucherEmail, completeHolidayVoucherEmail,
  failHolidayVoucherEmail, issueHolidayVoucher, type HolidayVoucher,
} from "@/lib/holiday-voucher-store";
import { getStripe } from "@/lib/stripe/server";

export async function deliverHolidayVoucher(voucher: HolidayVoucher) {
  if (!canSendHolidayVoucherEmail()) throw new Error("Promotional voucher email is not configured.");
  const claim = await claimHolidayVoucherEmail(voucher.id);
  if (!claim.claimed) return { status: claim.reason === "sent" ? "already_sent" as const : claim.reason };
  try {
    const sent = await sendHolidayVoucherEmail({
      voucherId: voucher.id, purchaserEmail: voucher.purchaser_email,
      amountCents: claim.amountCents, voucherCode: voucher.code,
    });
    await completeHolidayVoucherEmail(voucher.id, claim.claimToken, sent.providerId);
    return { status: "sent" as const };
  } catch (error) {
    await failHolidayVoucherEmail(voucher.id, claim.claimToken, "Promotional email delivery did not complete. Retry within the provider idempotency window.");
    throw error;
  }
}

type HolidayCheckoutEvent = Pick<Stripe.Event, "id" | "created" | "type">;
type OriginalCertificateEmailStatus = "sent" | "skipped" | "already_sent" | "failed";

function paymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
}

function assertMatchingInitiation(session: Stripe.Checkout.Session, initiation: HolidayPaymentInitiation) {
  const order = inspectHolidayCampaignOrder(session);
  if (!order || initiation.campaign_id !== HOLIDAY_CAMPAIGN.id
    || initiation.checkout_session_id !== session.id || initiation.payment_intent_id !== paymentIntentId(session)
    || initiation.stripe_livemode !== session.livemode || initiation.currency !== session.currency
    || initiation.purchase_amount_cents !== order.purchaseCents || initiation.event_type !== "checkout.session.completed"
    || !Number.isFinite(Date.parse(initiation.initiated_at))
    || Date.parse(initiation.holiday_launch_at ?? "") !== Date.parse(session.metadata?.holidayLaunchAt ?? "")) {
    throw new Error("The settled purchase does not match its signed payment initiation evidence.");
  }
}

/** Called only from the verified webhook, before acknowledging a completed checkout. */
export async function prepareHolidayVoucherPayment(
  snapshot: Stripe.Checkout.Session,
  event: HolidayCheckoutEvent,
): Promise<HolidayPaymentInitiation | null> {
  const order = inspectHolidayCampaignOrder(snapshot);
  if (!order) return null;
  let initiation: HolidayPaymentInitiation | null;
  if (event.type === "checkout.session.completed") {
    if (!Number.isSafeInteger(event.created) || event.created <= 0) throw new Error("A signed checkout completion timestamp is required.");
    initiation = await recordHolidayPaymentInitiation({
      campaignId: HOLIDAY_CAMPAIGN.id, checkoutSessionId: snapshot.id,
      paymentIntentId: paymentIntentId(snapshot)!, stripeLivemode: snapshot.livemode,
      purchaseAmountCents: order.purchaseCents, currency: "usd",
      initiatedAt: new Date(event.created * 1000).toISOString(), completedEventId: event.id,
      eventType: "checkout.session.completed", holidayLaunchAt: snapshot.metadata?.holidayLaunchAt,
    });
  } else if (event.type === "checkout.session.async_payment_succeeded") {
    initiation = await getHolidayPaymentInitiation(HOLIDAY_CAMPAIGN.id, snapshot.id);
    if (!initiation) throw new Error("The signed payment initiation event has not been recorded yet. Retry after checkout completion is reconciled.");
  } else {
    throw new Error("A supported signed checkout event is required.");
  }
  assertMatchingInitiation(snapshot, initiation);
  return initiation;
}

export async function fulfillHolidayVoucherFromPayment(
  snapshot: Stripe.Checkout.Session,
  event: HolidayCheckoutEvent,
  initiation: HolidayPaymentInitiation | null,
  originalCertificateEmail: OriginalCertificateEmailStatus,
) {
  if (!initiation) return { status: "not_eligible" as const };
  const stripe = await getStripe();
  if (!stripe) throw new Error("Stripe is unavailable for promotional fulfillment.");
  // The event snapshot may still say unpaid after the bank has settled.
  const session = await stripe.checkout.sessions.retrieve(snapshot.id);
  assertMatchingInitiation(session, initiation);
  const initiationWithinCampaign = isHolidayCampaignActive(new Date(initiation.initiated_at));
  if (session.payment_status !== "paid") {
    if (event.type === "checkout.session.async_payment_succeeded") throw new Error("The successful settlement is not reflected in the current checkout yet. Retry later.");
    return { status: initiationWithinCampaign ? "pending_payment" as const : "not_eligible" as const };
  }
  if (!["sent", "already_sent"].includes(originalCertificateEmail)) throw new Error("The original paid gift certificate email must be delivered before promotional fulfillment.");
  const qualification = qualifyHolidayPurchase(session, Date.parse(initiation.initiated_at) / 1000);
  if (!qualification) return { status: "not_eligible" as const };
  const intentId = paymentIntentId(session);
  if (!intentId) throw new Error("A paid transaction is required for promotional fulfillment.");
  const payment = await stripe.paymentIntents.retrieve(intentId, { expand: ["latest_charge"] });
  if (payment.status !== "succeeded" || payment.currency !== "usd" || payment.livemode !== session.livemode
    || payment.amount_received !== qualification.purchaseCents || payment.amount !== qualification.purchaseCents) {
    throw new Error("The promotional purchase payment could not be verified.");
  }
  const email = session.customer_details?.email || session.customer_email;
  if (!email) throw new Error("Purchaser email is required to deliver promotional credit.");
  const quantity = Number(session.metadata?.giftQuantity || 1);
  let voucher = await issueHolidayVoucher({
    campaign_id: HOLIDAY_CAMPAIGN.id, checkout_session_id: session.id,
    payment_intent_id: intentId,
    paid_certificate_code: createGiftCertificateCode(session.id, quantity > 1 ? 1 : undefined),
    purchaser_email: email, purchaser_name: session.customer_details?.name?.slice(0, 200) || null,
    purchased_amount_cents: qualification.purchaseCents, face_value_cents: qualification.bonusCents,
    stripe_livemode: session.livemode, issued_at: new Date().toISOString(),
    valid_from: HOLIDAY_CAMPAIGN.validFrom, expires_at: HOLIDAY_CAMPAIGN.expiresAt,
  });
  // Re-read after issuance so a refund delivered before the checkout event is not lost.
  const chargeId = typeof payment.latest_charge === "string" ? payment.latest_charge : payment.latest_charge?.id;
  if (!chargeId) throw new Error("A successful charge is required for promotional fulfillment.");
  const charge = await stripe.charges.retrieve(chargeId);
  if (charge.amount_refunded > 0) {
    const adjusted = await adjustHolidayVouchersForRefund({
      eventId: `${event.id}:current-refund:${charge.amount_refunded}`,
      paymentIntentId: intentId, stripeLivemode: session.livemode,
      cumulativeRefundedCents: charge.amount_refunded, originalChargeAmountCents: charge.amount,
    });
    voucher = adjusted.find((item) => item.id === voucher.id) ?? voucher;
    if (voucher.status !== "issued" || voucher.entitlement_cents === 0) return { status: "refund_adjusted" as const };
  }
  const delivered = await deliverHolidayVoucher(voucher);
  if (delivered.status === "busy") throw new Error("Promotional email fulfillment is already processing. Retry later.");
  return delivered;
}

export async function processHolidayVoucherRefund(chargeId: string, eventId: string) {
  const stripe = await getStripe();
  if (!stripe) throw new Error("Stripe is unavailable for promotional refund reconciliation.");
  const charge = await stripe.charges.retrieve(chargeId);
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;
  return adjustHolidayVouchersForRefund({
    eventId, paymentIntentId, stripeLivemode: charge.livemode,
    cumulativeRefundedCents: charge.amount_refunded, originalChargeAmountCents: charge.amount,
  });
}
