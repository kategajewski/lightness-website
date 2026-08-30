import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Wellness Events, Sound Journeys & Yoga in Patchogue",
  description: "Find upcoming sound journeys, Reiki gatherings, yoga and meditation classes, seasonal rituals, readings, private ceremonies, and community wellness events.",
  path: "/events",
  image: "/homepage-images/events-floating-flower.jpeg",
});

const upcomingEvents = [
  {
    sortKey: "2026-09-16",
    isActive: true,
    eyebrow: "Live Online Reiki Experience",
    title: "Called to Reiki",
    description:
      "A Holy Fire® Reiki masterclass and healing experience with Kate.",
    details:
      "Wednesday, September 16, 2026 · 7:00-8:15 PM ET · Live online · $11",
    href: site.links.reikiMasterclass,
    cta: "Reserve Your Place",
    cardClass:
      "border-[rgba(201,167,156,0.62)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(230,194,162,0.32)_48%,rgba(168,178,159,0.2))]",
  },
  {
    sortKey: "2026-09-21",
    isActive: true,
    eyebrow: "Reiki-Infused Sound Journey",
    title: "Autumn Alchemy",
    description:
      "A deeply restorative evening of sound and Holy Fire® Reiki with Kate at Sanctuary+Health.",
    details:
      "Monday, September 21, 2026 · 8:00-9:30 PM · Sanctuary+Health, Patchogue · $55 before processing fees",
    href: site.links.soundJourneysAtSanctuary,
    cta: "Explore the Sound Journey",
    cardClass:
      "border-[rgba(137,100,79,0.5)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(222,188,157,0.38)_48%,rgba(119,77,61,0.2))]",
  },
  {
    sortKey: "2026-07-01",
    isActive: false,
    eyebrow: "Practitioner Gathering",
    title: "Reiki Share",
    description:
      "A small practitioner-only gathering to form community, talk all things Reiki, and share with one another.",
    details:
      "Wednesday, July 1, 2026 · 7-9 PM · The Lightness of Being, Patchogue · $25 · Max 7 people",
    href: site.links.reikiShareJuly,
    cta: "Reserve Your Spot",
    cardClass:
      "border-[rgba(168,178,159,0.64)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(168,178,159,0.38))]",
  },
  {
    sortKey: "2026-07-11",
    isActive: false,
    eyebrow: "Cancelled Event",
    title: "The Weekend Reset",
    description:
      "A morning of gentle yoga and sound healing to help you reconnect with yourself before the week ahead.",
    details:
      "Cancelled · Saturday, July 11, 2026 · 8:00-9:15 AM · The Lightness Grounds in Bayport",
    href: site.links.theWeekendReset,
    cta: "Reserve Your Place",
    cardClass:
      "border-[rgba(230,194,162,0.58)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(230,194,162,0.34)_46%,rgba(168,178,159,0.26))]",
  },
  {
    sortKey: "2026-07-28",
    isActive: false,
    eyebrow: "Outdoor Sound Bath",
    title: "Golden Hour: An Outdoor Sound Journey",
    description:
      "A welcoming sunset ceremony to soften into the evening with sound, stillness and open-sky rest.",
    details:
      "Tuesday, July 28, 2026 · 7:30 PM · Rain date Wednesday, July 29 · $30 advance / $35 day of",
    href: site.links.goldenHourJuly,
    cta: "Reserve Your Place",
    cardClass:
      "border-[rgba(230,194,162,0.64)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(230,194,162,0.42)_54%,rgba(201,167,156,0.26))]",
  },
  {
    sortKey: "2026-10-15",
    isActive: true,
    eyebrow: "Practitioner Gathering",
    title: "Reiki Share",
    description:
      "A small practitioner-only gathering to form community, talk all things Reiki, and share with one another.",
    details:
      "Thursday, October 15, 2026 · 7-9 PM · The Lightness of Being, Patchogue · $25 · Max 7 people",
    href: site.links.reikiShareOctober,
    cta: "Reserve Your Spot",
    cardClass:
      "border-[rgba(168,178,159,0.68)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(168,178,159,0.28)_40%,rgba(201,167,156,0.22))]",
  },
  {
    sortKey: "2026-11-05",
    isActive: true,
    eyebrow: "Practitioner Gathering",
    title: "Reiki Share",
    description:
      "A small practitioner-only gathering to form community, talk all things Reiki, and share with one another.",
    details:
      "Thursday, November 5, 2026 · 7-9 PM · The Lightness of Being, Patchogue · $25 · Max 7 people",
    href: site.links.reikiShare,
    cta: "Reserve Your Spot",
    cardClass:
      "border-[rgba(168,178,159,0.68)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(168,178,159,0.28)_40%,rgba(201,167,156,0.22))]",
  },
  {
    sortKey: "2026-09-17",
    isActive: true,
    eyebrow: "Featured Event",
    title: "Gallery Reading with Don Schaefer",
    description:
      "An intimate group mediumship reading held at The Lightness of Being in Patchogue.",
    details:
      "Thursday, September 17, 2026 · 7-8:30 PM · Limited to 8 people · $50",
    href: "/gallery-reading-with-don-schaefer",
    cta: "View Event Details",
    cardClass:
      "border-[rgba(201,167,156,0.6)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(201,167,156,0.34))]",
  },
  {
    sortKey: "2026-08-25",
    isActive: false,
    eyebrow: "Past Event",
    title: "Golden Hour: An Outdoor Sound Journey",
    description:
      "A welcoming sunset ceremony to soften into the evening with sound, stillness and open-sky rest.",
    details:
      "Tuesday, August 25, 2026 · 7:00 PM · Rain date Thursday, August 27 · $35",
    href: "/golden-hour-august-25",
    cta: "Reserve Your Place",
    cardClass:
      "border-[rgba(230,194,162,0.64)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(230,194,162,0.42)_54%,rgba(201,167,156,0.26))]",
  },
  {
    sortKey: "2026-06-21",
    isActive: false,
    eyebrow: "Past Event",
    title: "Rise into Light",
    description:
      "A 75-minute summer solstice yoga and sound journey to welcome the sun and begin the season with intention.",
    details:
      "Sunday, June 21, 2026 · 8:00 AM · The Lightness Grounds in Bayport · $30",
    href: site.links.riseIntoLight,
    cta: "Reserve Your Place",
    cardClass:
      "border-[rgba(230,194,162,0.52)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(230,194,162,0.32))]",
  },
] as const;

