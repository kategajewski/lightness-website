import Link from "next/link";
import { processCheckoutSessionConfirmation } from "@/lib/checkout-confirmation";
import { getEventBySlug } from "@/lib/events";
import { getOfferBySlug } from "@/lib/offers";
import { site } from "@/lib/site";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    type?: string;
    slug?: string;
    eventSlug?: string;
    session_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { type, slug, eventSlug, session_id: sessionId } = await searchParams;
  const confirmationResult = sessionId
    ? await processCheckoutSessionConfirmation(sessionId, "success_page")
    : undefined;
  const offer = slug ? getOfferBySlug(slug) : undefined;
  const event = type === "event" ? getEventBySlug(eventSlug) : undefined;

  const eyebrow = type === "event" ? "Ticket Confirmed" : "Payment Complete";
  const title = event?.confirmationTitle ?? "You're in.";
  const description =
    event?.confirmationDescription ??
    (offer
      ? offer.slug === "gift-certificate"
        ? confirmationResult?.customerEmail === "sent" ||
          confirmationResult?.customerEmail === "already_sent"
          ? "Your gift certificate purchase has been received. A printable certificate PDF with its unique code should be on its way to your email now."
          : "Your gift certificate purchase has been received. If the printable certificate PDF does not arrive shortly, please contact Kate and she will send it personally."
        : `Your payment for ${offer.name} has been received. A Stripe confirmation should be on its way to your email now.`
      : "Your payment has been received. A Stripe confirmation should be on its way to your email now.");
  const primaryHref =
    event?.detailHref ?? (offer ? `/checkout/${offer.slug}` : "/account");
  const primaryLabel =
    event ? "Back to Event Details" : offer ? "Back to Offer Details" : "Go to Member Area";
  const secondaryHref =
    event ? site.links.events : offer ? site.links.courses : site.links.courses;
  const secondaryLabel = event ? "Browse Events" : "Back to Catalog";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-82px)] w-full max-w-[900px] flex-col justify-center px-4 py-16 text-center sm:px-6">
      <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {eyebrow}
      </span>
      <h1 className="display-page-title">
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
