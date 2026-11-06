import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Private Group Sound, Yoga & Wellness Offerings",
  description:
    "Private sound journeys, yoga and restorative wellness experiences for celebrations, community gatherings and workplace wellness in Long Island.",
  path: "/special-blessing/private-group-offerings",
  image: "/homepage-images/private-events-ceremony.jpeg",
});

const pricingTiers = [
  ["Up to 10 guests", "$300"],
  ["11-15 guests", "$375"],
  ["16-20 guests", "$450"],
  ["21+ guests", "Custom pricing"],
] as const;

const soundJourneys = [
  {
    eyebrow: "30 Minutes",
    title: "The Reset",
    subtitle: "Mini Sound Journey",
    description:
      "A sweet, simple option for smaller gatherings or moments when you would like to offer your group a peaceful pause without a longer ceremony. Singing bowls and chimes are intuitively woven together to create a calming sound experience.",
    pricing: pricingTiers,
    includes: ["15-minute setup", "30-minute sound journey", "15-minute breakdown"],
  },
  {
    eyebrow: "60 Minutes",
    title: "The Journey",
    subtitle: "Sound Journey",
    description:
      "A grounding, spacious experience for groups who want more time to settle, soften and receive. Singing bowls, chimes and other instruments create an immersive soundscape that supports relaxation and connection.",
    pricing: [
      ["Up to 10 guests", "$400"],
      ["11-15 guests", "$475"],
      ["16-20 guests", "$550"],
      ["21+ guests", "Custom pricing"],
    ],
    includes: ["15-minute setup", "60-minute sound journey", "15-minute breakdown"],
    addOn: "Add the Gong Experience for $75. This adds gong, ocean drum, chimes and additional instruments for a fuller, more immersive experience. Additional setup and breakdown time may be required.",
  },
  {
    eyebrow: "90 Minutes",
    title: "The Immersion",
    subtitle: "Premium Sound Journey",
    description:
      "A deeper sound experience with extended time for rest, receiving and integration. The soundscape may include singing bowls, gong, ocean drum and chimes, intuitively chosen for the energy of the group.",
    pricing: [
      ["Up to 10 guests", "$600"],
      ["11-15 guests", "$700"],
      ["16-20 guests", "$800"],
      ["21+ guests", "Custom pricing"],
    ],
    includes: ["20-minute setup", "90-minute sound journey", "20-minute breakdown"],
  },
] as const;

const movementOfferings = [
  {
    eyebrow: "60 Minutes",
    title: "The Exhale",
    subtitle: "Yoga + Sound Journey",
    description:
      "A beautiful blend of movement, breath and sound. Begin with breathwork and 30 minutes of intentional movement, then settle into a 30-minute restorative sound journey. Choose gentle yoga, yin, hatha or vinyasa.",
    pricing: [
      ["Up to 10 guests", "$450"],
      ["11-15 guests", "$525"],
      ["16-20 guests", "$600"],
      ["21+ guests", "Custom pricing"],
    ],
    includes: ["20-minute setup", "30-minute yoga experience", "30-minute sound journey", "20-minute breakdown"],
  },
  {
    eyebrow: "90 Minutes",
    title: "The Extended Exhale",
    subtitle: "Yoga + Sound Journey",
    description:
      "More time to move, breathe and settle into stillness. Begin with breathwork and a full 60-minute yoga experience, followed by a restorative 30-minute sound journey. Choose gentle yoga, yin, hatha or vinyasa.",
    pricing: [
      ["Up to 10 guests", "$550"],
      ["11-15 guests", "$650"],
      ["16-20 guests", "$750"],
      ["21+ guests", "Custom pricing"],
    ],
    includes: ["20-minute setup", "60-minute yoga experience", "30-minute sound journey", "20-minute breakdown"],
  },
] as const;

const groupYoga = {
  pricing: [
    ["Up to 10 guests", "$250"],
    ["11-15 guests", "$300"],
    ["16-20 guests", "$350"],
    ["21+ guests", "Custom pricing"],
  ],
  includes: ["10-minute setup", "60-minute private yoga class"],
} as const;

const inquiryHref =
  "/contact?inquiryType=events&subject=Private%20Group%20Offering%20Inquiry&draft=Hi%20Kate%2C%20I%27m%20interested%20in%20a%20private%20group%20offering.%20My%20date%2C%20location%2C%20guest%20count%20and%20what%20I%27m%20envisioning%20are%3A";

type OfferingCardProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  pricing: readonly (readonly [string, string])[];
  includes: readonly string[];
  addOn?: string;
};

