import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const eventDetails = [
  {
    label: "Date",
    value: "Tuesday, July 14",
    description: "Gather from 7:00-8:30 PM.",
  },
  {
    label: "Location",
    value: "The Lightness of Being",
    description: "98 Medford Ave, Patchogue, NY 11772.",
  },
  {
    label: "Space",
    value: "Limited to 8",
    description: "A small, intimate group setting.",
  },
  {
    label: "Payment",
    value: "No refunds",
    description: "All event payments are final and non-refundable.",
  },
] as const;

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Gallery Reading with Don Schaefer",
  description:
    "An intimate group mediumship reading with evidential psychic medium Don Schaefer at The Lightness of Being in Patchogue.",
  startDate: "2026-07-14T19:00:00-04:00",
  endDate: "2026-07-14T20:30:00-04:00",
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
    availability: "https://schema.org/LimitedAvailability",
    url: "https://venmo.com/u/donald-schaefer-12",
  },
};

export default function GalleryReadingWithDonSchaeferPage() {
  return (
    <PageShell
      eyebrow="Featured Event"
      title="Gallery Reading with Don Schaefer"
      description="An intimate group mediumship reading held at The Lightness of Being in Patchogue."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/space-detail-2.jpeg"
            alt="A quiet, warmly lit detail inside The Lightness of Being."
            className="h-full min-h-[22rem] w-full object-cover"
          />
        </div>

        <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.92),rgba(239,229,217,0.88))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            With Evidential Psychic Medium Don Schaefer
          </span>
          <h2 className="display-section-title">
            A small evening of connection, messages, and meaning.
          </h2>
          <p className="mt-5 text-[var(--color-muted)]">
            Join us for an intimate gallery-style reading with Don Schaefer.
            This gathering is intentionally limited so the room can stay quiet,
            personal, and held.
          </p>

          <div className="mt-7 grid gap-3">
            {eventDetails.map((detail) => (
              <div
                key={detail.label}
                className="rounded-[20px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.68)] p-5"
              >
                <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {detail.label}
                </span>
                <strong className="block text-[1.08rem] text-[var(--color-text)]">
                  {detail.value}
                </strong>
                <p className="mt-1 text-[0.95rem] text-[var(--color-muted)]">
                  {detail.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="https://venmo.com/u/donald-schaefer-12"
              className="button-pill"
            >
              Register Through Venmo
            </Link>
            <Link
              href={site.links.events}
              className="button-pill button-pill-secondary"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
