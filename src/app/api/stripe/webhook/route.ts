import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { processCheckoutSessionConfirmation } from "@/lib/checkout-confirmation";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  if (!env.stripeWebhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 500 },
    );
  }

  const stripe = await getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripeWebhookSecret,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);

    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await processCheckoutSessionConfirmation(session.id, "webhook");
  }

  return NextResponse.json({ received: true });
}
