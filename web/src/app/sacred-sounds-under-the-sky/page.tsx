import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const details = [
  {
    label: "Status",
    value: "Canceled",
    description:
      "The May 23 gathering has been canceled due to the cold weather forecast.",
  },
  {
    label: "Original Date",
    value: "Sat, May 23",
    description: "Originally planned for 11:00 AM-12:00 PM in Bayport, NY.",
  },
  {
    label: "Next Gathering",
    value: "Soon",
    description: "A future outdoor sound date will be shared when it is set.",
  },
] as const;

const experienceHighlights = [
  "Crystal bowls, gong, chimes, and open-air sound",
  "A soft reset for your nervous system before summer begins",
  "A welcoming outdoor circle with no experience needed",
] as const;

const bringItems = [
  "Yoga mat or blanket",
  "Layers, socks, and anything cozy",
  "Water and simple comfort items",
  "A relaxed, come-as-you-are mindset",
] as const;

const goodToKnow = [
  "All are welcome",
  "No previous sound bath experience is needed",
  "The Lightness Grounds is on the corner of Gillette Avenue and Academy Street",
  "No bathroom facilities are available on site",
  "If weather shifts, a rain-date update will be shared by 9:00 AM",
] as const;

function CancellationNotice() {
  return (
    <div className="rounded-[24px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.82)] p-5 text-[var(--color-text)]">
      <strong className="block text-[1.05rem]">
        Canceled due to cold weather
      </strong>
      <p className="mt-2 text-[var(--color-muted)]">
        Sacred Sounds Under the Sky for Saturday, May 23 has been canceled.
        Thank you for understanding and keeping comfort and care at the center.
      </p>
    </div>
  );
}

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Sacred Sounds Under the Sky",
  description:
    "An outdoor sound bath experience at The Lightness Grounds in Bayport, NY with crystal bowls, gong, chimes, fresh air, and open-sky rest.",
  startDate: "2026-05-23T11:00:00-04:00",
  endDate: "2026-05-23T12:00:00-04:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventCancelled",
  image: "https://bethelightness.com/homepage-images/sacred-sounds-outdoor.jpeg",
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
    price: "30",
    priceCurrency: "USD",
    availability: "https://schema.org/SoldOut",
    url: "https://bethelightness.com/sacred-sounds-under-the-sky",
  },
};

export default function SacredSoundsUnderTheSkyPage() {
  return (
    <PageShell
      eyebrow="Outdoor Sound Bath"
      title="Sacred Sounds Under the Sky"
      description="The Saturday, May 23 outdoor sound bath has been canceled due to the cold weather forecast."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <section className="overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,249,239,0.95),rgba(239,225,205,0.86)_48%,rgba(206,217,190,0.54))] shadow-[0_28px_90px_rgba(59,41,31,0.12)]">
        <div className="grid gap-0 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <div className="flex flex-col justify-between p-7 sm:p-10 lg:min-h-[38rem]">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  Canceled
                </span>
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  Bayport, NY
                </span>
                <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                  May 23
                </span>
              </div>

              <h2 className="mt-7 max-w-[12ch] font-display text-[3rem] leading-[0.96] tracking-[0] text-[var(--color-text)] sm:text-[4.2rem] lg:text-[5.1rem]">
                This gathering has been canceled.
              </h2>
              <p className="mt-6 max-w-[36rem] text-[1.08rem] leading-8 text-[var(--color-muted)]">
                Because of the cold weather forecast, Sacred Sounds Under the
                Sky for Saturday, May 23 will not be held. Future outdoor sound
                gatherings will be shared once a new date is set.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={site.links.events} className="button-pill">
                Back to Events
              </Link>
            </div>
          </div>

          <div className="relative min-h-[24rem] overflow-hidden bg-[#e7dccd] sm:min-h-[32rem] lg:min-h-full">
            <img
              src="/homepage-images/sacred-sounds-outdoor.jpeg"
              alt="Outdoor sound bath setup for Sacred Sounds Under the Sky"
              className="h-full min-h-[24rem] w-full object-cover object-center sm:min-h-[32rem] lg:min-h-full"
            />
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(47,37,32,0.58),transparent)] p-6 text-[#fffaf5] sm:p-8">
              <p className="max-w-[28rem] text-[1.05rem] font-semibold leading-7">
                Bring a mat, a blanket, and a little room in your day to receive.
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

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,252,248,0.88),rgba(239,230,217,0.82))] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-9 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Weather Update
          </span>
          <h2 className="display-section-title">
            Comfort comes first.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            This gathering was created as a peaceful outdoor sound bath, and the
            weather is simply too cold for the kind of settled, cozy rest it was
            meant to offer.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <CancellationNotice />
          </div>
        </div>

        <div className="grid gap-3">
          {experienceHighlights.map((item) => (
            <div
              key={item}
              className="rounded-[20px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.76)] p-5 text-[1rem] font-semibold leading-7 text-[var(--color-text)]"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/events-ceremony-outdoor.jpeg"
            alt="Outdoor ceremony setup in nature"
            className="h-full min-h-[24rem] w-full object-cover object-center"
          />
        </div>

        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-9">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            What To Bring
          </span>
          <h2 className="display-section-title">
            Cozy, simple, and easy.
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
            Dress in layers so you can stay comfortable as you settle in. This
            gathering is fully outdoors at The Lightness Grounds, on the corner
            of Gillette Avenue and Academy Street.
          </p>
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-9 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Good To Know
          </span>
          <h2 className="display-section-title">
            Rest outdoors, breathe deeply, and let the sky hold the mood.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Come as you are. No experience is needed, just a willingness to
            pause, receive, and let sound do what sound does best.
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
