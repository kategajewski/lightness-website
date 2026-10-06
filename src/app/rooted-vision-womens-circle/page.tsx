import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

const ticketUrl =
  "https://www.sanctuary-health.org/event-details/rooted-vision-a-womens-circle-with-kate-janesa";
const flyerPath = "/event-flyers/rooted-vision-womens-circle.png";

export const metadata = createPageMetadata({
  title: "Rooted Vision: A Women's Circle with Kate & Janesa",
  description:
    "An evening of guided imagery, drumming and ritual with Kate and Janesa at Sanctuary+Health in Patchogue. October 9, 2026, 8:00-9:30 PM.",
  path: "/rooted-vision-womens-circle",
  image: flyerPath,
});

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Rooted Vision: A Women's Circle with Kate & Janesa",
  description:
    "A women's circle with guided imagery, medicine drumming, ritual and a shared petal blessing.",
  startDate: "2026-10-09T20:00:00-04:00",
  endDate: "2026-10-09T21:30:00-04:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  image: `${site.url}${flyerPath}`,
  url: `${site.url}/rooted-vision-womens-circle`,
  organizer: {
    "@type": "Organization",
    name: "Sanctuary+Health",
    url: "https://www.sanctuary-health.org",
  },
  performer: [
    { "@type": "Person", name: "Kate Gajewski", url: `${site.url}/about` },
    { "@type": "Person", name: "Janesa" },
  ],
  location: {
    "@type": "Place",
    name: "Sanctuary+Health",
    address: {
      "@type": "PostalAddress",
      streetAddress: "64 W Main Street",
      addressLocality: "Patchogue",
      addressRegion: "NY",
      postalCode: "11772",
      addressCountry: "US",
    },
  },
};

export default function RootedVisionWomensCirclePage() {
  return (
    <PageShell
      eyebrow="A Gathering for Women"
      title="Rooted Vision: A Women's Circle"
      description="With Kate & Janesa at Sanctuary+Health"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <section className="grid gap-7 lg:grid-cols-[1fr_0.92fr] lg:items-start">
        <div className="rounded-[30px] border border-[var(--color-rose)] bg-[var(--color-ivory)] p-7 sm:p-9">
          <h2 className="display-section-title">
            A space to root, bloom and rise together.
          </h2>
          <p className="mt-5 text-[1.04rem] leading-8 text-[var(--color-muted)]">
            Rooted Vision is an invitation to slow down, return to your body
            and make space for what is ready to grow. Join Kate and Janesa for
            a women&apos;s circle with guided imagery, medicine drumming, ritual
            and a shared petal blessing.
          </p>
          <p className="mt-4 text-[1.04rem] leading-8 text-[var(--color-muted)]">
            Come as you are. Let yourself be supported, rooted and in bloom.
          </p>

          <dl className="mt-7 grid gap-5 border-y border-[var(--color-line)] py-6 text-[var(--color-muted)]">
            <div>
              <dt className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.16em]">When</dt>
              <dd>
                <span className="block font-semibold text-[var(--color-text)]">Friday, October 9, 2026</span>
                8:00-9:30 PM
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.16em]">Where</dt>
              <dd>
                <span className="block font-semibold text-[var(--color-text)]">Sanctuary+Health</span>
                64 W Main Street, Patchogue, NY 11772
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.16em]">Tickets</dt>
              <dd>
                <span className="block font-semibold text-[var(--color-text)]">Sliding-scale admission</span>
                Choose your amount on Sanctuary&apos;s event page. Ticket service fees apply.
              </dd>
            </div>
          </dl>

          <p className="mt-6 text-[0.95rem] leading-7 text-[var(--color-muted)]">
            This gathering is hosted by Sanctuary+Health. Purchase your tickets
            directly through their event page using the button below.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={ticketUrl} target="_blank" rel="noopener noreferrer" className="button-pill">
              Purchase Tickets
            </a>
            <Link href={site.links.events} className="button-pill button-pill-secondary">
              Back to Events
            </Link>
          </div>
        </div>

        <figure className="overflow-hidden rounded-[26px] border border-[var(--color-line)]">
          <Image
            src={flyerPath}
            alt="Rooted Vision: A Women's Circle with Kate and Janesa. Friday, October 9, 8:00-9:30 PM. Root, bloom and rise together."
            width={1000}
            height={1250}
            priority
            sizes="(min-width: 1180px) 530px, (min-width: 1024px) 45vw, 94vw"
            className="block h-auto w-full"
          />
        </figure>
      </section>
    </PageShell>
  );
}
