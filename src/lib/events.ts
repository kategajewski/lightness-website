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
  registrationClosed?: boolean;
};

export const eventCheckoutConfig = {
  "rise-into-light": {
    slug: "rise-into-light",
    name: "Rise into Light",
    description:
      "Ticket for Rise into Light, a 75-minute summer solstice yoga and sound journey at The Lightness Grounds. All purchases are final and non-refundable.",
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
      "Refund policy: All purchases are final and non-refundable.",
    ],
    emailReminderLines: [
      "Please bring a yoga mat, blanket, water, and anything that helps you feel comfortable outdoors.",
      "There is no rain date for this event. All purchases are final and non-refundable.",
    ],
  },
  "golden-hour-summer-solstice-sound-journey": {
    slug: "golden-hour-summer-solstice-sound-journey",
    name: "Golden Hour: A Summer Solstice Sound Journey",
    description:
      "Advance ticket for the Wednesday, June 24, 2026 sunset summer solstice sound journey. Tickets move to the rain date if needed and are non-refundable.",
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
      "All purchases are final and non-refundable.",
    ],
  },
  "golden-hour-july-28-2026": {
    slug: "golden-hour-july-28-2026",
    name: "Golden Hour: An Outdoor Sound Journey",
    description:
      "Advance ticket for the Tuesday, July 28, 2026 golden hour outdoor sound journey. Tickets move to the rain date if needed and are non-refundable.",
    amountCents: 3000,
    successPath: "/checkout/success",
    cancelPath: "/sacred-sounds-under-the-sky",
    detailHref: site.links.sacredSoundsUnderTheSky,
    confirmationTitle: "You're booked for Golden Hour.",
    confirmationDescription:
      "Your advance ticket for Golden Hour: An Outdoor Sound Journey has been received. You can watch your email for your Stripe confirmation and any event reminders.",
    emailIntro:
      "Your place is confirmed. I'm so glad you'll be joining this golden-hour outdoor sound journey.",
    emailDetailLines: [
      "Date: Tuesday, July 28, 2026",
      "Time: 7:30 PM",
      "Location: The Lightness Grounds, Bayport, NY",
      "Rain date: Wednesday, July 29, 2026 at 7:30 PM",
      "Day-of tickets: $35 if space is still available",
    ],
    emailReminderLines: [
      "Please dress in layers and bring a yoga mat, blanket, or anything else that helps you feel cozy, settled, and supported.",
      "This is a fully outdoor gathering and there are no bathroom facilities on site.",
      "If weather shifts the event, tickets move to the rain date and remain non-refundable.",
    ],
  },
  "golden-hour-august-25-2026": {
    slug: "golden-hour-august-25-2026",
    name: "Golden Hour: An Outdoor Sound Journey",
    description:
      "Advance ticket for the Tuesday, August 25, 2026 golden hour outdoor sound journey. Tickets move to the rain date if needed and are non-refundable.",
    amountCents: 3000,
    successPath: "/checkout/success",
    cancelPath: "/golden-hour-august-25",
    detailHref: "/golden-hour-august-25",
    confirmationTitle: "You're booked for Golden Hour.",
    confirmationDescription:
      "Your advance ticket for Golden Hour: An Outdoor Sound Journey has been received. You can watch your email for your Stripe confirmation and any event reminders.",
    emailIntro:
      "Your place is confirmed. I'm so glad you'll be joining this golden-hour outdoor sound journey.",
    emailDetailLines: [
      "Date: Tuesday, August 25, 2026",
      "Time: 7:30 PM",
      "Location: The Lightness Grounds, Bayport, NY",
      "Rain date: Thursday, August 27, 2026 at 7:30 PM",
      "Day-of tickets: $35 if space is still available",
    ],
    emailReminderLines: [
      "Please dress in layers and bring a yoga mat, blanket, or anything else that helps you feel cozy, settled, and supported.",
      "This is a fully outdoor gathering and there are no bathroom facilities on site.",
      "If weather shifts the event, tickets move to the rain date and remain non-refundable.",
    ],
  },
  "reiki-share-july-1-2026": {
    slug: "reiki-share-july-1-2026",
    name: "Reiki Share",
    description:
      "Ticket for Reiki Share, a practitioner-only community gathering at The Lightness of Being. All purchases are final and non-refundable.",
    amountCents: 2500,
    successPath: "/checkout/success",
    cancelPath: site.links.reikiShareJuly,
    detailHref: site.links.reikiShareJuly,
    confirmationTitle: "You're booked for Reiki Share.",
    confirmationDescription:
      "Your Reiki Share ticket has been received. You can watch your email for your Stripe receipt and event confirmation.",
    emailIntro:
      "Your place is confirmed. I'm so glad you'll be joining Reiki Share.",
    emailDetailLines: ["Date: Wednesday, July 1, 2026"],
    emailReminderLines: [
      "This gathering is intended for Reiki practitioners and students.",
      "If you have any questions before the event, you are always welcome to reach out.",
      "All purchases are final and non-refundable.",
    ],
  },
  "reiki-share-august-6-2026": {
    slug: "reiki-share-august-6-2026",
    name: "Reiki Share",
    description:
      "Ticket for Reiki Share, a practitioner-only community gathering at The Lightness of Being. All purchases are final and non-refundable.",
    amountCents: 2500,
    successPath: "/checkout/success",
    cancelPath: "/reiki-share",
    detailHref: site.links.reikiShare,
    confirmationTitle: "You're booked for Reiki Share.",
    confirmationDescription:
      "Your Reiki Share ticket has been received. You can watch your email for your Stripe receipt and event confirmation.",
    emailIntro:
      "Your place is confirmed. I'm so glad you'll be joining Reiki Share.",
    emailDetailLines: ["Date: Thursday, August 6, 2026"],
    emailReminderLines: [
      "This gathering is intended for Reiki practitioners and students.",
      "If you have any questions before the event, you are always welcome to reach out.",
      "All purchases are final and non-refundable.",
    ],
  },
  "the-weekend-reset-july-11-2026": {
    slug: "the-weekend-reset-july-11-2026",
    name: "The Weekend Reset",
    description:
      "Ticket for The Weekend Reset, a 75-minute outdoor gentle yoga and sound bath experience at The Lightness Grounds. Tickets move to the rain date if needed and are non-refundable.",
    amountCents: 3000,
    registrationClosed: true,
    successPath: "/checkout/success",
    cancelPath: "/the-weekend-reset",
    detailHref: site.links.theWeekendReset,
    confirmationTitle: "You're booked for The Weekend Reset.",
    confirmationDescription:
      "Your ticket for The Weekend Reset has been received. You can watch your email for your Stripe receipt and event confirmation.",
    emailIntro:
      "Your place is confirmed. I'm so glad you'll be joining The Weekend Reset for this gentle morning of yoga and sound healing.",
    emailDetailLines: [
      "Date: Saturday, July 11, 2026",
      "Time: 8:00-9:15 AM",
      "Length: 75 minutes",
      "Location: The Lightness Grounds, corner of Gillette Avenue and Academy Street, Bayport, NY",
      "Rain date: Sunday, July 12, 2026",
    ],
    emailReminderLines: [
      "Please bring a yoga mat, blanket, water, and anything that helps you feel comfortable outdoors.",
      "If rain moves the gathering, tickets move to the Sunday, July 12, 2026 rain date and remain non-refundable.",
    ],
  },
  "flow-field-august-16-2026": {
    slug: "flow-field-august-16-2026",
    name: "Flow Field",
    description:
      "Ticket for Flow Field, a 90-minute open-air vinyasa flow and restorative sound healing experience at The Lightness Grounds. If rain cancels the gathering, tickets will be refunded. Otherwise, tickets are non-refundable but transferable.",
    amountCents: 4500,
    successPath: "/checkout/success",
    cancelPath: site.links.flowField,
    detailHref: site.links.flowField,
    confirmationTitle: "You're booked for Flow Field.",
    confirmationDescription:
      "Your ticket for Flow Field has been received. You can watch your email for your Stripe receipt and event confirmation.",
    emailIntro:
      "Your place is confirmed. I'm so glad you'll be joining Flow Field with Kate Gajewski and Kelly Fitzsimons.",
    emailDetailLines: [
      "Date: Sunday, August 16, 2026",
      "Time: 8:00-9:30 AM",
      "Length: 90 minutes",
      "Location: The Lightness Grounds, corner of Gillette Avenue and Academy Street, Bayport, NY",
      "Exchange: $45",
    ],
    emailReminderLines: [
      "Please bring a yoga mat, blanket or towel, water, and layers for the sound healing portion.",
      "If rain cancels the gathering, tickets will be refunded and everyone will be alerted by email the night before.",
      "Otherwise, tickets are non-refundable, but they may be transferred to someone else.",
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
