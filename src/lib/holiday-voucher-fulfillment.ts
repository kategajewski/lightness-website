import "server-only";
import type Stripe from "stripe";
import { createGiftCertificateCode } from "@/lib/gift-certificates";
import { HOLIDAY_CAMPAIGN, qualifyHolidayPurchase } from "@/lib/holiday-gift-campaign";
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

export async function fulfillHolidayVoucherFromPayment(session: Stripe.Checkout.Session, event: Pick<Stripe.Event, "id" | "created">) {
  const qualification = qualifyHolidayPurchase(session, event.created);
  if (!qualification) return { status: "not_eligible" as const };
  const stripe = await getStripe();
  if (!stripe) throw new Error("Stripe is unavailable for promotional fulfillment.");
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!paymentIntentId) throw new Error("A paid transaction is required for promotional fulfillment.");
  const payment = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
  if (payment.status !== "succeeded" || payment.currency !== "usd" || payment.amount_received !== qualification.purchaseCents || payment.amount !== qualification.purchaseCents) {
    throw new Error("The promotional purchase payment could not be verified.");
  }
  const email = session.customer_details?.email || session.customer_email;
  if (!email) throw new Error("Purchaser email is required to deliver promotional credit.");
  const quantity = Number(session.metadata?.giftQuantity || 1);
  let voucher = await issueHolidayVoucher({
    campaign_id: HOLIDAY_CAMPAIGN.id, checkout_session_id: session.id,
    payment_intent_id: paymentIntentId,
    paid_certificate_code: createGiftCertificateCode(session.id, quantity > 1 ? 1 : undefined),
    purchaser_email: email, purchaser_name: session.customer_details?.name?.slice(0, 200) || null,
    purchased_amount_cents: qualification.purchaseCents, face_value_cents: qualification.bonusCents,
    stripe_livemode: session.livemode, issued_at: qualification.paidAt,
    valid_from: HOLIDAY_CAMPAIGN.validFrom, expires_at: HOLIDAY_CAMPAIGN.expiresAt,
  });
  // Re-read after issuance so a refund delivered before the checkout event is not lost.
  const chargeId = typeof payment.latest_charge === "string" ? payment.latest_charge : payment.latest_charge?.id;
  if (!chargeId) throw new Error("A successful charge is required for promotional fulfillment.");
  const charge = await stripe.charges.retrieve(chargeId);
  if (charge.amount_refunded > 0) {
    const adjusted = await adjustHolidayVouchersForRefund({
      eventId: `${event.id}:current-refund:${charge.amount_refunded}`,
      paymentIntentId, stripeLivemode: session.livemode,
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
