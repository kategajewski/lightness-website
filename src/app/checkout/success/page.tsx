import Link from "next/link";
import { getOfferBySlug } from "@/lib/offers";
import { site } from "@/lib/site";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    type?: string;
    slug?: string;
    eventSlug?: string;
  }>;
};

const eventContent = {
  "sacred-sounds-under-the-sky": {
    title: "Your ticket is reserved.",
    description:
      "Your place for Sacred Sounds Under the Sky has been received. You can watch your email for your Stripe confirmation and any event updates.",
    primaryHref: site.links.sacredSoundsUnderTheSky,
    primaryLabel: "Back to Event Details",
    secondaryHref: site.links.events,
    secondaryLabel: "Browse Events",
  },
  "soothing-sunday-may-17-2026": {
    title: "You're booked for Soothing Sunday.",
    description:
      "Your Soothing Sunday ticket has been received. You can watch your email for your Stripe confirmation and any reminders for the May 17 gathering.",
    primaryHref: "/soothing-sunday",
    primaryLabel: "Back to Soothing Sunday",
    secondaryHref: site.links.events,
    secondaryLabel: "Browse Events",
  },
  "soothing-sunday-june-14-2026": {
    title: "You're booked for Soothing Sunday.",
    description:
      "Your Soothing Sunday ticket has been received. You can watch your email for your Stripe confirmation and any reminders for the June 14 gathering.",
    primaryHref: "/soothing-sunday",
    primaryLabel: "Back to Soothing Sunday",
    secondaryHref: site.links.events,
    secondaryLabel: "Browse Events",
  },
} as const;

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { type, slug, eventSlug } = await searchParams;
  const offer = slug ? getOfferBySlug(slug) : undefined;
  const event =
    type === "event" && eventSlug
      ? eventContent[eventSlug as keyof typeof eventContent]
      : undefined;

  const eyebrow = type === "event" ? "Ticket Confirmed" : "Payment Complete";
  const title = event?.title ?? "You're in.";
  const description =
    event?.description ??
    (offer
      ? `Your payment for ${offer.name} has been received. A Stripe confirmation should be on its way to your email now.`
      : "Your payment has been received. A Stripe confirmation should be on its way to your email now.");
  const primaryHref =
    event?.primaryHref ?? (offer ? `/checkout/${offer.slug}` : "/account");
  const primaryLabel =
    event?.primaryLabel ?? (offer ? "Back to Offer Details" : "Go to Member Area");
  const secondaryHref =
    event?.secondaryHref ?? (offer ? site.links.courses : site.links.courses);
  const secondaryLabel = event?.secondaryLabel ?? "Back to Catalog";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-82px)] w-full max-w-[900px] flex-col justify-center px-4 py-16 text-center sm:px-6">
      <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {eyebrow}
      </span>
      <h1 className="font-display text-[clamp(3rem,7vw,4.8rem)] leading-[0.96] tracking-[-0.02em]">
        {title}
      </h1>
      <p className="mx-auto mt-5 max-w-[38rem] text-[1.04rem] text-[var(--color-muted)]">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={primaryHref}
          className="button-pill"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="button-pill"
        >
          {secondaryLabel}
        </Link>
      </div>
    </main>
  );
}
