import "server-only";
import { randomBytes } from "node:crypto";
import { HOLIDAY_CAMPAIGN } from "@/lib/holiday-gift-campaign";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type HolidayVoucher = {
  id: string;
  campaign_id: string;
  checkout_session_id: string;
  payment_intent_id: string;
  paid_certificate_code: string;
  code: string;
  purchaser_email: string;
  purchaser_name: string | null;
  purchased_amount_cents: number;
  face_value_cents: number;
  entitlement_cents: number;
  balance_cents: number;
  amount_refunded_cents: number;
  refund_review_required: boolean;
  currency: "usd";
  stripe_livemode: boolean;
  issued_at: string;
  valid_from: string;
  expires_at: string;
  status: "issued" | "refund_review" | "voided";
  status_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type HolidayVoucherIssueInput = Omit<HolidayVoucher,
  "id" | "code" | "entitlement_cents" | "balance_cents" | "amount_refunded_cents" | "refund_review_required" | "currency" | "status" | "status_reason" | "created_at" | "updated_at"
> & { code?: string };

export type HolidayVoucherRedemption = {
  id: string;
  request_id: string;
  voucher_id: string;
  campaign_id: string;
  amount_cents: number;
  service_id: string;
  service_at: string | null;
  booking_reference: string;
  redeemed_by: string;
  recipient_name: string | null;
  redeemed_at: string;
};

export type HolidayVoucherEmailOutbox = {
  voucher_id: string;
  delivery_amount_cents: number;
  status: "pending" | "sending" | "sent" | "failed" | "review";
  claimed_at: string | null;
  initial_attempt_at: string | null;
  attempts: number;
  provider_message_id: string | null;
  sent_at: string | null;
  last_error: string | null;
};

export type HolidayVoucherRedemptionReversal = {
  id: string;
  request_id: string;
  redemption_id: string;
  voucher_id: string;
  reversed_amount_cents: number;
  restored_amount_cents: number;
  policy_eligible: true;
  policy_reference: string;
  restored_by: string;
  created_at: string;
};

export type HolidayVoucherRefundAdjustment = {
  event_id: string;
  voucher_id: string;
  campaign_id: string;
  payment_intent_id: string;
  stripe_livemode: boolean;
  original_charge_amount_cents: number;
  cumulative_refunded_cents: number;
  entitlement_cents: number;
  created_at: string;
  updated_at: string;
};

export type HolidayVoucherWithHistory = HolidayVoucher & {
  holiday_voucher_redemptions: HolidayVoucherRedemption[];
  holiday_voucher_redemption_reversals: HolidayVoucherRedemptionReversal[];
  holiday_voucher_refund_adjustments: HolidayVoucherRefundAdjustment[];
  holiday_voucher_email_outbox: HolidayVoucherEmailOutbox | null;
};

export type HolidayVoucherRedemptionInput = {
  requestId: string;
  voucherId: string;
  amountCents: number;
  serviceId: string;
  serviceAt: string | null;
  bookingReference: string;
  redeemedBy: string;
  recipientName: string | null;
  hasOtherPromotion: boolean;
};

// Every field is deliberate: an unanswered rule must not become an implicit default.
export type HolidayVoucherRedemptionPolicy = {
  allowedServiceIds: readonly string[];
  allowPartialRedemptions: boolean;
  maxVouchersPerBooking: number | null;
  serviceMustOccurDuringValidity: boolean;
};

export type HolidayVoucherEmailClaim =
  | { claimed: true; claimToken: string; amountCents: number }
  | { claimed: false; reason: "sent" | "busy" | "review" | "held" };

function requireResult<T>(data: unknown, error: { message: string } | null, operation: string): T {
  if (error || data === null || data === undefined) {
    // Postgres domain errors are deliberately human readable. Never include voucher payloads.
    throw new Error(error?.message || `Promotional voucher ${operation} failed.`);
  }
  return data as T;
}

export function createHolidayVoucherCode() {
  return `HOLIDAY-${randomBytes(12).toString("hex").toUpperCase()}`;
}

export async function issueHolidayVoucher(input: HolidayVoucherIssueInput): Promise<HolidayVoucher> {
  if (!Number.isSafeInteger(input.face_value_cents) || input.face_value_cents <= 0 ||
      !Number.isSafeInteger(input.purchased_amount_cents) || input.purchased_amount_cents <= 0) {
    throw new Error("Promotional voucher amounts must be positive integer cents.");
  }
  const { data, error } = await createSupabaseAdminClient().rpc("issue_holiday_voucher", {
    p_voucher: { ...input, code: input.code || createHolidayVoucherCode() },
  });
  return requireResult<HolidayVoucher>(data, error, "issuance");
}

export async function getHolidayVoucher(id: string): Promise<HolidayVoucherWithHistory | null> {
  const { data, error } = await createSupabaseAdminClient().from("holiday_vouchers")
    .select("*, holiday_voucher_redemptions(*), holiday_voucher_email_outbox(*), holiday_voucher_redemption_reversals(*), holiday_voucher_refund_adjustments(*)").eq("id", id).maybeSingle();
  if (error) throw new Error("Promotional vouchers could not be loaded.");
  return data as HolidayVoucherWithHistory | null;
}

export async function listHolidayVouchers(input: {
  campaignId?: string;
  livemode?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<{ vouchers: HolidayVoucherWithHistory[]; count: number }> {
  const limit = Math.min(100, Math.max(1, input.limit ?? 50));
  const offset = Math.max(0, input.offset ?? 0);
  let query = createSupabaseAdminClient().from("holiday_vouchers")
    .select("*, holiday_voucher_redemptions(*), holiday_voucher_email_outbox(*), holiday_voucher_redemption_reversals(*), holiday_voucher_refund_adjustments(*)", { count: "exact" })
    .order("created_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + limit - 1);
  if (input.campaignId) query = query.eq("campaign_id", input.campaignId);
  if (typeof input.livemode === "boolean") query = query.eq("stripe_livemode", input.livemode);
  const { data, error, count } = await query;
  if (error) throw new Error("Promotional vouchers could not be loaded.");
  return { vouchers: (data ?? []) as HolidayVoucherWithHistory[], count: count ?? 0 };
}

export async function redeemHolidayVoucher(
  input: HolidayVoucherRedemptionInput,
  policy: HolidayVoucherRedemptionPolicy,
): Promise<HolidayVoucher> {
  if (!policy.allowedServiceIds.length || typeof policy.allowPartialRedemptions !== "boolean" ||
      typeof policy.serviceMustOccurDuringValidity !== "boolean" ||
      (policy.maxVouchersPerBooking !== null && (!Number.isSafeInteger(policy.maxVouchersPerBooking) || policy.maxVouchersPerBooking < 1))) {
    throw new Error("Approved voucher redemption policy is required.");
  }
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("Enter a positive redemption amount in cents.");
  }
  const { data, error } = await createSupabaseAdminClient().rpc("redeem_holiday_voucher", {
    p_request_id: input.requestId, p_voucher_id: input.voucherId, p_amount_cents: input.amountCents,
    p_service_id: input.serviceId, p_service_at: input.serviceAt, p_booking_reference: input.bookingReference.trim(),
    p_redeemed_by: input.redeemedBy, p_recipient_name: input.recipientName,
    p_has_other_promotion: input.hasOtherPromotion,
    p_allowed_services: [...policy.allowedServiceIds], p_allow_partial: policy.allowPartialRedemptions,
    p_max_vouchers_per_booking: policy.maxVouchersPerBooking,
    p_service_must_occur_during_validity: policy.serviceMustOccurDuringValidity,
  });
  return requireResult<HolidayVoucher>(data, error, "redemption");
}

export async function claimHolidayVoucherEmail(voucherId: string): Promise<HolidayVoucherEmailClaim> {
  const { data, error } = await createSupabaseAdminClient().rpc("claim_holiday_voucher_email", { p_voucher_id: voucherId });
  return requireResult<HolidayVoucherEmailClaim>(data, error, "email claim");
}

export async function adjustHolidayVouchersForRefund(input: {
  eventId: string;
  paymentIntentId: string;
  stripeLivemode: boolean;
  cumulativeRefundedCents: number;
  originalChargeAmountCents: number;
  campaignId?: string;
}): Promise<HolidayVoucher[]> {
  if (!Number.isSafeInteger(input.cumulativeRefundedCents) || input.cumulativeRefundedCents < 0 ||
      !Number.isSafeInteger(input.originalChargeAmountCents) || input.originalChargeAmountCents <= 0 ||
      input.cumulativeRefundedCents > input.originalChargeAmountCents) {
    throw new Error("A verified Stripe charge and cumulative refund amount are required.");
  }
  const { data, error } = await createSupabaseAdminClient().rpc("adjust_holiday_vouchers_for_refund", {
    p_event_id: input.eventId, p_payment_intent_id: input.paymentIntentId,
    p_stripe_livemode: input.stripeLivemode, p_cumulative_refunded_cents: input.cumulativeRefundedCents,
    p_original_charge_amount_cents: input.originalChargeAmountCents,
    p_campaign_id: input.campaignId ?? HOLIDAY_CAMPAIGN.id,
  });
  return requireResult<HolidayVoucher[]>(data, error, "refund adjustment");
}

export async function restoreHolidayVoucherRedemption(input: {
  requestId: string;
  redemptionId: string;
  policyEligible: boolean;
  policyReference: string;
  restoredBy: string;
}): Promise<HolidayVoucher> {
  if (input.policyEligible !== true || !input.policyReference.trim()) {
    throw new Error("Confirm that the existing cancellation policy permits restoring this credit.");
  }
  const { data, error } = await createSupabaseAdminClient().rpc("restore_holiday_voucher_redemption", {
    p_request_id: input.requestId, p_redemption_id: input.redemptionId,
    p_policy_eligible: input.policyEligible, p_policy_reference: input.policyReference.trim(),
    p_restored_by: input.restoredBy,
  });
  return requireResult<HolidayVoucher>(data, error, "cancellation restoration");
}

export async function completeHolidayVoucherEmail(voucherId: string, claimToken: string, providerMessageId: string) {
  const { data, error } = await createSupabaseAdminClient().rpc("complete_holiday_voucher_email", {
    p_voucher_id: voucherId, p_claim_token: claimToken, p_provider_message_id: providerMessageId,
  });
  if (!requireResult<boolean>(data, error, "email receipt")) throw new Error("Promotional voucher email claim has changed. Delivery requires review.");
}

export async function failHolidayVoucherEmail(voucherId: string, claimToken: string, errorMessage: string, requiresReview = false) {
  const { data, error } = await createSupabaseAdminClient().rpc("fail_holiday_voucher_email", {
    p_voucher_id: voucherId, p_claim_token: claimToken, p_error: errorMessage.slice(0, 1000), p_requires_review: requiresReview,
  });
  return requireResult<boolean>(data, error, "email failure recording");
}
