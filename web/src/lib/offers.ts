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
  stripePriceId?: string;
  purchaseOptions?: {
    key: string;
    label: string;
    priceLabel: string;
    description: string;
    mode: "subscription" | "payment";
    stripePriceId?: string;
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
      "https://storage.googleapis.com/msgsndr/UjW44wJD5eUk7BCDEe2Z/media/68353a2c66829d893e8f2029.webp",
    href: "/checkout/monthly-membership",
    stripePriceId: env.stripePriceMembershipMonthly,
  },
  {
    slug: "reiki-rising",
    name: "Reiki Rising",
    category: "course",
    format: "one_time",
    priceLabel: "One-time enrollment",
    description:
      "A guided Reiki training experience for students ready to deepen their practice and step into healing work with structure.",
    audience:
      "Best for students who want a dedicated training container rather than a casual workshop.",
    cta: "Reserve Your Spot",
    features: [
      "Dedicated course landing page",
      "Student login and private content area",
      "Checkout flow ready for Stripe once price IDs are added",
      "Follow-up welcome and confirmation pages",
    ],
    detail:
      "This offer is a strong candidate for the first full course migration because it already exists as a separate registration flow on the current site.",
    image:
      "https://storage.googleapis.com/msgsndr/UjW44wJD5eUk7BCDEe2Z/media/68353a2cc305a903ecc0be02.webp",
    href: "/checkout/reiki-rising",
    stripePriceId: env.stripePriceReikiRising,
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
      "Live in-person training held October 2-4, 2026",
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
          "Pay in full to reserve your place in the October 2-4, 2026 training.",
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
        key: "gift-140",
        label: "$140 Gift Certificate",
        priceLabel: "$140",
        description:
          "A beautiful amount that aligns with a core private session.",
        mode: "payment",
        stripePriceId: env.stripePriceGiftCertificate140,
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

  return {
    stripeConfigured: integrations.stripe,
    hasPriceId: Boolean(offer.stripePriceId) || hasAnyOptionPrice,
    checkoutReady:
      integrations.stripe &&
      (Boolean(offer.stripePriceId) || hasAnyOptionPrice),
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
