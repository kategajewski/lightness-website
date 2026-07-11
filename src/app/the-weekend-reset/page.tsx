import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const details = [
  {
    label: "Status",
    value: "Cancelled",
    description:
      "Registration has been closed for this gathering.",
  },
  {
    label: "Experience",
    value: "75 minutes",
    description:
      "Gentle yoga, breath, and a restorative outdoor sound bath.",
  },
  {
    label: "Exchange",
    value: "Closed",
    description:
      "No additional tickets are being accepted.",
  },
] as const;

const bringItems = [
  "Yoga mat",
  "Blanket or towel",
  "Water",
  "Layers and anything cozy for outdoor rest",
] as const;

const goodToKnow = [
  "This July 11 gathering has been cancelled",
  "Registration is closed and no additional tickets are being accepted",
  "75-minute gentle yoga and sound bath experience",
  "The Lightness Grounds, corner of Gillette Avenue and Academy Street in Bayport",
  "All levels are welcome",
  "Please contact Kate directly with any questions about an existing ticket",
] as const;

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "The Weekend Reset",
  description:
    "A 75-minute outdoor gentle yoga and sound bath experience designed to help you slow down, reconnect, and create space before a new week begins.",
  startDate: "2026-07-11T08:00:00-04:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventCancelled",
  image: "https://bethelightness.com/homepage-images/weekend-reset-kate-sound.jpeg",
  location: {
    "@type": "Place",
    name: "The Lightness Grounds",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Gillette Avenue and Academy Street",
      addressLocality: "Bayport",
      addressRegion: "NY",
      addressCountry: "US",
    },
  },
  organizer: {
    "@type": "Organization",
    name: site.name,
    url: "https://bethelightness.com",
  },
  offers: {
    "@type": "Offer",
    price: "30",
    priceCurrency: "USD",
    availability: "https://schema.org/SoldOut",
    url: "https://bethelightness.com/the-weekend-reset",
  },
};

export default function TheWeekendResetPage() {
  return (
    <PageShell
      eyebrow="Cancelled Event"
      title="The Weekend Reset"
      description="This July gathering has been cancelled."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <section className="overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,250,239,0.96),rgba(242,228,205,0.9)_48%,rgba(217,226,198,0.58))] shadow-[0_28px_90px_rgba(59,41,31,0.12)]">
        <div className="grid gap-0 lg:grid-cols-[0.98fr_1.02fr] lg:items-stretch">
          <div className="flex flex-col gap-6 p-7 sm:p-8 lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  Saturday, July 11
                </span>
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  8:00-9:15 AM
                </span>
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  75 Minutes
                </span>
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  Bayport, NY
                </span>
              </div>

              <h2 className="mt-5 max-w-[12ch] font-display text-[3.2rem] leading-[0.96] tracking-[0] text-[var(--color-text)] sm:text-[4.3rem] lg:text-[5.2rem]">
                The Weekend Reset.
              </h2>
              <p className="mt-5 max-w-[36rem] text-[1.04rem] leading-8 text-[var(--color-muted)]">
                The Weekend Reset has been cancelled, and registration is now
                closed.
              </p>
              <p className="mt-4 max-w-[36rem] text-[1.04rem] leading-8 text-[var(--color-muted)]">
                Thank you for understanding. If you already purchased a ticket,
                please watch your email for any direct follow-up from Kate.
              </p>
              <p className="mt-4 max-w-[36rem] text-[1.04rem] leading-8 text-[var(--color-muted)]">
                You can still explore the current events calendar for upcoming
                sound journeys, Reiki gatherings, and outdoor practices.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={site.links.events}
                className="button-pill"
              >
                Back to Events
              </Link>
            </div>
          </div>

          <div className="relative min-h-[24rem] overflow-hidden bg-[#e7dccd] sm:min-h-[30rem] lg:h-[34rem] lg:min-h-0">
            <img
              src="/homepage-images/weekend-reset-kate-sound.jpeg"
              alt="Kate leading an outdoor sound bath with crystal singing bowls"
              className="h-full min-h-[24rem] w-full object-cover object-[center_58%] sm:min-h-[30rem] lg:min-h-0"
            />
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(47,37,32,0.58),transparent)] p-6 text-[#fffaf5] sm:p-8">
              <p className="max-w-[30rem] text-[1.05rem] font-semibold leading-7">
                This gathering has been cancelled.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {details.map((item) => (
          <article
            key={item.label}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.86)] p-6 shadow-[0_18px_60px_rgba(59,41,31,0.08)]"
          >
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {item.label}
            </span>
            <h3 className="mt-3 font-display text-[2.25rem] leading-none tracking-[0] text-[var(--color-text)]">
              {item.value}
            </h3>
            <p className="mt-4 text-[var(--color-muted)]">
              {item.description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/weekend-reset-group.jpeg"
            alt="Outdoor morning yoga and sound healing group gathered on the grass"
            className="h-full min-h-[24rem] w-full object-cover object-center"
          />
        </div>

        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-9">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            What To Bring
          </span>
          <h2 className="display-section-title">
            A simple outdoor practice for another time.
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {bringItems.map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.7)] p-4 font-semibold text-[var(--color-text)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-9 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Weather & Refunds
          </span>
          <h2 className="display-section-title">
            Outdoor event policy.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            The Weekend Reset has been cancelled and registration is closed. If
            you already purchased a ticket, please watch your email for direct
            follow-up from Kate.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Good To Know
          </strong>
          <ul className="mt-4 grid gap-3 text-[var(--color-muted)]">
            {goodToKnow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
