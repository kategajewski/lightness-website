import Link from "next/link";
import { notFound } from "next/navigation";
import { getCheckoutReadiness, getOfferBySlug, offers } from "@/lib/offers";
import { site } from "@/lib/site";

type CheckoutPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return offers.map((offer) => ({ slug: offer.slug }));
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const offer = getOfferBySlug(slug);

  if (!offer) {
    notFound();
  }

  const readiness = getCheckoutReadiness(offer);
  const isMembership = offer.slug === "monthly-membership";
  const isSoundTraining = offer.slug === "sound-training";
  const isGiftCertificate = offer.slug === "gift-certificate";
  const hasOptions = Boolean(offer.purchaseOptions?.length);

  return (
    <main className="relative flex flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_center,_rgba(230,194,162,0.42),_rgba(230,194,162,0.16)_32%,_rgba(230,194,162,0.06)_48%,_transparent_72%)] blur-[6px]" />
      <section className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Checkout
          </span>
          <h1 className="display-page-title">
            {offer.name}
          </h1>
          <p className="mt-5 max-w-[36rem] text-[1.03rem] text-[var(--color-muted)]">
            {offer.description}
          </p>
          <div
            className="mt-8 min-h-[420px] rounded-[30px] bg-cover bg-center shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(76,58,48,0.08), rgba(76,58,48,0.22)), url('${offer.image}')`,
            }}
          />
        </div>

        <div className="self-start rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <strong className="text-[1.05rem]">{offer.priceLabel}</strong>
            <span className="rounded-full bg-[rgba(168,178,159,0.18)] px-3 py-1 text-[0.82rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
              {offer.format === "subscription"
                ? "Recurring"
                : offer.format === "inquiry"
                  ? "Waitlist"
                  : "One-time"}
            </span>
          </div>

          <p className="mt-4 text-[var(--color-muted)]">{offer.audience}</p>

          <ul className="mt-6 grid gap-3 text-[var(--color-muted)]">
            {offer.features.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-[22px] bg-[rgba(255,248,242,0.86)] p-5">
            <strong className="block text-[1.02rem]">
              {readiness.checkoutReady
                ? isMembership
                  ? "Ready to complete your membership"
                  : isSoundTraining
                    ? "Ready to reserve your training spot"
                    : isGiftCertificate
                      ? "Choose the gift amount that feels right"
                    : "Ready to complete your purchase"
                : isMembership
                  ? "Checkout will open here soon"
                  : isSoundTraining
                    ? "Join the January 2027 waitlist"
                    : isGiftCertificate
                      ? "Gift checkout will open here soon"
                  : "Checkout will open here soon"}
            </strong>
            <p className="mt-3 text-[var(--color-muted)]">
              {readiness.checkoutReady
                ? isSoundTraining
                  ? "Your secure registration and payment flow is connected and ready."
                  : isGiftCertificate
                    ? "Choose one of the gift amounts below to purchase a certificate for someone you love."
                  : "Your secure payment flow is connected and ready."
                : isMembership
                  ? "This page is being prepared for live recurring checkout. In the meantime, you can review the membership details and return to the membership page for the full offer overview."
                  : isSoundTraining
                    ? "Exact dates are still being finalized. No payment is being accepted yet; join the waitlist to receive the schedule and enrollment details first."
                    : isGiftCertificate
                      ? "This gift certificate checkout is being finalized. In the meantime, you can return to the gift certificate page for more details."
                  : "This checkout page is being prepared for live payment. In the meantime, you can return to the main offer page for full details."}
            </p>
          </div>

          {hasOptions ? (
            <div className="mt-6 grid gap-4">
              {offer.purchaseOptions?.map((option) => (
                <div
                  key={option.key}
                  className="rounded-[22px] bg-[rgba(255,248,242,0.86)] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <strong className="text-[1.02rem]">{option.label}</strong>
                    <span className="rounded-full bg-[rgba(168,178,159,0.18)] px-3 py-1 text-[0.82rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                      {option.priceLabel}
                    </span>
                  </div>
                  <p className="mt-3 text-[var(--color-muted)]">
                    {option.description}
                  </p>
                  <div className="mt-4">
                    {readiness.checkoutReady && option.stripePriceId ? (
                      <form action="/api/checkout" method="post">
                        <input type="hidden" name="slug" value={offer.slug} />
                        <input type="hidden" name="optionKey" value={option.key} />
                        <button type="submit" className="button-pill">
                          {isGiftCertificate
                            ? `Choose ${option.priceLabel}`
                            : `Continue with ${option.label}`}
                        </button>
                      </form>
                    ) : (
                      <Link
                        href={readiness.currentFallbackHref}
                        className="button-pill"
                      >
                        Review Offer Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-3">
                <Link
                  href={
                    isMembership
                      ? site.links.membership
                      : isSoundTraining
                        ? site.links.soundTraining
                        : offer.slug === "gift-certificate"
                          ? site.links.giftCertificate
                          : site.links.courses
                  }
                  className="button-pill"
                >
                  {isMembership
                    ? "Back to Membership"
                    : isSoundTraining
                      ? "Back to Sound Training"
                      : offer.slug === "gift-certificate"
                        ? "Back to Gift Certificates"
                        : "Back to Catalog"}
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3">
              {readiness.checkoutReady ? (
                <form action="/api/checkout" method="post">
                  <input type="hidden" name="slug" value={offer.slug} />
                  <button
                    type="submit"
                    className="button-pill"
                  >
                    {isGiftCertificate
                      ? "Continue to Gift Checkout"
                      : "Continue to Payment"}
                  </button>
                </form>
              ) : (
                <Link
                  href={readiness.currentFallbackHref}
                  className="button-pill"
                >
                  {isMembership
                    ? "View Membership Details"
                    : isSoundTraining
                      ? "Join the Waitlist"
                      : isGiftCertificate
                        ? "Return to Gift Certificate Details"
                      : "Return to Offer Details"}
                </Link>
              )}

              <Link
                href={
                  isMembership
                    ? site.links.membership
                    : isSoundTraining
                      ? site.links.soundTraining
                      : isGiftCertificate
                        ? site.links.giftCertificate
                        : site.links.courses
                }
                className="button-pill"
              >
                {isMembership
                  ? "Back to Membership"
                  : isSoundTraining
                    ? "Back to Sound Training"
                    : isGiftCertificate
                      ? "Back to Gift Certificates"
                      : "Back to Catalog"}
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
