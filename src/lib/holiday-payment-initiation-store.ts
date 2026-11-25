import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type HolidayPaymentInitiation = {
  campaign_id: string;
  checkout_session_id: string;
  payment_intent_id: string;
  stripe_livemode: boolean;
  purchase_amount_cents: number;
  currency: "usd";
  initiated_at: string;
  completed_event_id: string;
  event_type: "checkout.session.completed";
  holiday_launch_at: string | null;
  created_at: string;
};

export type HolidayPaymentInitiationInput = {
  campaignId: string;
  checkoutSessionId: string;
  paymentIntentId: string;
  stripeLivemode: boolean;
  purchaseAmountCents: number;
  currency: "usd";
  initiatedAt: string;
  completedEventId: string;
  eventType: "checkout.session.completed";
  holidayLaunchAt?: string | null;
};

function validIdentifier(value: string, maxLength: number) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength && value.trim() === value;
}

function canonicalInstant(value: string) {
  const instant = Date.parse(value);
  if (!Number.isFinite(instant)) throw new Error("A valid signed event timestamp is required.");
  return new Date(instant).toISOString();
}

/**
 * Called only after signature verification and full order-snapshot validation.
 * Preserves the receipt and returns the earliest matching signed completion summary.
 */
export async function recordHolidayPaymentInitiation(
  input: HolidayPaymentInitiationInput,
): Promise<HolidayPaymentInitiation> {
  if (input.eventType !== "checkout.session.completed" || input.currency !== "usd" ||
      typeof input.stripeLivemode !== "boolean" ||
      !Number.isSafeInteger(input.purchaseAmountCents) || input.purchaseAmountCents <= 0 ||
      !validIdentifier(input.campaignId, 100) || !validIdentifier(input.checkoutSessionId, 255) ||
      !validIdentifier(input.paymentIntentId, 255) || !validIdentifier(input.completedEventId, 255)) {
    throw new Error("A verified completed checkout and matching USD order are required.");
  }
  const { data, error } = await createSupabaseAdminClient().rpc("record_holiday_payment_initiation", {
    p_initiation: {
      campaign_id: input.campaignId, checkout_session_id: input.checkoutSessionId,
      payment_intent_id: input.paymentIntentId, stripe_livemode: input.stripeLivemode,
      purchase_amount_cents: input.purchaseAmountCents, currency: input.currency,
      initiated_at: canonicalInstant(input.initiatedAt), completed_event_id: input.completedEventId,
      event_type: input.eventType,
      holiday_launch_at: input.holidayLaunchAt == null ? null : canonicalInstant(input.holidayLaunchAt),
    },
  });
  if (error || !data) throw new Error(error?.message || "Payment initiation evidence could not be recorded.");
  return data as HolidayPaymentInitiation;
}

export async function getHolidayPaymentInitiation(
  campaignId: string,
  checkoutSessionId: string,
): Promise<HolidayPaymentInitiation | null> {
  if (!validIdentifier(campaignId, 100) || !validIdentifier(checkoutSessionId, 255)) {
    throw new Error("A campaign and checkout session are required.");
  }
  const { data, error } = await createSupabaseAdminClient().from("holiday_payment_initiations")
    .select("*").eq("campaign_id", campaignId).eq("checkout_session_id", checkoutSessionId).maybeSingle();
  if (error) throw new Error("Payment initiation evidence could not be loaded.");
  return data as HolidayPaymentInitiation | null;
}
