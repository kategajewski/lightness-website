import "server-only";
import type Stripe from "stripe";
import { getEventBySlug } from "@/lib/events";
import { integrations } from "@/lib/env";
import { syncEmailSignupToMailchimp } from "@/lib/mailchimp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  if (typeof session.payment_intent === "string") {
    return session.payment_intent;
  }

  return session.payment_intent?.id ?? null;
}

export async function recordEventAttendanceFromSession(
  session: Stripe.Checkout.Session,
) {
  const metadata = session.metadata ?? {};

  if (metadata.purchaseType !== "event") {
    return { skipped: true, reason: "not_event" };
  }

  if (!integrations.supabase) {
    return { skipped: true, reason: "supabase_not_configured" };
  }

  if (!session.id || !metadata.eventSlug) {
    return { skipped: true, reason: "missing_session_or_event" };
  }

  const event = getEventBySlug(metadata.eventSlug);

  if (!event) {
    return { skipped: true, reason: "inactive_event" };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("event_attendance").upsert(
    {
      event_slug: metadata.eventSlug,
      event_name: event?.name ?? metadata.eventSlug,
      customer_name: session.customer_details?.name?.trim() ?? null,
      customer_email: session.customer_details?.email?.trim() ?? null,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      stripe_session_id: session.id,
      stripe_payment_intent_id: getPaymentIntentId(session),
      purchased_at: session.created
        ? new Date(session.created * 1000).toISOString()
        : new Date().toISOString(),
      raw_metadata: metadata,
    },
    { onConflict: "stripe_session_id" },
  );

  if (error) {
    console.error("Event attendance recording failed", error);
    return { skipped: false, error };
  }

  const customerEmail = session.customer_details?.email?.trim();
  const customerName = session.customer_details?.name?.trim();

  if (
    metadata.marketingConsent === "yes" &&
    customerEmail &&
    integrations.mailchimp
  ) {
    try {
      await syncEmailSignupToMailchimp({
        name: customerName || "Event attendee",
        email: customerEmail,
        tags: ["Event attendees", event.name],
      });
    } catch (mailchimpError) {
      console.error("Event attendee Mailchimp sync failed", mailchimpError);
    }
  }

  return { skipped: false };
}