function OfferingCard({ eyebrow, title, subtitle, description, pricing, includes, addOn }: OfferingCardProps) {
  return (
    <article className="flex h-full flex-col rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.84)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
      <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">{eyebrow}</span>
      <h3 className="mt-3 display-card-title">{title}</h3>
      <p className="mt-1 font-semibold text-[#766156]">{subtitle}</p>
      <p className="mt-5 text-[0.95rem] leading-7 text-[var(--color-muted)]">{description}</p>
      <dl className="mt-6 grid gap-2 rounded-[18px] bg-[rgba(255,248,242,0.86)] p-4 text-[0.9rem]">
        {pricing.map(([group, price]) => (
          <div key={group} className="flex items-baseline justify-between gap-3">
            <dt className="text-[var(--color-muted)]">{group}</dt>
            <dd className="shrink-0 font-semibold text-[var(--color-text)]">{price}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6">
        <strong className="text-[0.92rem] text-[var(--color-text)]">Includes</strong>
        <ul className="mt-3 grid gap-2 text-[0.9rem] text-[var(--color-muted)]">
          {includes.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b3887e]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      {addOn ? <p className="mt-5 rounded-[16px] bg-[rgba(230,194,162,0.2)] p-4 text-[0.88rem] leading-6 text-[var(--color-muted)]">{addOn}</p> : null}
    </article>
  );
}

export default function PrivateGroupOfferingsPage() {
  return (
    <PageShell
      eyebrow="Private Group Offerings"
      title="Wellness experiences designed around your gathering."
      description="A thoughtfully curated collection of sound, yoga and restorative experiences for private gatherings, community events, celebrations, corporate wellness and intentional moments of rest."
    >
      <section className="rounded-[32px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,252,248,0.94),rgba(230,194,162,0.24),rgba(168,178,159,0.16))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <div className="mx-auto max-w-[43rem] text-center">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">With Kate Gajewski &amp; The Lightness of Being</span>
          <p className="mt-5 text-[1.06rem] leading-8 text-[var(--color-muted)]">Each experience is designed to meet your group where they are, with space to slow down, reconnect and receive.</p>
          <Link href={inquiryHref} className="button-pill mt-7">Inquire About Your Gathering</Link>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[42rem] text-center">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Sound Journeys</span>
          <h2 className="display-section-title">Choose the amount of space your group needs to rest and receive.</h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {soundJourneys.map((offering) => <OfferingCard key={offering.title} {...offering} />)}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[42rem] text-center">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Movement + Sound</span>
          <h2 className="display-section-title">Move, breathe and settle into a restorative sound experience.</h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {movementOfferings.map((offering) => <OfferingCard key={offering.title} {...offering} />)}
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.9fr_1.1fr] sm:p-10">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Private Group Yoga</span>
          <h2 className="display-section-title">A personalized yoga experience for your people.</h2>
          <p className="mt-4 leading-7 text-[var(--color-muted)]">Whether you are celebrating, creating space for connection or simply looking to move and breathe together, each class is thoughtfully created for your group. Choose gentle yoga, yin, hatha or vinyasa, from slow and grounding to energizing and playful.</p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.1rem] text-[var(--color-text)]">60-Minute Yoga Experience</strong>
          <dl className="mt-5 grid gap-2 text-[0.92rem]">
            {groupYoga.pricing.map(([group, price]) => (
              <div key={group} className="flex items-baseline justify-between gap-3"><dt className="text-[var(--color-muted)]">{group}</dt><dd className="font-semibold text-[var(--color-text)]">{price}</dd></div>
            ))}
          </dl>
          <p className="mt-6 text-[0.9rem] font-semibold text-[var(--color-text)]">Includes</p>
          <ul className="mt-3 grid gap-2 text-[0.9rem] text-[var(--color-muted)]">
            {groupYoga.includes.map((item) => <li key={item} className="flex gap-3"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b3887e]" />{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.84)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Travel</span>
          <h2 className="mt-3 display-card-title">Bring the experience to your space.</h2>
          <p className="mt-4 leading-7 text-[var(--color-muted)]">Pricing includes travel within 10 miles of The Lightness of Being in Patchogue. Additional travel fees apply beyond 10 miles. Outdoor experiences may also be hosted in Bayport, weather permitting.</p>
        </article>
        <article className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.84)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Create Your Own Experience</span>
          <h2 className="mt-3 display-card-title">Dreaming of something a little different?</h2>
          <p className="mt-4 leading-7 text-[var(--color-muted)]">From intimate gatherings and celebrations to retreats, circles, corporate wellness experiences and private ceremonies, we can create something meaningful, personal and aligned with your vision.</p>
        </article>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,252,248,0.9),rgba(230,194,162,0.22),rgba(168,178,159,0.16))] p-8 text-center shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <h2 className="mx-auto max-w-[26ch] display-section-title">Let&apos;s create something that feels like a true exhale for your group.</h2>
        <p className="mx-auto mt-4 max-w-[39rem] text-[var(--color-muted)]">Share your date, location, guest count and what you are imagining. Kate will help you find the offering that feels right.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={inquiryHref} className="button-pill">Start Your Inquiry</Link>
          <Link href={site.links.specialBlessing} className="button-pill">Explore Private Ceremonies</Link>
        </div>
      </section>
    </PageShell>
  );
}
