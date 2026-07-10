import { env, integrations } from "@/lib/env";
import { site } from "@/lib/site";

export type Offer = {
  slug: string;
  name: string;
  category: "membership" | "course" | "service";
  format: "subscription" | "one_time" | "inquiry";
  priceLabel: string;
  description: string;
  audience: string;
  cta: string;
  features: string[];
  detail: string;
  image: string;
  href: string;
  accessSlug?: string;
  portalHref?: string;
  stripePriceId?: string;
  purchaseOptions?: {
    key: string;
    label: string;
    priceLabel: string;
    description: string;
    mode: "subscription" | "payment";
    stripePriceId?: string;
    amountCents?: number;
  }[];
};

export const offers: Offer[] = [
  {
    slug: "monthly-membership",
    name: "Monthly Rest & Reset Membership",
    category: "membership",
    format: "subscription",
    priceLabel: "$130 monthly",
    description:
      "A recurring membership for clients who want one Rest & Receive session each month, consistent healing support, and built-in savings.",
    audience:
      "Best for returning clients who benefit from regular support and want a steady, sustainable rhythm of care.",
    cta: "Join Monthly Membership",
    features: [
      "One Rest & Receive session each month",
      "Save $10 monthly compared with the regular $140 session price",
      "Receive 10% off additional private 1:1 services",
      "Unused sessions may roll over, with up to 2 sessions held at a time",
      "Membership is non-transferable and requires a 3-month minimum commitment",
      "Membership may be paused with one month's notice",
    ],
    detail:
      "This membership is designed to create a grounded monthly rhythm of healing, savings, and long-term support without overcomplicating the path.",
    image:
      "/homepage-images/ghl-healing-session.webp",
    href: "/checkout/monthly-membership",
    stripePriceId: env.stripePriceMembershipMonthly,
  },
  {
    slug: "reiki-rising",
    name: "Reiki Rising Fall 2026",
    category: "course",
    format: "one_time",
    priceLabel: "Early Bird $888 or 3 payments of $333",
    description:
      "A 10-week Reiki 1 and Reiki 2 certification journey with weekly prerecorded teachings, live support calls, placements, practice, and community integration.",
    audience:
      "Best for students who want a spacious, supported Reiki training experience rather than a quick weekend class.",
    cta: "Enroll in Reiki Rising",
    features: [
      "Fall 2026 cohort runs September 27 - December 5",
      "Weekly modules drop on Sundays",
      "Live calls are Wednesdays at 7:00 PM ET",
      "Telegram support remains open through the final week",
      "Certification requires live Level 1 and Level 2 placements",
    ],
    detail:
      "Early Bird enrollment is available through September 1, 2026.",
    image:
      "/homepage-images/ghl-reiki-rising.webp",
    href: "/checkout/reiki-rising",
    accessSlug: "reiki-rising-fall-2026",
    portalHref: "/library/reiki-rising-fall-2026",
    stripePriceId: env.stripePriceReikiRising,
    purchaseOptions: [
      {
        key: "early-bird-full",
        label: "Early Bird Pay in Full",
        priceLabel: "$888 one-time",
        description:
          "Pay in full to reserve your place in Reiki Rising Fall 2026.",
        mode: "payment",
        stripePriceId: env.stripePriceReikiRising,
        amountCents: 88800,
      },
      {
        key: "early-bird-plan",
        label: "Early Bird Payment Plan",
        priceLabel: "3 payments of $333",
        description:
          "Choose a three-payment rhythm while still reserving your place in the cohort.",
        mode: "subscription",
        stripePriceId: env.stripePriceReikiRisingEarlyBirdPlan,
      },
    ],
  },
  {
    slug: "sound-training",
    name: "Sound Practitioner Training",
    category: "course",
    format: "one_time",
    priceLabel: "$1,344 or 5 monthly payments of $288",
    description:
      "A live immersive training for those who want to facilitate sound experiences with intention, grounded presence, and embodied confidence.",
    audience:
      "Best for practitioners, space holders, and heart-led students who feel called to bring sound more intentionally into healing work, classes, ceremonies, or private sessions.",
    cta: "Reserve Your Spot",
    features: [
      "Live in-person training held September 18-20, 2026",
      "Full payment option of $1,344",
      "Payment plan option of 5 monthly payments of $288",
      "Hands-on learning with instruments, facilitation, and practitioner presence",
    ],
    detail:
      "This checkout page is being prepared for live registration. The offer itself is fully defined now so the final Stripe step can simply be connected when you're ready.",
    image: "/homepage-images/moodysound.jpeg",
    href: "/checkout/sound-training",
    stripePriceId: env.stripePriceSoundTraining,
    purchaseOptions: [
      {
        key: "full-payment",
        label: "Full Payment",
        priceLabel: "$1,344 one-time",
        description:
          "Pay in full to reserve your place in the September 18-20, 2026 training.",
        mode: "payment",
        stripePriceId:
          env.stripePriceSoundTrainingFull || env.stripePriceSoundTraining,
      },
      {
        key: "payment-plan",
        label: "5-Month Payment Plan",
        priceLabel: "5 monthly payments of $288",
        description:
          "Choose a monthly payment rhythm while still reserving your place in the training.",
        mode: "subscription",
        stripePriceId: env.stripePriceSoundTrainingPlan,
      },
    ],
  },
  {
    slug: "gift-certificate",
    name: "Gift Certificate",
    category: "service",
    format: "one_time",
    priceLabel: "One-time purchase",
    description:
      "A simple giftable purchase flow for clients who want to offer healing support to someone they love.",
    audience:
      "Best for holiday, milestone, or care-based gifting.",
    cta: "Purchase Gift Certificate",
    features: [
      "Simple checkout page",
      "Can later support multiple gift amounts",
      "Good bridge product for paid traffic and seasonal campaigns",
      "Natural fit for Stripe Checkout",
    ],
    detail:
      "This offer can launch quickly and gives you a non-course payment path on the new platform.",
    image: "/homepage-images/gift-certificate-lantern.jpeg",
    href: "/checkout/gift-certificate",
    stripePriceId: env.stripePriceGiftCertificate,
    purchaseOptions: [
      {
        key: "gift-50",
        label: "$50 Gift Certificate",
        priceLabel: "$50",
        description:
          "A gentle entry-point gift for care, support, or a thoughtful offering.",
        mode: "payment",
        stripePriceId:
          env.stripePriceGiftCertificate50 || env.stripePriceGiftCertificate,
      },
      {
        key: "gift-100",
        label: "$100 Gift Certificate",
        priceLabel: "$100",
        description:
          "A flexible gift amount for healing support and meaningful care.",
        mode: "payment",
        stripePriceId: env.stripePriceGiftCertificate100,
      },
      {
        key: "gift-150",
        label: "$150 Gift Certificate",
        priceLabel: "$150",
        description:
          "A beautiful amount for a private session gift with a little extra room for support.",
        mode: "payment",
        stripePriceId: env.stripePriceGiftCertificate150,
        amountCents: 15000,
      },
      {
        key: "gift-250",
        label: "$250 Gift Certificate",
        priceLabel: "$250",
        description:
          "A more generous gift for deeper support or multiple offerings.",
        mode: "payment",
        stripePriceId: env.stripePriceGiftCertificate250,
      },
      {
        key: "gift-500",
        label: "$500 Gift Certificate",
        priceLabel: "$500",
        description:
          "A premium gift for someone you want to support in a meaningful way.",
        mode: "payment",
        stripePriceId: env.stripePriceGiftCertificate500,
      },
    ],
  },
];

export const featuredCourses = offers.filter((offer) => offer.category === "course");
export const featuredMemberships = offers.filter(
  (offer) => offer.category === "membership",
);

export function getOfferBySlug(slug: string) {
  return offers.find((offer) => offer.slug === slug);
}

export function getCheckoutReadiness(offer: Offer) {
  const optionPriceIds =
    offer.purchaseOptions?.map((option) => option.stripePriceId).filter(Boolean) ??
    [];
  const hasAnyOptionPrice = optionPriceIds.length > 0;
  const hasAnyInlinePrice =
    offer.purchaseOptions?.some((option) => Boolean(option.amountCents)) ?? false;

  return {
    stripeConfigured: integrations.stripe,
    hasPriceId:
      Boolean(offer.stripePriceId) || hasAnyOptionPrice || hasAnyInlinePrice,
    checkoutReady:
      integrations.stripe &&
      (Boolean(offer.stripePriceId) || hasAnyOptionPrice || hasAnyInlinePrice),
    currentFallbackHref:
      offer.slug === "monthly-membership"
        ? site.links.membership
        : offer.slug === "sound-training"
          ? site.links.soundTraining
        : offer.slug === "gift-certificate"
          ? site.links.giftCertificate
          : site.links.contact,
  };
}
