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
  if (!event.paymentLinkId || !event.capacity || event.capacity < 1) {
    return { error: "capacity_unavailable" };
  }

  const link = await stripe.paymentLinks.retrieve(event.paymentLinkId, {
    expand: ["optional_items"],
  });
  const restriction = link.restrictions?.completed_sessions;
  if (
    link.livemode !== liveMode ||
    link.metadata.purchaseType !== "event" ||
    link.metadata.eventSlug !== event.slug ||
    link.metadata.marketingConsentSource !== "stripe_payment_link_v1" ||
    !restriction ||
    restriction.limit !== event.capacity ||
    !Number.isInteger(restriction.count) ||
    restriction.count < 0 ||
    !link.url.startsWith("https://buy.stripe.com/")
  ) {
    return { error: "capacity_unavailable" };
  }

  if (!link.active || restriction.count >= restriction.limit) {
    return { error: "sold_out" };
  }

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
