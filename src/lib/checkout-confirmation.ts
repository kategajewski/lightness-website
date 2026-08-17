import "server-only";
import type Stripe from "stripe";
import {
  canSendPurchaseOwnerNotification,
  sendPurchaseConfirmationEmail,
  sendPurchaseOwnerNotificationEmail,
} from "@/lib/email";
import { recordEventAttendanceFromSession } from "@/lib/event-attendance";
import { integrations } from "@/lib/env";
import {
  configureInstallmentScheduleFromSession,
  type InstallmentScheduleStatus,
} from "@/lib/installment-schedules";
import {
  provisionOfferPortalAccessFromSession,
  type PortalProvisioningResult,
} from "@/lib/portal-access";
import { getStripe } from "@/lib/stripe/server";

const CUSTOMER_EMAIL_SENT_KEY = "customerEmailSentAt";
const OWNER_EMAIL_SENT_KEY = "ownerEmailSentAt";

type ConfirmationResult = {
  customerEmail: "sent" | "skipped" | "already_sent" | "failed";
  ownerEmail: "sent" | "skipped" | "already_sent" | "failed";
  portalAccess?: PortalProvisioningResult["status"];
  installmentSchedule?: InstallmentScheduleStatus;
};

export async function processCheckoutSessionConfirmation(
  sessionId: string | undefined | null,
  source: "webhook" | "success_page",
): Promise<ConfirmationResult> {
  const result: ConfirmationResult = {
    customerEmail: "skipped",
    ownerEmail: "skipped",
  };

  if (!sessionId) {
    return result;
  }

  const stripe = await getStripe();

  if (!stripe) {
    return result;
  }

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error("Checkout session confirmation lookup failed", error);
    return result;
  }

  if (
    session.status !== "complete" ||
    !["paid", "no_payment_required"].includes(session.payment_status)
  ) {
    return result;
  }

  const metadata = session.metadata ?? {};
  const metadataUpdates: Stripe.MetadataParam = {};

  result.installmentSchedule =
    await configureInstallmentScheduleFromSession(session, stripe);

  if (
    result.installmentSchedule === "configured" ||
    result.installmentSchedule === "already_configured"
  ) {
    metadataUpdates.installmentScheduleStatus =
      result.installmentSchedule;
    metadataUpdates.installmentScheduleCheckedAt = new Date().toISOString();
  }

  if (metadata.purchaseType === "event") {
    await recordEventAttendanceFromSession(session);
  }

  const portalAccess = await provisionOfferPortalAccessFromSession(session);
  result.portalAccess = portalAccess.status;

  if (integrations.emailDelivery) {
    if (metadata[CUSTOMER_EMAIL_SENT_KEY]) {
      result.customerEmail = "already_sent";
    } else {
      try {
        const emailResult = await sendPurchaseConfirmationEmail(
          session,
          portalAccess,
        );
        result.customerEmail = emailResult.skipped ? "skipped" : "sent";

        if (!emailResult.skipped) {
          metadataUpdates[CUSTOMER_EMAIL_SENT_KEY] = new Date().toISOString();
          metadataUpdates.customerEmailSource = source;
        }
      } catch (error) {
        result.customerEmail = "failed";
        console.error("Purchase confirmation email failed", error);
      }
    }
  }

  if (canSendPurchaseOwnerNotification()) {
    if (metadata[OWNER_EMAIL_SENT_KEY]) {
      result.ownerEmail = "already_sent";
    } else {
      try {
        const ownerResult = await sendPurchaseOwnerNotificationEmail(session);
        result.ownerEmail = ownerResult.skipped ? "skipped" : "sent";

        if (!ownerResult.skipped) {
          metadataUpdates[OWNER_EMAIL_SENT_KEY] = new Date().toISOString();
          metadataUpdates.ownerEmailSource = source;
        }
      } catch (error) {
        result.ownerEmail = "failed";
        console.error("Purchase owner notification email failed", error);
      }
    }
  }

  if (Object.keys(metadataUpdates).length > 0) {
    try {
      await stripe.checkout.sessions.update(session.id, {
        metadata: metadataUpdates,
      });
    } catch (error) {
      console.error("Checkout email metadata update failed", error);
    }
  }

  return result;
}
