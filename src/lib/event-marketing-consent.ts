import type Stripe from "stripe";

export const EVENT_UPDATES_LABEL = "Event updates by email";

export function hasEventEmailOptIn(session: Stripe.Checkout.Session) {
  const field = session.custom_fields?.find(
    (item) => item.label.type === "custom" && item.label.custom === EVENT_UPDATES_LABEL,
  );
  const yes = field?.dropdown?.options.find((option) => option.label === "Yes");
  return Boolean(
    field?.type === "dropdown" &&
    field.optional &&
    yes?.value &&
    field.dropdown?.default_value !== yes.value &&
    field.dropdown?.value === yes.value,
  );
}
