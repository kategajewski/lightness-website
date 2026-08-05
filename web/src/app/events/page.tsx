import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const upcomingEvents = [
  {
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
    isActive: false,
    eyebrow: "Outdoor Sound Bath",
    title: "Golden Hour: An Outdoor Sound Journey",
    description:
      "A welcoming sunset ceremony to soften into the evening with sound, stillness, and open-sky rest.",
    details:
      "Tuesday, July 28, 2026 · 7:30 PM · Rain date Wednesday, July 29 · $30 advance / $35 day of",
    href: site.links.goldenHourJuly,
    cta: "Reserve Your Place",
    cardClass:
      "border-[rgba(230,194,162,0.64)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(230,194,162,0.42)_54%,rgba(201,167,156,0.26))]",
  },
  {
    isActive: true,
    eyebrow: "Practitioner Gathering",
    title: "Reiki Share",
    description:
      "A small practitioner-only gathering to form community, talk all things Reiki, and share with one another.",
    details:
      "Thursday, August 6, 2026 · 7-9 PM · The Lightness of Being, Patchogue · $25 · Max 7 people",
    href: site.links.reikiShare,
    cta: "Reserve Your Spot",
    cardClass:
      "border-[rgba(168,178,159,0.68)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(168,178,159,0.28)_40%,rgba(201,167,156,0.22))]",
  },
  {
    isActive: true,
    eyebrow: "Featured Event",
    title: "Gallery Reading with Don Schaefer",
    description:
      "An intimate group mediumship reading held at The Lightness of Being in Patchogue.",
    details:
      "Thursday, August 13, 2026 · 7-8:30 PM · Limited to 8 people · $50",
    href: "/gallery-reading-with-don-schaefer",
    cta: "View Event Details",
    cardClass:
      "border-[rgba(201,167,156,0.6)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(201,167,156,0.34))]",
  },
  {
    isActive: true,
    eyebrow: "Outdoor Evening Practice",
    title: "Flow Field",
    description:
      "An open-air vinyasa flow and restorative sound healing experience led by Kate + Kelly.",
    details:
      "Thursday, August 20, 2026 · 6:30-8:00 PM · The Lightness Grounds in Bayport · $45",
    href: site.links.flowField,
    cta: "Reserve Your Place",
    cardClass:
      "border-[rgba(230,194,162,0.62)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(230,194,162,0.34)_42%,rgba(168,178,159,0.28))]",
  },
  {
    isActive: true,
    eyebrow: "Outdoor Sound Bath",
    title: "Golden Hour: An Outdoor Sound Journey",
    description:
      "A welcoming sunset ceremony to soften into the evening with sound, stillness, and open-sky rest.",
    details:
      "Tuesday, August 25, 2026 · 7:00 PM · Rain date Thursday, August 27 · $30 advance / $35 day of",
    href: "/golden-hour-august-25",
    cta: "Reserve Your Place",
    cardClass:
      "border-[rgba(230,194,162,0.64)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(230,194,162,0.42)_54%,rgba(201,167,156,0.26))]",
  },
  {
    isActive: false,
    eyebrow: "Past Event",
    title: "Rise into Light",
    description:
      "A 75-minute summer solstice yoga and sound journey to welcome the sun and begin the season with intention.",
    details:
      "Sunday, June 21, 2026 · 8:00 AM · The Lightness Grounds in Bayport · $30",
    href: "/rise-into-light",
    cta: "Reserve Your Place",
    cardClass:
      "border-[rgba(230,194,162,0.52)] bg-[linear-gradient(180deg,rgba(255,250,245,0.94),rgba(230,194,162,0.32))]",
  },
] as const;

const visibleUpcomingEvents = upcomingEvents.filter((event) => event.isActive);

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

      <section
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
          Browse the latest readings, sound journeys, and community events
          currently open for registration.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {visibleUpcomingEvents.map((item) => (
          <article
            key={item.title}
            className={`rounded-[26px] border p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] ${item.cardClass}`}
          >
            <span className="mb-3 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {item.eyebrow}
            </span>
            <h3 className="display-card-title">{item.title}</h3>
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
            <h2 className="display-section-title">Yoga schedule with Kate.</h2>
          </div>
          <p className="max-w-[32rem] text-[0.95rem] text-[var(--color-muted)]">
            Ongoing movement, meditation, and sound-based classes offered weekly
            in Patchogue.
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
          Personalized support for private gatherings, rituals, and special
          moments.
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
            <h3 className="display-card-title">{item.title}</h3>
            <p className="mb-4 mt-3 text-[var(--color-muted)]">
              {item.description}
            </p>
            <Link href={item.href} className="font-bold text-[#5d5148]">
              {item.cta}
            </Link>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
