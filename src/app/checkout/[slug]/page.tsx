import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAvailablePurchaseOptions,
  getCheckoutReadiness,
  getOfferBySlug,
} from "@/lib/offers";
import { REIKI_RISING_AGREEMENT_PATH } from "@/lib/reiki-rising-agreement";
import { site } from "@/lib/site";

type CheckoutPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ agreement?: string }>;
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const offer = getOfferBySlug(slug);

  if (!offer) {
    notFound();
  }

  const readiness = getCheckoutReadiness(offer);
  const isMembership = offer.slug === "monthly-membership";
  const isSoundTraining = offer.slug === "sound-training";
  const isGiftCertificate = offer.slug === "gift-certificate";
  const isReikiRising = offer.slug === "reiki-rising";
  const availableOptions = getAvailablePurchaseOptions(offer);
  const hasOptions = availableOptions.length > 0;
  const checkoutFeatures = offer.features;
  const currentPriceLabel = isReikiRising
    ? availableOptions.map((option) => option.priceLabel).join(" or ")
    : offer.priceLabel;

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
            <strong className="text-[1.05rem]">
              {currentPriceLabel || offer.priceLabel}
            </strong>
            <span className="rounded-full bg-[rgba(168,178,159,0.18)] px-3 py-1 text-[0.82rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
              {isReikiRising
                ? "Enrollment"
                : offer.format === "subscription"
                  ? "Recurring"
                : offer.format === "inquiry"
                  ? "Waitlist"
                  : "One-time"}
            </span>
          </div>

          <p className="mt-4 text-[var(--color-muted)]">{offer.audience}</p>

          <ul className="mt-6 grid gap-3 text-[var(--color-muted)]">
            {checkoutFeatures.map((feature) => (
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
                    : isReikiRising
                      ? "Ready to reserve your Reiki Rising place"
                      : "Ready to complete your purchase"
                : isMembership
                  ? "Checkout will open here soon"
                  : isSoundTraining
                    ? "Join the January 29 through 31 waitlist"
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
                  : isReikiRising
                    ? "Choose the enrollment option that feels best for you."
                    : "Your secure payment flow is connected and ready."
                : isMembership
                  ? "This page is being prepared for live recurring checkout. In the meantime, you can review the membership details and return to the membership page for the full offer overview."
                  : isSoundTraining
                    ? "The next training takes place January 29 through 31, 2027. No payment is being accepted yet. Join the waitlist to receive the schedule and enrollment details first."
                    : isGiftCertificate
                      ? "This gift certificate checkout is being finalized. In the meantime, you can return to the gift certificate page for more details."
                  : "This checkout page is being prepared for live payment. In the meantime, you can return to the main offer page for full details."}
            </p>
          </div>

          {hasOptions ? (
            <div className="mt-6 grid gap-4">
              {isReikiRising ? (
                <form action="/api/checkout" method="post" className="grid gap-5">
                  <input type="hidden" name="slug" value={offer.slug} />

                  <fieldset className="grid gap-4">
                    <legend className="sr-only">Choose your tuition option</legend>
                    {availableOptions.map((option) => (
                      <label
                        key={option.key}
                        className="flex cursor-pointer gap-4 rounded-[22px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,248,242,0.86)] p-5 transition hover:border-[rgba(76,58,48,0.28)] has-[:checked]:border-[rgba(111,91,76,0.55)] has-[:checked]:shadow-[0_14px_35px_rgba(59,41,31,0.08)]"
                      >
                        <input
                          type="radio"
                          name="optionKey"
                          value={option.key}
                          required
                          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-text)]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-3">
                            <strong className="text-[1.02rem]">
                              {option.label}
                            </strong>
                            <span className="rounded-full bg-[rgba(168,178,159,0.18)] px-3 py-1 text-[0.78rem] font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
                              {option.priceLabel}
                            </span>
                          </span>
                          <span className="mt-3 block text-[var(--color-muted)]">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </fieldset>

                  <div className="rounded-[22px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,251,246,0.92)] p-5">
                    <strong className="block text-[1.02rem]">
                      Enrollment agreement
                    </strong>
                    <p className="mt-2 text-[0.94rem] leading-relaxed text-[var(--color-muted)]">
                      Please review the agreement and enter your full name before
                      continuing to secure payment.
                    </p>

                    <label className="mt-5 block text-[0.9rem] font-semibold text-[var(--color-text)]">
                      Full name for your enrollment agreement
                      <input
                        type="text"
                        name="agreementFullName"
                        autoComplete="name"
                        minLength={2}
                        maxLength={160}
                        required
                        className="mt-2 w-full rounded-[14px] border border-[rgba(76,58,48,0.16)] bg-white px-4 py-3 text-[1rem] font-normal outline-none transition focus:border-[rgba(76,58,48,0.48)] focus:ring-2 focus:ring-[rgba(168,178,159,0.24)]"
                      />
                    </label>

                    <label className="mt-5 flex cursor-pointer items-start gap-3 text-[0.9rem] leading-relaxed text-[var(--color-muted)]">
                      <input
                        type="checkbox"
                        name="agreementAccepted"
                        value="yes"
                        required
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-text)]"
                      />
                      <span>
                        I have read and agree to the{" "}
                        <Link
                          href={REIKI_RISING_AGREEMENT_PATH}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[var(--color-text)] underline underline-offset-2"
                        >
                          Reiki Rising Enrollment Agreement
                        </Link>
                        ,{" "}
                        <Link
                          href={site.links.refundPolicy}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[var(--color-text)] underline underline-offset-2"
                        >
                          Refund Policy
                        </Link>{" "}
                        and{" "}
                        <Link
                          href={site.links.terms}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[var(--color-text)] underline underline-offset-2"
                        >
                          Terms
                        </Link>
                        . I understand the total tuition and authorize the
                        payment option I selected. If I select a payment plan, I
                        understand that it is a fixed installment commitment to
                        the full tuition. It ends after the final payment and
                        does not renew.
                      </span>
                    </label>

                    <label className="mt-4 flex cursor-pointer items-start gap-3 text-[0.88rem] leading-relaxed text-[var(--color-muted)]">
                      <input
                        type="checkbox"
                        name="mediaReleaseAccepted"
                        value="yes"
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-text)]"
                      />
                      <span>
                        Optional: I give The Lightness of Being permission to
                        use photographs, video clips or testimonials featuring
                        me for educational or promotional purposes. Declining
                        this permission does not affect my participation.
                      </span>
                    </label>

                    {query.agreement === "required" ? (
                      <p
                        role="alert"
                        className="mt-4 rounded-[14px] bg-[rgba(167,85,70,0.1)] px-4 py-3 text-[0.9rem] font-medium text-[rgb(126,61,51)]"
                      >
                        Please choose a tuition option, enter your full name and
                        accept the enrollment terms before continuing.
                      </p>
                    ) : null}
                  </div>

                  {readiness.checkoutReady ? (
                    <button type="submit" className="button-pill justify-center">
                      Continue to Secure Payment
                    </button>
                  ) : (
                    <Link
                      href={readiness.currentFallbackHref}
                      className="button-pill justify-center"
                    >
                      Review Offer Details
                    </Link>
                  )}
                </form>
              ) : (
                availableOptions.map((option) => (
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
                      {readiness.checkoutReady &&
                      (option.stripePriceId || option.amountCents) ? (
                        <form action="/api/checkout" method="post">
                          <input type="hidden" name="slug" value={offer.slug} />
                          <input
                            type="hidden"
                            name="optionKey"
                            value={option.key}
                          />
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
                ))
              )}

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
