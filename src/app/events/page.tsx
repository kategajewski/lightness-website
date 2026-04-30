import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const upcomingEvents = [
  {
    eyebrow: "Featured Event",
    title: "Gallery Reading with Don Schaefer",
    description:
      "An intimate group mediumship reading held at The Lightness of Being in Patchogue.",
    details:
      "Tuesday, April 28, 2026 · 7-8:30 PM · Limited to 8 people",
    href: "https://venmo.com/u/donald-schaefer-12",
    cta: "Register Through Venmo",
  },
  {
    eyebrow: "Seasonal Gathering",
    title: "Full Moon Release: Reiki Infused Sound Journey",
    description:
      "A Reiki-infused sound journey designed to help you soften, restore, and reconnect under the energy of the full moon.",
    details:
      "Saturday, May 2, 2026 · Sanctuary+Health, Patchogue",
    href: "/full-moon-release",
    cta: "See Event Details",
  },
  {
    eyebrow: "Recurring Series",
    title: "Soothing Sunday at Island Kava",
    description:
      "A monthly Island Kava gathering with stretch, sound bath, and kava to help you reset for the week ahead.",
    details:
      "Upcoming dates: May 17, 2026 and June 14, 2026 · $45 per gathering · Outside weather permitting, otherwise indoors at Island Kava in Lindenhurst",
    href: "/soothing-sunday",
    cta: "Purchase Ticket",
  },
  {
    eyebrow: "New Outdoor Event",
    title: "Sacred Sounds Under the Sky",
    description:
      "An outdoor sound bath experience at The Lightness Grounds in Bayport designed for rest, reset, and open-air healing.",
    details:
      "Saturday, May 23, 2026 · 11:00 AM-12:00 PM · $30 in advance · Rain date Sunday, May 24",
    href: site.links.sacredSoundsUnderTheSky,
    cta: "Purchase Ticket",
  },
] as const;

const eventPaths = [
  {
    title: "Private Events & Ceremonies",
    description:
      "Custom ceremonies, blessings, and private gatherings created with intention and care.",
    href: site.links.specialBlessing,
    cta: "Explore Private Events",
  },
  {
    title: "Corporate Wellness",
    description:
      "Bring mindful restoration, healing practices, and supportive experiences into your workplace.",
    href: site.links.corporateWellness,
    cta: "Inquire Now",
  },
] as const;

export default function EventsPage() {
  return (
    <PageShell
      eyebrow="Events"
      title="Gatherings, readings, and restorative community experiences."
      description="From intimate mediumship events to monthly Island Kava gatherings and private ceremonies, The Lightness of Being offers ways to connect beyond one-on-one sessions."
    >
      <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Upcoming Events
          </span>
          <h2 className="font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-[0.96] tracking-[-0.02em]">
            A mix of intimate experiences and recurring community offerings.
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">
            Some events are one-night gatherings, while others return monthly
            as part of the rhythm of The Lightness of Being. This page is meant
            to help you quickly see what is coming up next and where to learn more.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact?inquiryType=events&subject=Upcoming%20Event%20Inquiry&draft=Hi%20Kate%2C%20I%27m%20interested%20in%20one%20of%20your%20upcoming%20events.%20I%27d%20love%20more%20details%20about%3A"
              className="button-pill"
            >
              Ask About Events
            </Link>
            <Link
              href={site.links.specialBlessing}
              className="button-pill"
            >
              Private Events
            </Link>
          </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {upcomingEvents.map((item) => (
          <article
            key={item.title}
            className="rounded-[26px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(180deg,rgba(249,244,237,0.9),rgba(243,234,224,0.95))] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <span className="mb-3 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {item.eyebrow}
            </span>
            <h3 className="font-display text-[1.9rem] leading-none tracking-[-0.02em]">
              {item.title}
            </h3>
            <p className="mt-3 text-[var(--color-muted)]">
              {item.description}
            </p>
            <p className="mb-4 mt-4 text-[0.95rem] text-[var(--color-text)]">
              {item.details}
            </p>
            <Link href={item.href} className="font-bold text-[#5d5148]">
              {item.cta}
            </Link>
          </article>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {eventPaths.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <h3 className="font-display text-[1.9rem] leading-none tracking-[-0.02em]">
              {item.title}
            </h3>
            <p className="mb-4 mt-3 text-[var(--color-muted)]">
              {item.description}
            </p>
            <Link href={item.href} className="font-bold text-[#5d5148]">
              {item.cta}
            </Link>
          </article>
        ))}
      </div>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center justify-center overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,255,255,0.45)] p-4 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <img
              src="/homepage-images/events-island-kava-sound.jpeg"
              alt="Island Kava sound bath event setup"
              className="block h-[18rem] w-full object-contain object-center"
            />
          </div>
          <div className="flex items-center justify-center overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,255,255,0.45)] p-4 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <img
              src="/homepage-images/events-floating-flower.jpeg"
              alt="Floating sound bath event"
              className="block h-[18rem] w-full object-contain object-center"
            />
          </div>
          <div className="flex items-center justify-center overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,255,255,0.45)] p-4 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <img
              src="/homepage-images/events-inhouse-prep.jpeg"
              alt="In-house event setup"
              className="block h-[18rem] w-full object-contain object-center"
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