const visibleUpcomingEvents = upcomingEvents
  .filter((event) => event.isActive)
  .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

const connectionPaths = [
  {
    title: "Community Events",
    description: "Seasonal gatherings, sound journeys, readings, and circles.",
    href: "#community-events",
  },
  {
    title: "Weekly Classes",
    description: "Ongoing yoga, meditation, movement, and sound offerings.",
    href: "#weekly-classes",
  },
  {
    title: "Private & Corporate",
    description: "Custom ceremonies, private events, and workplace wellness.",
    href: "#private-events",
  },
] as const;

const yogaSchedule = [
  {
    day: "Monday",
    classes: [
      "5:45-6:15 PM Evening Meditation",
      "6:30-7:30 PM Restorative Zen Yoga",
    ],
    location: "Sanctuary+Health, Patchogue, NY",
  },
  {
    day: "Tuesday",
    classes: [
      "9:45-10:45 AM Dirty Yoga",
      "11:00 AM-12:00 PM Pole-ates",
    ],
    location: "The Cheeky Peach, Patchogue, NY",
  },
  {
    day: "Thursday",
    classes: [
      "8:15-9:15 AM Sanctuary Flow",
      "9:30-10:30 AM Yin + Release",
    ],
    location: "Sanctuary+Health, Patchogue, NY",
  },
  {
    day: "Friday",
    classes: ["9:30-10:30 AM Stretch + Sound"],
    location: "Sanctuary+Health, Patchogue, NY",
  },
] as const;

const privateEventPaths = [
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
      title="Join a community event or organize your own special experience."
      description="Explore upcoming gatherings, weekly yoga classes, seasonal rituals, sound journeys, readings, and private event options."
    >
      <section className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,252,248,0.9),rgba(230,194,162,0.2),rgba(168,178,159,0.16))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Start Here
        </span>
        <h2 className="display-section-title">
          How would you like to connect?
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {connectionPaths.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-[20px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.7)] p-5 shadow-[0_14px_44px_rgba(59,41,31,0.06)] transition hover:-translate-y-0.5 hover:bg-[rgba(255,252,248,0.9)]"
            >
              <strong className="block text-[1.02rem] text-[var(--color-text)]">
                {item.title}
              </strong>
              <span className="mt-2 block text-[0.92rem] leading-6 text-[var(--color-muted)]">
                {item.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div
        id="community-events"
        className="scroll-mt-28 rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10"
      >
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Community Offerings
          </span>
          <h2 className="display-section-title">
            Explore upcoming gatherings and seasonal experiences.
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">
            Browse the latest readings, sound journeys and community events
            currently open for registration.
          </p>
          <p className="mt-3 text-[0.92rem] font-semibold text-[var(--color-text)]">
            Events sold directly by The Lightness of Being are final and
            non-refundable. Events hosted and ticketed by another venue follow
            that venue&apos;s ticket policies.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact?inquiryType=events&subject=Upcoming%20Event%20Inquiry&draft=Hi%20Kate%2C%20I%27m%20interested%20in%20one%20of%20your%20upcoming%20events.%20I%27d%20love%20more%20details%20about%3A"
              className="button-pill"
            >
              Ask About Community Events
            </Link>
          </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-2">
        {visibleUpcomingEvents.map((item) => (
          <article
            key={item.title}
            className={`rounded-[26px] border p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] ${item.cardClass}`}
          >
            <span className="mb-3 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {item.eyebrow}
            </span>
            <h3 className="display-card-title">
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
      </section>

      <section
        id="weekly-classes"
        className="scroll-mt-28 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.72)] p-6 shadow-[0_18px_56px_rgba(59,41,31,0.06)] sm:p-8"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Weekly Classes
            </span>
            <h2 className="display-section-title">
              Yoga schedule with Kate.
            </h2>
          </div>
          <p className="max-w-[32rem] text-[0.95rem] text-[var(--color-muted)]">
            Ongoing movement, meditation, and sound-based classes offered
            weekly in Patchogue.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {yogaSchedule.map((item) => (
            <article
              key={item.day}
              className="rounded-[20px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.68)] p-5"
            >
              <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                {item.day}
              </h3>
              <ul className="mt-4 grid gap-2 text-[0.95rem] text-[var(--color-muted)]">
                {item.classes.map((classItem) => (
                  <li key={classItem}>{classItem}</li>
                ))}
              </ul>
              <p className="mt-4 text-[0.86rem] text-[var(--color-text)]">
                {item.location}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="private-events"
        className="scroll-mt-28 rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10"
      >
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Private Events & Ceremonies
        </span>
        <h2 className="display-section-title">
          Personalized support for private gatherings, rituals, and special moments.
        </h2>
        <p className="mt-4 text-[var(--color-muted)]">
          If you are looking for something more personal, Kate also offers custom
          ceremonies, private events, and workplace wellness experiences tailored
          to the people and intention involved.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {privateEventPaths.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <h3 className="display-card-title">
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
      </section>

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
