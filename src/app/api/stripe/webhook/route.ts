import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { processCheckoutSessionConfirmation } from "@/lib/checkout-confirmation";
import { env } from "@/lib/env";
import { processInvoiceConfirmation } from "@/lib/invoice-confirmation";
import { getStripe } from "@/lib/stripe/server";
import { fulfillHolidayVoucherFromPayment, processHolidayVoucherRefund } from "@/lib/holiday-voucher-fulfillment";

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

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;

    const result = await processCheckoutSessionConfirmation(
      session.id,
      "webhook",
    );

    if (result.installmentSchedule === "failed") {
      return NextResponse.json(
        { error: "Fixed installment schedule configuration failed." },
        { status: 500 },
      );
    }

    if (result.portalAccess === "failed") {
      return NextResponse.json(
        { error: "Portal access provisioning failed." },
        { status: 500 },
      );
    }

    if (session.metadata?.holidayCampaignId && session.payment_status === "paid") {
      if (!["sent", "already_sent"].includes(result.customerEmail)) {
        return NextResponse.json({ error: "Paid gift certificate email delivery failed. Please retry." }, { status: 500 });
      }
      try {
        await fulfillHolidayVoucherFromPayment(session, event);
      } catch {
        console.error("Promotional voucher fulfillment failed", { eventId: event.id });
        return NextResponse.json({ error: "Promotional voucher fulfillment failed. Please retry." }, { status: 500 });
      }
    }
  }

  if (event.type === "charge.refunded") {
    try {
      await processHolidayVoucherRefund(event.data.object.id, event.id);
    } catch {
      console.error("Promotional refund reconciliation failed", { eventId: event.id });
      return NextResponse.json({ error: "Promotional refund reconciliation failed. Please retry." }, { status: 500 });
    }
  }

  if (event.type === "invoice.paid") {
    try {
      await processInvoiceConfirmation(event.data.object.id);
    } catch (error) {
      console.error("Invoice enrollment confirmation failed", error);
      return NextResponse.json(
        { error: "Invoice enrollment confirmation failed. Please retry." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
