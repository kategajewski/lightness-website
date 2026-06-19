import { env } from "@/lib/env";
import { site } from "@/lib/site";

export type EventCheckoutConfig = {
  slug: string;
  name: string;
  description: string;
  amountCents: number;
  successPath: string;
  cancelPath: string;
  detailHref: string;
  confirmationTitle: string;
  confirmationDescription: string;
  emailIntro: string;
  emailDetailLines: string[];
  emailReminderLines: string[];
};

export const eventCheckoutConfig = {
  "rise-into-light": {
    slug: "rise-into-light",
    name: "Rise into Light",
    description:
      "Ticket for Rise into Light, a 75-minute summer solstice yoga and sound journey at The Lightness Grounds.",
    amountCents: 3000,
    successPath: "/checkout/success",
    cancelPath: "/rise-into-light",
    detailHref: site.links.riseIntoLight,
    confirmationTitle: "You're booked for Rise into Light.",
    confirmationDescription:
      "Your ticket for Rise into Light has been received. You can watch your email for your Stripe receipt and event confirmation.",
    emailIntro:
      "Your place is confirmed. I'm so glad you'll be joining Rise into Light for this summer solstice yoga and sound journey.",
    emailDetailLines: [
      "Date: Sunday, June 21, 2026",
      "Time: 8:00 AM",
      "Length: 75 minutes",
      "Location: The Lightness Grounds, corner of Gillette Avenue and Academy Street, Bayport, NY",
      "Refund policy: Refunds are available only if the event is cancelled due to rain.",
    ],
    emailReminderLines: [
      "Please bring a yoga mat, blanket, water, and anything that helps you feel comfortable outdoors.",
      "There is no rain date for this event. If rain cancels the gathering, your ticket will be refunded.",
    ],
  },
  "golden-hour-summer-solstice-sound-journey": {
    slug: "golden-hour-summer-solstice-sound-journey",
    name: "Golden Hour: A Summer Solstice Sound Journey",
    description:
      "Advance ticket for the Wednesday, June 24, 2026 sunset summer solstice sound journey.",
    amountCents: 3000,
    successPath: "/checkout/success",
    cancelPath: "/sacred-sounds-under-the-sky",
    detailHref: site.links.sacredSoundsUnderTheSky,
    confirmationTitle: "You're booked for Golden Hour.",
    confirmationDescription:
      "Your advance ticket for Golden Hour: A Summer Solstice Sound Journey has been received. You can watch your email for your Stripe confirmation and any event reminders.",
    emailIntro:
      "Your place is confirmed. I'm so glad you'll be joining this golden-hour summer solstice sound journey.",
    emailDetailLines: ["Date: Wednesday, June 24, 2026"],
    emailReminderLines: [
      "You do not need any previous experience to come.",
      "Please dress comfortably, in layers and bring a yoga mat and blanket.",
    ],
  },
  "reiki-share-july-1-2026": {
    slug: "reiki-share-july-1-2026",
    name: "Reiki Share",
    description:
      "Ticket for Reiki Share, a practitioner-only community gathering at The Lightness of Being.",
    amountCents: 2500,
    successPath: "/checkout/success",
    cancelPath: "/reiki-share",
    detailHref: site.links.reikiShare,
    confirmationTitle: "You're booked for Reiki Share.",
    confirmationDescription:
      "Your Reiki Share ticket has been received. You can watch your email for your Stripe receipt and event confirmation.",
    emailIntro:
      "Your place is confirmed. I'm so glad you'll be joining Reiki Share.",
    emailDetailLines: ["Date: Wednesday, July 1, 2026"],
    emailReminderLines: [
      "This gathering is intended for Reiki practitioners and students.",
      "If you have any questions before the event, you are always welcome to reach out.",
    ],
  },
} as const satisfies Record<string, EventCheckoutConfig>;

export type EventSlug = keyof typeof eventCheckoutConfig;

export const activeEventSlugs = Object.keys(eventCheckoutConfig) as EventSlug[];

export function getEventBySlug(slug: string | undefined) {
  if (!slug) {
    return undefined;
  }

  return eventCheckoutConfig[slug as EventSlug];
}

export function getEventDetailUrl(slug: string | undefined) {
  const event = getEventBySlug(slug);

  return event
    ? `${env.siteUrl}${event.detailHref}`
    : `${env.siteUrl}${site.links.events}`;
}
