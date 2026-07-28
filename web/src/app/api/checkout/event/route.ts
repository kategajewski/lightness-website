import { NextResponse } from "next/server";
import { env, integrations } from "@/lib/env";

const eventCheckoutConfig = {
  "reiki-share-july-1-2026": {
    name: "Reiki Share",
    description:
      "Ticket for Reiki Share, a practitioner-only community gathering at The Lightness of Being. All purchases are final and non-refundable.",
    amountCents: 2500,
    successPath: "/checkout/success",
    cancelPath: "/reiki-share-july-1",
  },
  "reiki-share-august-6-2026": {
    name: "Reiki Share",
    description:
      "Ticket for Reiki Share, a practitioner-only community gathering at The Lightness of Being. All purchases are final and non-refundable.",
    amountCents: 2500,
    successPath: "/checkout/success",
    cancelPath: "/reiki-share",
  },
  "golden-hour-summer-solstice-sound-journey": {
    name: "Golden Hour: A Summer Solstice Sound Journey",
    description:
      "Advance ticket for the Wednesday, June 24, 2026 sunset summer solstice sound journey. Tickets move to the rain date if needed and are non-refundable.",
    amountCents: 3000,
    successPath: "/checkout/success",
    cancelPath: "/sacred-sounds-under-the-sky",
  },
  "golden-hour-july-28-2026": {
    name: "Golden Hour: An Outdoor Sound Journey",
    description:
      "Advance ticket for the Tuesday, July 28, 2026 golden hour outdoor sound journey. Tickets move to the rain date if needed and are non-refundable.",
    amountCents: 3500,
    successPath: "/checkout/success",
    cancelPath: "/golden-hour-july-28",
  },
  "golden-hour-august-25-2026": {
    name: "Golden Hour: An Outdoor Sound Journey",
    description:
      "Advance ticket for the Tuesday, August 25, 2026 golden hour outdoor sound journey. Tickets move to the rain date if needed and are non-refundable.",
    amountCents: 3000,
    successPath: "/checkout/success",
    cancelPath: "/golden-hour-august-25",
  },
  "the-weekend-reset-july-11-2026": {
    name: "The Weekend Reset",
    description:
      "Ticket for The Weekend Reset, a 75-minute outdoor gentle yoga and sound bath experience at The Lightness Grounds. Tickets move to the rain date if needed and are non-refundable.",
    amountCents: 3000,
    registrationClosed: true,
    successPath: "/checkout/success",
    cancelPath: "/the-weekend-reset",
  },
  "flow-field-august-16-2026": {
    name: "Flow Field",
    description:
      "Ticket for Flow Field, a 90-minute open-air vinyasa flow and restorative sound healing experience at The Lightness Grounds. If rain cancels the gathering, tickets will be refunded. Otherwise, tickets are non-refundable but transferable.",
    amountCents: 4500,
    successPath: "/checkout/success",
    cancelPath: "/flow-field",
  },
} as const;

export async function POST(request: Request) {
  const origin = env.siteUrl.replace(/\/$/, "");
  const formData = await request.formData();
  const eventSlug = String(formData.get("eventSlug") ?? "");
  const event = eventCheckoutConfig[
    eventSlug as keyof typeof eventCheckoutConfig
  ];

  if (!event) {
    return NextResponse.redirect(`${origin}/events`, { status: 303 });
  }

  if ("registrationClosed" in event && event.registrationClosed) {
    return NextResponse.redirect(
      `${origin}${event.cancelPath}?checkoutError=registration_closed`,
      {
        status: 303,
      },
    );
  }

  if (!integrations.stripe || !env.stripeSecretKey) {
    return NextResponse.redirect(
      `${origin}${event.cancelPath}?checkoutError=stripe_not_configured`,
      {
        status: 303,
      },
    );
  }

  if (!env.stripePublishableKey) {
    return NextResponse.redirect(
      `${origin}${event.cancelPath}?checkoutError=publishable_key_missing`,
      {
        status: 303,
      },
    );
  }

  if (!env.stripeSecretKey.startsWith("sk_")) {
    return NextResponse.redirect(
      `${origin}${event.cancelPath}?checkoutError=secret_key_invalid`,
      {
        status: 303,
      },
    );
  }

  if (
    !env.stripePublishableKey.startsWith("pk_test_") &&
    !env.stripePublishableKey.startsWith("pk_live_")
  ) {
    return NextResponse.redirect(
      `${origin}${event.cancelPath}?checkoutError=publishable_key_invalid`,
      {
        status: 303,
      },
    );
  }

  if (
    env.stripeSecretKey.startsWith("sk_test_") &&
    !env.stripePublishableKey.startsWith("pk_test_")
  ) {
    return NextResponse.redirect(
      `${origin}${event.cancelPath}?checkoutError=key_mode_mismatch`,
      {
        status: 303,
      },
    );
  }

  if (
    env.stripeSecretKey.startsWith("sk_live_") &&
    !env.stripePublishableKey.startsWith("pk_live_")
  ) {
    return NextResponse.redirect(
      `${origin}${event.cancelPath}?checkoutError=key_mode_mismatch`,
      {
        status: 303,
      },
    );
  }

  try {
    const body = new URLSearchParams({
      mode: "payment",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(event.amountCents),
      "line_items[0][price_data][product_data][name]": event.name,
      "line_items[0][price_data][product_data][description]": event.description,
      "line_items[0][quantity]": "1",
      "metadata[purchaseType]": "event",
      "metadata[eventSlug]": eventSlug,
      success_url: `${origin}${event.successPath}?type=event&eventSlug=${encodeURIComponent(
        eventSlug,
      )}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel?type=event&eventSlug=${encodeURIComponent(
        eventSlug,
      )}`,
    });

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stripe event checkout session creation failed", errorText);

      return NextResponse.redirect(
        `${origin}${event.cancelPath}?checkoutError=stripe_session_failed`,
        {
          status: 303,
        },
      );
    }

    const session = (await response.json()) as { url?: string };

    return NextResponse.redirect(
      session.url ?? `${origin}${event.cancelPath}?checkoutError=session_url_missing`,
      {
        status: 303,
      },
    );
  } catch (error) {
    console.error("Unexpected Stripe event checkout error", error);

    return NextResponse.redirect(
      `${origin}${event.cancelPath}?checkoutError=unexpected_error`,
      {
        status: 303,
      },
    );
  }
}
