import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const details = [
  {
    label: "Date",
    value: "Sun, Aug 16",
    description:
      "Gather from 8:00-9:30 AM at The Lightness Grounds in Bayport, NY.",
  },
  {
    label: "Experience",
    value: "90 minutes",
    description:
      "An invigorating vinyasa flow followed by deeply restorative sound healing.",
  },
  {
    label: "Exchange",
    value: "$45",
    description: "Advance registration through secure Stripe checkout.",
  },
] as const;

const bringItems = [
  "Yoga mat",
  "Blanket or towel",
  "Water",
  "Layers and anything cozy for sound healing",
] as const;

const goodToKnow = [
  "Sunday, August 16 from 8:00-9:30 AM",
  "Led by Kate + Kelly",
  "The Lightness Grounds, corner of Gillette Avenue and Academy Street in Bayport",
  "$45 exchange",
  "If rain cancels the gathering, tickets will be refunded",
  "Otherwise, tickets are non-refundable but may be transferred to someone else",
] as const;

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Flow Field",
  description:
    "An open-air experience beginning with an invigorating vinyasa flow and ending with deeply restorative sound healing beneath the summer sky.",
  startDate: "2026-08-16T08:00:00-04:00",
  endDate: "2026-08-16T09:30:00-04:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  image: "https://bethelightness.com/homepage-images/flow-field-kate.jpeg",
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
    price: "45",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://bethelightness.com/flow-field",
  },
};

export default function FlowFieldPage() {
  return (
    <PageShell
      eyebrow="Outdoor Morning Practice"
      title="Flow Field"
      description="An open-air vinyasa flow and restorative sound healing experience led by Kate + Kelly."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <section className="overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,250,239,0.96),rgba(230,194,162,0.42)_46%,rgba(168,178,159,0.34))] shadow-[0_28px_90px_rgba(59,41,31,0.12)]">
        <div className="grid gap-0 lg:grid-cols-[0.98fr_1.02fr] lg:items-stretch">
          <div className="flex flex-col gap-6 p-7 sm:p-8 lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  Sunday, August 16
                </span>
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  8:00-9:30 AM
                </span>
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  Bayport, NY
                </span>
              </div>

              <h2 className="mt-5 max-w-[11ch] font-display text-[3.2rem] leading-[0.96] tracking-[0] text-[var(--color-text)] sm:text-[4.3rem] lg:text-[5.2rem]">
                Flow Field.
              </h2>
              <p className="mt-5 max-w-[36rem] text-[1.04rem] leading-8 text-[var(--color-muted)]">
                Flow Field is an open-air experience beginning with an
                invigorating vinyasa flow and ending with deeply restorative
                sound healing.
              </p>
              <p className="mt-4 max-w-[36rem] text-[1.04rem] leading-8 text-[var(--color-muted)]">
                Led by Kate + Kelly, this morning gathering invites you to
                move, breathe, and unwind beneath the summer sky.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <form action="/api/checkout/event" method="post">
                <input
                  type="hidden"
                  name="eventSlug"
                  value="flow-field-august-16-2026"
                />
                <button type="submit" className="button-pill">
                  Reserve Your Place
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

          <div className="relative min-h-[24rem] overflow-hidden bg-[#e7dccd] sm:min-h-[30rem] lg:h-[34rem] lg:min-h-0">
            <img
              src="/homepage-images/flow-field-kate.jpeg"
              alt="Kate seated outdoors with crystal singing bowls beneath a summer tree"
              className="h-full min-h-[24rem] w-full object-cover object-[center_58%] sm:min-h-[30rem] lg:min-h-0"
            />
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(47,37,32,0.58),transparent)] p-6 text-[#fffaf5] sm:p-8">
              <p className="max-w-[30rem] text-[1.05rem] font-semibold leading-7">
                Vinyasa flow, breath, and restorative sound at The Lightness Grounds.
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
            src="/homepage-images/flow-field-kelly.jpeg"
            alt="Kelly standing outdoors in greenery"
            className="h-full min-h-[24rem] w-full object-cover object-[center_38%]"
          />
        </div>

        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-9">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            What To Bring
          </span>
          <h2 className="display-section-title">
            Move, breathe, and settle into sound.
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
            Good To Know
          </span>
          <h2 className="display-section-title">
            An open-air field for energy, movement, and rest.
          </h2>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Before You Come
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
