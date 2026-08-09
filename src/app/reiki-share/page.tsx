import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const gatheringIntentions = [
  "Form community with other Reiki practitioners",
  "Talk all things Reiki in a supportive space",
  "Share Reiki practice with one another",
  "Receive, reflect, and stay connected to the work",
] as const;

const goodToKnow = [
  "Thursday, November 5, 2026",
  "7:00-9:00 PM",
  "The Lightness of Being, 98 Medford Ave, Patchogue, NY 11772",
  "$25 per person",
  "Practitioners only",
  "All purchases are final and non-refundable",
] as const;

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Reiki Share",
  description:
    "A practitioner-only Reiki gathering to form community, talk all things Reiki, and share practice with one another at The Lightness of Being in Patchogue.",
  startDate: "2026-11-05T19:00:00-05:00",
  endDate: "2026-11-05T21:00:00-05:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: "The Lightness of Being",
    address: {
      "@type": "PostalAddress",
      streetAddress: "98 Medford Ave",
      addressLocality: "Patchogue",
      addressRegion: "NY",
      postalCode: "11772",
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
    price: "25",
    priceCurrency: "USD",
    availability: "https://schema.org/LimitedAvailability",
    url: "https://bethelightness.com/reiki-share",
  },
};

export default function ReikiSharePage() {
  return (
    <PageShell
      eyebrow="Practitioner Gathering"
      title="Reiki Share"
      description="A small Reiki practitioner gathering to form community, talk all things Reiki, and share with one another."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,250,244,0.95),rgba(241,231,220,0.92))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Practitioners Only
          </span>
          <h2 className="display-section-title">
            A Reiki community circle for practice, connection, and sharing.
          </h2>
          <p className="mt-5 max-w-[40rem] text-[1.03rem] text-[var(--color-muted)]">
            Reiki Share is a small gathering for Reiki practitioners who want to
            stay connected to the work in community. We will gather to talk all
            things Reiki, share practice with one another, and create space to
            both give and receive.
          </p>
          <p className="mt-4 max-w-[40rem] text-[var(--color-muted)]">
            This evening is intentionally limited to keep the space intimate,
            supportive, and easy to settle into.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <form action="/api/checkout/event" method="post">
              <input
                type="hidden"
                name="eventSlug"
                value="reiki-share-november-5-2026"
              />
              <button type="submit" className="button-pill">
                Reserve Your Spot
              </button>
            </form>
            <Link
              href={site.links.events}
              className="button-pill button-pill-secondary"
            >
              Back to Events
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/services-gasho.jpeg"
            alt="Hands in prayer at the start of a Reiki practice."
            className="h-full min-h-[28rem] w-full object-cover object-center"
          />
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            What We Will Share
          </span>
          <h2 className="display-section-title">
            A supportive place to keep practicing.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            This is a relaxed, heart-centered practice circle for those already
            trained in Reiki. Come ready to connect, ask questions, share what
            you are learning, and receive support from the group.
          </p>
          <ul className="mt-6 grid gap-3 text-[var(--color-muted)]">
            {gatheringIntentions.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
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
