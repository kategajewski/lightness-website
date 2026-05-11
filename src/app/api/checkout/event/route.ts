import { NextResponse } from "next/server";
import { env, integrations } from "@/lib/env";

const eventCheckoutConfig = {
  "sacred-sounds-under-the-sky": {
    name: "Sacred Sounds Under the Sky",
    description: "Advance ticket for the outdoor sound bath experience.",
    amountCents: 3000,
    successPath: "/checkout/success",
    cancelPath: "/sacred-sounds-under-the-sky",
  },
  "soothing-sunday-may-17-2026": {
    name: "Soothing Sunday - May 17, 2026",
    description:
      "Ticket for the Sunday, May 17, 2026 Soothing Sunday gathering in Lindenhurst.",
    amountCents: 4500,
    successPath: "/checkout/success",
    cancelPath: "/soothing-sunday",
  },
  "soothing-sunday-june-14-2026": {
    name: "Soothing Sunday - June 14, 2026",
    description:
      "Ticket for the Sunday, June 14, 2026 Soothing Sunday gathering in Lindenhurst.",
    amountCents: 4500,
    successPath: "/checkout/success",
    cancelPath: "/soothing-sunday",
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
      )}`,
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
