import "server-only";
import type Stripe from "stripe";
import type { EventCheckoutConfig } from "@/lib/events";
import { EVENT_UPDATES_LABEL } from "@/lib/event-marketing-consent";

// Inventory is enforced by Stripe, including simultaneous payments and buyers
// who already opened Checkout. A website count followed by session creation races.
export async function getCappedEventCheckout(
  stripe: Stripe,
  event: EventCheckoutConfig,
  liveMode: boolean,
): Promise<{ url: string } | { error: "sold_out" | "capacity_unavailable" }> {
  if (!event.paymentLinkId || !event.capacity || !Number.isInteger(event.capacity) || event.capacity < 1) {
    return { error: "capacity_unavailable" };
  }

  let link = await stripe.paymentLinks.retrieve(event.paymentLinkId, {
    expand: ["optional_items"],
  });
  let restriction = link.restrictions?.completed_sessions;
  if (
    link.livemode !== liveMode ||
    link.metadata.purchaseType !== "event" ||
    link.metadata.eventSlug !== event.slug ||
    link.metadata.marketingConsentSource !== "stripe_payment_link_v1" ||
    !restriction ||
    !Number.isInteger(restriction.limit) ||
    restriction.limit < 1 ||
    restriction.limit > event.capacity ||
    !Number.isInteger(restriction.count) ||
    restriction.count < 0 ||
    !link.url.startsWith("https://buy.stripe.com/")
  ) {
    return { error: "capacity_unavailable" };
  }

  // A previously issued custom Checkout URL can bypass Payment Link inventory.
  // Expire the explicitly reconciled legacy sessions before allowing new sales.
  let legacyCompletions = 0;
  for (const id of event.legacyCheckoutSessionIds ?? []) {
    let session = await stripe.checkout.sessions.retrieve(id);
    if (
      session.id !== id ||
      session.livemode !== liveMode ||
      session.mode !== "payment" ||
      session.amount_total !== event.amountCents ||
      session.currency !== "usd" ||
      session.metadata?.purchaseType !== "event" ||
      session.metadata.eventSlug !== event.slug ||
      session.payment_link
    ) {
      return { error: "capacity_unavailable" };
    }
    if (session.status === "open") {
      if (session.payment_status !== "unpaid") return { error: "capacity_unavailable" };
      try {
        session = await stripe.checkout.sessions.expire(id);
      } catch {
        // Payment may have completed between retrieval and expiration.
        session = await stripe.checkout.sessions.retrieve(id);
      }
    }
    if (session.status === "complete") {
      legacyCompletions += 1;
    } else if (session.status !== "expired") {
      return { error: "capacity_unavailable" };
    }
  }

  const remainingLimit = event.capacity - legacyCompletions;
  if (remainingLimit < 1) {
    if (link.active) await stripe.paymentLinks.update(link.id, { active: false });
    return { error: "sold_out" };
  }
  if (restriction.limit !== remainingLimit) {
    // Never raise a limit changed in the Dashboard. Only subtract confirmed
    // legacy purchases from the original cap, including pending payments.
    if (restriction.limit < remainingLimit) return { error: "capacity_unavailable" };
    const adjusted = await stripe.paymentLinks.update(link.id, {
      restrictions: { completed_sessions: { limit: remainingLimit } },
    });
    // Keep the explicitly expanded optional_items from the retrieval above.
    link = { ...link, active: adjusted.active, restrictions: adjusted.restrictions };
    restriction = link.restrictions?.completed_sessions;
    if (
      restriction?.limit !== remainingLimit ||
      !Number.isInteger(restriction.count) ||
      restriction.count < 0
    ) return { error: "capacity_unavailable" };
  }

  if (restriction.count >= restriction.limit) {
    return { error: "sold_out" };
  }
  if (!link.active) return { error: "capacity_unavailable" };

  const items = await stripe.paymentLinks.listLineItems(link.id, { limit: 2 });
  const item = items.data[0];
  if (
    items.has_more ||
    items.data.length !== 1 ||
    item.quantity !== 1 ||
    item.adjustable_quantity?.enabled ||
    item.price?.unit_amount !== event.amountCents ||
    item.price?.currency !== "usd" ||
    item.price?.type !== "one_time" ||
    Boolean(link.optional_items?.length)
  ) {
    return { error: "capacity_unavailable" };
  }

  const updates = link.custom_fields.find(
    (field) => field.label.type === "custom" && field.label.custom === EVENT_UPDATES_LABEL,
  );
  const yes = updates?.dropdown?.options.find((option) => option.label === "Yes");
  const no = updates?.dropdown?.options.find((option) => option.label === "No");
  if (
    updates?.type !== "dropdown" ||
    !updates.optional ||
    !yes || !no ||
    yes.value === no.value ||
    updates.dropdown?.default_value === yes.value
  ) {
    return { error: "capacity_unavailable" };
  }

  return { url: link.url };
}
