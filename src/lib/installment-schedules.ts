import "server-only";
import type Stripe from "stripe";
import { getOfferBySlug } from "@/lib/offers";

export type InstallmentScheduleStatus =
  | "skipped"
  | "configured"
  | "already_configured"
  | "failed";

function getSubscriptionId(session: Stripe.Checkout.Session) {
  return typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;
}

function getScheduleId(subscription: Stripe.Subscription) {
  return typeof subscription.schedule === "string"
    ? subscription.schedule
    : subscription.schedule?.id;
}

export async function configureInstallmentScheduleFromSession(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
): Promise<InstallmentScheduleStatus> {
  const metadata = session.metadata ?? {};
  const offer = metadata.offerSlug
    ? getOfferBySlug(metadata.offerSlug)
    : undefined;
  const option = offer?.purchaseOptions?.find(
    (item) => item.key === metadata.optionKey,
  );
  const installmentCount = option?.installmentCount;
  const subscriptionId = getSubscriptionId(session);

  if (
    metadata.fixedInstallmentPlan !== "true" ||
    !installmentCount ||
    !subscriptionId
  ) {
    return "skipped";
  }

  try {
    let subscription = await stripe.subscriptions.retrieve(subscriptionId);
    let scheduleId = getScheduleId(subscription);
    let schedule: Stripe.SubscriptionSchedule;

    if (scheduleId) {
      schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
    } else {
      try {
        schedule = await stripe.subscriptionSchedules.create({
          from_subscription: subscriptionId,
        });
      } catch (error) {
        // The webhook and success page can arrive together. If another request
        // created the schedule first, retrieve it and continue safely.
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
        scheduleId = getScheduleId(subscription);

        if (!scheduleId) {
          throw error;
        }

        schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
      }
    }

    if (
      schedule.metadata?.fixedInstallmentConfigured === "true" &&
      schedule.metadata.installmentCount === String(installmentCount) &&
      schedule.end_behavior === "cancel"
    ) {
      return "already_configured";
    }

    if (!["active", "not_started"].includes(schedule.status)) {
      console.error("Fixed installment schedule is not editable", {
        scheduleId: schedule.id,
        status: schedule.status,
      });
      return "failed";
    }

    const phaseStart =
      schedule.current_phase?.start_date ?? subscription.start_date;
    const items = subscription.items.data.map((item) => ({
      price: item.price.id,
      quantity: item.quantity ?? undefined,
    }));

    if (items.length === 0) {
      console.error("Fixed installment subscription has no items", {
        subscriptionId,
      });
      return "failed";
    }

    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: "cancel",
      metadata: {
        fixedInstallmentConfigured: "true",
        installmentCount: String(installmentCount),
        offerSlug: offer?.slug ?? "",
        optionKey: option?.key ?? "",
      },
      proration_behavior: "none",
      phases: [
        {
          start_date: phaseStart,
          duration: {
            interval: "month",
            interval_count: installmentCount,
          },
          items,
          metadata: {
            fixedInstallmentPlan: "true",
            installmentCount: String(installmentCount),
            offerSlug: offer?.slug ?? "",
            optionKey: option?.key ?? "",
          },
          proration_behavior: "none",
        },
      ],
    });

    return "configured";
  } catch (error) {
    console.error("Fixed installment schedule configuration failed", error);
    return "failed";
  }
}
