import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { env } from "@/lib/env";
import { getAvailablePurchaseOptions, getOfferBySlug } from "@/lib/offers";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Healing & Wellness Gift Certificates",
  description:
    "Give someone you love a Reiki session, a sound healing experience or a gift toward training and mentorship with Kate Gajewski.",
  path: "/gift-certificate",
  image: "/homepage-images/gift-certificate-lantern.jpeg",
});

const sessionPrices = [
  { name: "Rest & Receive (60-minute Reiki)", price: "$140" },
  { name: "Return to Self: Sacred Reset", price: "$250" },
  { name: "Gentle Energy Support for Children", price: "$50" },
  { name: "The Inner Journey (hypnotherapy)", price: "From $150" },
  { name: "Private Sound Immersion", price: "From $150" },
  { name: "Personalized Guidance", price: "$150" },
];

const programPrices = [
  {
    name: "Sound Practitioner Training",
    price: "$1,344 in full",
    href: site.links.soundTraining,
  },
  {
    name: "The Healer’s Emergence",
    price: "From $1,200",
    href: site.links.reikiMentorship,
  },
  {
    name: "The Embodied Healer",
    price: "From $1,700",
    href: site.links.mentorship,
  },
];

const priceRowClass = "flex items-baseline justify-between gap-4 py-2.5";
const priceClass = "shrink-0 text-right font-bold tabular-nums";

export default function GiftCertificatePage() {
  const offer = getOfferBySlug("gift-certificate");
  if (!offer) notFound();

  const giftAmounts = getAvailablePurchaseOptions(offer);

  return (
    <PageShell
      eyebrow="Gift Certificate"
      title="Give the gift of healing."
      description="Give someone you love a session, cover the cost of the program they’ve been saving for or help them take the next step toward it."
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section
          id="gift-amounts"
          className="rounded-[30px] border border-[var(--color-button-line)] bg-[var(--color-ivory)] p-6 sm:p-8"
        >
          <h2 className="display-section-title">Choose a gift amount.</h2>
          <p className="mt-4 text-[var(--color-brown)]">
            A <strong>$140 gift</strong>{" "}covers a 60-minute Rest &amp; Receive
            session. You’ll receive a printable certificate by email to share
            with your loved one.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {giftAmounts.map((amount) => (
              <form key={amount.key} action="/api/checkout" method="post">
                <input type="hidden" name="slug" value={offer.slug} />
                <input type="hidden" name="optionKey" value={amount.key} />
                <button
                  type="submit"
                  className="button-pill w-full"
                  aria-label={`Buy a ${amount.priceLabel} gift certificate`}
                >
                  {amount.priceLabel}
                </button>
              </form>
            ))}
          </div>
          <p className="mt-5 text-[0.94rem] text-[var(--color-brown)]">
            {env.giftCertificateRestReceiveCoupon
              ? "To book Rest & Receive, apply the booking coupon from your certificate and add your certificate code to the booking notes. For other offerings, "
              : "Have a gift certificate? "}
            <Link href={site.links.contact} className="font-semibold underline underline-offset-4">
              contact Kate
            </Link>{" "}
            with your certificate code.
          </p>
        </section>

        <Image
          src="/homepage-images/gift-certificate-lantern.jpeg"
          alt="A candle glowing inside a lantern."
          width={1200}
          height={1500}
          sizes="(min-width: 1024px) 420px, 90vw"
          className="mx-auto hidden h-auto max-h-[20rem] w-full max-w-[25rem] rounded-[30px] object-cover sm:block lg:max-h-[26rem]"
        />
      </div>

      <section className="space-y-5" aria-labelledby="gift-price-guide">
        <h2 id="gift-price-guide" className="display-section-title">
          What your gift can cover
        </h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[26px] border border-[var(--color-button-line)] bg-[var(--color-ivory)] p-6 sm:p-8">
            <h3 className="display-card-title">Private Sessions</h3>
            <dl className="mt-4 divide-y divide-[var(--color-button-line)] text-[var(--color-brown)]">
              {sessionPrices.map(({ name, price }) => (
                <div key={name} className={priceRowClass}>
                  <dt>{name}</dt>
                  <dd className={priceClass}>{price}</dd>
                </div>
              ))}
            </dl>
            <Link href={site.links.services} className="mt-4 inline-block font-semibold underline underline-offset-4">
              Explore healing sessions
            </Link>
          </div>
          <div className="rounded-[26px] border border-[var(--color-button-line)] bg-[var(--color-ivory)] p-6 sm:p-8">
            <h3 className="display-card-title">Training &amp; Mentorship</h3>
            <dl className="mt-4 divide-y divide-[var(--color-button-line)] text-[var(--color-brown)]">
              {programPrices.map(({ name, price, href }) => (
                <div key={name} className={priceRowClass}>
                  <dt>
                    <Link href={href} className="underline underline-offset-4">
                      {name}
                    </Link>
                  </dt>
                  <dd className={priceClass}>{price}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[var(--color-brown)]">
              <Link href={site.links.contact} className="font-semibold underline underline-offset-4">
                Contact Kate
              </Link>{" "}
              to gift a full program or apply a certificate toward tuition.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
