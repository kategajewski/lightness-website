import Link from "next/link";
import { getOfferBySlug } from "@/lib/offers";
import { site } from "@/lib/site";

type CheckoutCancelPageProps = {
  searchParams: Promise<{
    type?: string;
    slug?: string;
    eventSlug?: string;
  }>;
};

const eventCancelContent = {
  "sacred-sounds-under-the-sky": {
    primaryHref: site.links.sacredSoundsUnderTheSky,
    primaryLabel: "Back to Event Details",
  },
  "soothing-sunday-june-14-2026": {
    primaryHref: "/soothing-sunday",
    primaryLabel: "Back to Soothing Sunday",
  },
} as const;

export default async function CheckoutCancelPage({
  searchParams,
}: CheckoutCancelPageProps) {
  const { type, slug, eventSlug } = await searchParams;
  const offer = slug ? getOfferBySlug(slug) : undefined;
  const event =
    type === "event" && eventSlug
      ? eventCancelContent[eventSlug as keyof typeof eventCancelContent]
      : undefined;

  const description =
    type === "event"
      ? "Your ticket was not completed, and that is completely okay. If you still want to come, you can return to the event page and try again whenever you're ready."
      : offer
        ? `Your checkout for ${offer.name} was not completed. You can return to the offer details whenever you're ready.`
        : "Your checkout was not completed. You can return whenever you're ready.";
  const primaryHref =
    event?.primaryHref ?? (offer ? `/checkout/${offer.slug}` : site.links.courses);
  const primaryLabel =
    event?.primaryLabel ?? (offer ? "Back to Offer Details" : "Return to Catalog");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-82px)] w-full max-w-[900px] flex-col justify-center px-4 py-16 text-center sm:px-6">
      <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        Checkout Paused
      </span>
      <h1 className="display-page-title">
        No worries.
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
          href={type === "event" ? site.links.events : site.links.contact}
          className="button-pill"
        >
          {type === "event" ? "Browse Events" : "Ask a Question"}
        </Link>
      </div>
    </main>
  );
}
