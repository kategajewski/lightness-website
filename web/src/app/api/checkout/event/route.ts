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
    name: "Soothing Sunday at Island Kava - May 17, 2026",
    description: "Ticket for the May 17 gentle stretching, sound bath, and kava gathering.",
    amountCents: 4500,
    successPath: "/checkout/success",
    cancelPath: "/soothing-sunday",
  },
  "soothing-sunday-june-14-2026": {
    name: "Soothing Sunday at Island Kava - June 14, 2026",
    description: "Ticket for the June 14 gentle stretching, sound bath, and kava gathering.",
    amountCents: 4500,
    successPath: "/checkout/success",
    cancelPath: "/soothing-sunday",
  },
} as const;

export async function POST(request: Request) {
  const formData = await request.formData();
  const eventSlug = String(formData.get("eventSlug") ?? "");
  const event = eventCheckoutConfig[
    eventSlug as keyof typeof eventCheckoutConfig
  ];

  if (!event || eventSlug === "sacred-sounds-under-the-sky") {
    return NextResponse.redirect(`${env.siteUrl}/events`, { status: 303 });
  }

  if (!integrations.stripe || !env.stripeSecretKey) {
    return NextResponse.redirect(`${env.siteUrl}${event.cancelPath}`, {
      status: 303,
    });
  }

  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(event.amountCents),
    "line_items[0][price_data][product_data][name]": event.name,
    "line_items[0][price_data][product_data][description]": event.description,
    "line_items[0][quantity]": "1",
    success_url: `${env.siteUrl}${event.successPath}`,
    cancel_url: `${env.siteUrl}${event.cancelPath}`,
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
    return NextResponse.redirect(`${env.siteUrl}${event.cancelPath}`, {
      status: 303,
    });
  }

  const session = (await response.json()) as { url?: string };

  return NextResponse.redirect(session.url ?? `${env.siteUrl}${event.cancelPath}`, {
    status: 303,
  });
}
