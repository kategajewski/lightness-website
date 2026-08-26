import Link from "next/link";
import { EventCheckoutForm } from "@/components/event-checkout-form";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const details = [
  {
    label: "Date",
    value: "Tue, Aug 25",
    description:
      "Arrive as the day begins to soften, 7:00 PM at The Lightness Grounds in Bayport, NY.",
  },
  {
    label: "Rain Date",
    value: "Thu, Aug 27",
    description:
      "If weather shifts the event, tickets move to the rain date and remain non-refundable.",
  },
  {
    label: "Exchange",
    value: "$35",
    description: "$35 day-of registration, space permitting.",
  },
] as const;

const bringItems = [
  "Yoga mat or blanket",
  "Layers, socks, and anything cozy",
  "Water and simple comfort items",
  "A camping chair is welcome if you would rather sit",
] as const;

const goodToKnow = [
  "All are welcome",
  "No previous sound bath experience is needed",
  "The Lightness Grounds is on the corner of Gillette Avenue and Academy Street",
  "No bathroom facilities are available on site",
  "If weather shifts the event, tickets move to Thursday, August 27 at 7:00 PM",
  "Tickets are non-refundable",
] as const;

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Golden Hour: An Outdoor Sound Journey",
  description:
    "A welcoming sunset sound journey with stillness and open-air rest at The Lightness Grounds in Bayport, NY.",
  startDate: "2026-08-25T19:00:00-04:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  image: "https://bethelightness.com/homepage-images/golden-hour-july-kate.jpeg",
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
  offers: {
    "@type": "Offer",
    price: "35",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://bethelightness.com/golden-hour-august-25",
  },
};

export default function SacredSoundsUnderTheSkyPage() {
  return (
    <PageShell
      eyebrow="Outdoor Sound Bath"
      title="Golden Hour: An Outdoor Sound Journey"
      description="A sunset ceremony to soften into the evening, receive sound beneath the open sky, and let the day unwind."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <section className="overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,249,239,0.95),rgba(239,225,205,0.86)_48%,rgba(206,217,190,0.54))] shadow-[0_28px_90px_rgba(59,41,31,0.12)]">
        <div className="grid gap-0 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <div className="flex flex-col gap-6 p-7 sm:p-8 lg:min-h-0">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  Tuesday, August 25
                </span>
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  7:00 PM
                </span>
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  Bayport, NY
                </span>
              </div>

              <h2 className="mt-5 max-w-[12ch] font-display text-[3rem] leading-[0.96] tracking-[0] text-[var(--color-text)] sm:text-[4rem] lg:text-[4.8rem]">
                Golden Hour.
              </h2>
              <p className="mt-5 max-w-[36rem] text-[1.04rem] leading-8 text-[var(--color-muted)]">
                Come gather at golden hour, as the day softens and the evening
                light begins to settle. This outdoor sound journey is an
                invitation to slow down, breathe with the summer air, and be
                held by crystal bowls, gong, chimes, and the open sky. Golden
                Hour is a gentle ceremony for anyone craving a pause, a breath,
                and a little space to let the day unwind.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <EventCheckoutForm
                eventSlug="golden-hour-august-25-2026"
                buttonLabel="Reserve Your Place"
              />
              <Link href={site.links.events} className="button-pill">
                Back to Events
              </Link>
            </div>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden bg-[#e7dccd] sm:min-h-[28rem] lg:h-[30rem] lg:min-h-0">
            <img
              src="/homepage-images/golden-hour-july-kate.jpeg"
              alt="Kate leading a golden hour sound bath outdoors"
              className="h-full min-h-[22rem] w-full object-cover object-[center_60%] sm:min-h-[28rem] lg:min-h-0"
            />
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(47,37,32,0.58),transparent)] p-6 text-[#fffaf5] sm:p-8">
              <p className="max-w-[28rem] text-[1.05rem] font-semibold leading-7">
                Bring a mat, a blanket, and a willingness to let the evening
                meet you gently.
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

      <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/golden-hour-july-sun.jpeg"
            alt="Golden hour sound bath setup beneath the evening sun"
            className="h-full min-h-[24rem] w-full object-cover object-center"
          />
        </div>

        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-9">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            What To Bring
          </span>
          <h2 className="display-section-title">
            Come cozy. Come simple. Come as you are.
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
          <p className="mt-6 max-w-[38rem] text-[var(--color-muted)]">
            Dress in layers so your body can stay warm as the sun slips lower.
            This gathering is fully outdoors at The Lightness Grounds, on the
            corner of Gillette Avenue and Academy Street.
          </p>
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-9 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Good To Know
          </span>
          <h2 className="display-section-title">
            Rest outdoors, breathe deeply and let the evening sky do some of the holding.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Day-of tickets are $35, space permitting. If weather asks us to
            shift, the rain date will be Thursday, August 27 at 7:00 PM.
            Tickets are non-refundable and will move to the rain date if needed.
          </p>
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
