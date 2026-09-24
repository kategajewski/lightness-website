import "server-only";
import type Stripe from "stripe";
import {
  canSendPurchaseOwnerNotification,
  sendPurchaseConfirmationEmail,
  sendPurchaseOwnerNotificationEmail,
} from "@/lib/email";
import { integrations } from "@/lib/env";
import { provisionOfferPortalAccessFromSession } from "@/lib/portal-access";
import { getStripe } from "@/lib/stripe/server";

const CUSTOMER_EMAIL_SENT_KEY = "customerEmailSentAt";
const OWNER_EMAIL_SENT_KEY = "ownerEmailSentAt";

// Only explicitly tagged, one-time cohort invoices enroll students.
function isEnrollmentInvoice(invoice: Stripe.Invoice) {
  return (
    invoice.billing_reason === "manual" &&
    invoice.collection_method === "send_invoice" &&
    invoice.metadata?.purchaseType === "offer" &&
    invoice.metadata.offerSlug === "reiki-rising" &&
    invoice.metadata.enrollmentAutomation === "reiki-rising-fall-2026"
  );
}

export async function processInvoiceConfirmation(invoiceId: string) {
  const stripe = await getStripe();

  if (!stripe) {
    throw new Error("Stripe is not configured for invoice enrollment.");
  }

  const invoice = await stripe.invoices.retrieve(invoiceId);

  if (!isEnrollmentInvoice(invoice)) {
    return { status: "not_applicable" as const };
  }

  if (invoice.status !== "paid" || invoice.amount_remaining !== 0) {
    return { status: "unpaid" as const };
  }

  const expectedAmount = Number(invoice.metadata?.enrollmentAmountCents);
  const email = invoice.customer_email?.trim().toLowerCase();

  if (
    !Number.isSafeInteger(expectedAmount) ||
    expectedAmount <= 0 ||
    invoice.currency !== "usd" ||
    invoice.total !== expectedAmount ||
    invoice.amount_paid < expectedAmount ||
    !email
  ) {
    throw new Error("Enrollment invoice payment or customer details do not match.");
  }

  const purchase = {
    id: invoice.id,
    amount_total: invoice.amount_paid,
    currency: invoice.currency,
    created: invoice.status_transitions.paid_at ?? invoice.created,
    customer_details: { email, name: invoice.customer_name },
    metadata: { ...invoice.metadata, paymentSource: "invoice" },
  };

  if (!invoice.metadata?.[CUSTOMER_EMAIL_SENT_KEY]) {
    if (!integrations.emailDelivery || !integrations.supabase) {
      throw new Error("Invoice enrollment email or portal is not configured.");
    }

    const portalAccess = await provisionOfferPortalAccessFromSession(purchase);

    if (
      portalAccess.status !== "provisioned" ||
      portalAccess.accessSlug !== "reiki-rising-fall-2026" ||
      (!portalAccess.temporaryPassword && !portalAccess.setupUrl)
    ) {
      throw new Error("Invoice enrollment portal access is not ready.");
    }

    const result = await sendPurchaseConfirmationEmail(purchase, portalAccess);

    if (result.skipped) {
      throw new Error("Invoice enrollment welcome email was not sent.");
    }

    await stripe.invoices.update(invoice.id, {
      metadata: {
        [CUSTOMER_EMAIL_SENT_KEY]: new Date().toISOString(),
        customerEmailSource: "invoice_webhook",
        portalAccessSlug: portalAccess.accessSlug,
      },
    });
  }

  if (
    !invoice.metadata?.[OWNER_EMAIL_SENT_KEY] &&
    canSendPurchaseOwnerNotification()
  ) {
    const result = await sendPurchaseOwnerNotificationEmail(purchase);

    if (result.skipped) {
      throw new Error("Invoice enrollment owner notification was not sent.");
    }

    await stripe.invoices.update(invoice.id, {
      metadata: {
        [OWNER_EMAIL_SENT_KEY]: new Date().toISOString(),
        ownerEmailSource: "invoice_webhook",
      },
    });
  }

  return { status: "complete" as const };
}
