import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

const sanctuaryRegistrationUrl =
  "https://www.sanctuary-health.org/event-details/autumn-alchemy-sound-journey-with-kate";

export const metadata = createPageMetadata({
  title: "Monthly Sound Journeys at Sanctuary+Health",
  description:
    "Join Kate Gajewski for monthly sound journeys infused with Holy Fire® Reiki at Sanctuary+Health in Patchogue, New York.",
  path: "/sound-journeys-at-sanctuary",
  image: "/homepage-images/autumn-alchemy-flyer.jpeg",
});

const experienceNotes = [
  "A deeply restorative 90-minute sound journey",
  "Crystal bowls, gong, chimes and intuitive sound",
  "Holy Fire® Reiki woven gently through the experience",
  "A seasonal space to soften, receive and return to yourself",
] as const;

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Autumn Alchemy Sound Journey with Kate",
  description:
    "A deeply restorative evening of sound and Holy Fire® Reiki with Kate Gajewski at Sanctuary+Health in Patchogue, New York.",
  startDate: "2026-09-21T20:00:00-04:00",
  endDate: "2026-09-21T21:30:00-04:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  image: `${site.url}/homepage-images/autumn-alchemy-flyer.jpeg`,
  performer: {
    "@type": "Person",
    name: "Kate Gajewski",
    url: `${site.url}/about`,
  },
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
  offers: {
    "@type": "Offer",
    price: "55",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: sanctuaryRegistrationUrl,
  },
};

export default function SoundJourneysAtSanctuaryPage() {
  return (
    <PageShell
      eyebrow="Monthly Sound Journeys"
      title="Sound journeys at Sanctuary+Health"
      description="Monthly, Reiki-infused sound experiences led by Kate Gajewski in the heart of Patchogue. Each gathering offers a new invitation to slow down, listen and reconnect."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <section className="overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(145deg,rgba(255,249,242,0.96),rgba(223,194,166,0.45)_46%,rgba(137,100,79,0.18))] shadow-[0_28px_90px_rgba(59,41,31,0.12)]">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-12">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                Monday, September 21
              </span>
              <span className="rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text)]">
                8:00-9:30 PM
              </span>
            </div>

            <span className="mt-8 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              September&apos;s Gathering
            </span>
            <h2 className="mt-3 max-w-[11ch] font-display text-[3.15rem] leading-[0.96] tracking-[0] text-[var(--color-text)] sm:text-[4.3rem] lg:text-[5rem]">
              Autumn Alchemy
            </h2>
            <p className="mt-6 max-w-[39rem] text-[1.06rem] leading-8 text-[var(--color-muted)]">
              A deeply restorative evening of sound and Holy Fire® Reiki,
              created to help you soften, receive and settle into the energy of
              the season. Allow the vibrations to wash over you as we welcome
              autumn with intention.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={sanctuaryRegistrationUrl}
                target="_blank"
                rel="noreferrer"
                className="button-pill"
              >
                Reserve Through Sanctuary
              </a>
              <Link href="#what-to-expect" className="button-pill">
                What to Expect
              </Link>
            </div>
            <p className="mt-4 max-w-[35rem] text-[0.86rem] leading-6 text-[var(--color-muted)]">
              Tickets are $55 before processing fees and are sold by
              Sanctuary+Health. You can also find the event in the Mindbody app
              under Sanctuary+Health.
            </p>
          </div>

          <div className="relative overflow-hidden bg-[#d3b198] lg:min-h-[44rem]">
            <img
              src="/homepage-images/autumn-alchemy-flyer.jpeg"
              alt="Autumn Alchemy sound journey at Sanctuary+Health with Kate"
              className="block h-auto w-full object-contain object-center lg:h-full lg:object-cover"
            />
          </div>
        </div>
      </section>

      <section
        id="what-to-expect"
        className="scroll-mt-28 grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch"
      >
        <div className="overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[#2f2520] shadow-[0_24px_80px_rgba(59,41,31,0.1)]">
          <img
            src="/homepage-images/sanctuary-room-wide.jpeg"
            alt="The Sanctuary+Health room prepared with mats, blankets, bolsters and sound instruments"
            className="h-full min-h-[31rem] w-full object-cover object-center"
          />
        </div>

        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            What to Expect
          </span>
          <h2 className="display-section-title">
            An evening designed for deep rest and quiet transformation.
          </h2>
          <p className="mt-5 max-w-[42rem] text-[1.02rem] leading-8 text-[var(--color-muted)]">
            You will be guided into a comfortable resting position while sound
            moves through the room. There is nothing to perform or achieve. You
            are welcome to receive the experience exactly as you are.
          </p>
          <ul className="mt-7 grid gap-3 text-[var(--color-muted)]">
            {experienceNotes.map((note) => (
              <li key={note} className="flex gap-3">
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[rgba(137,100,79,0.82)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.78)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-9">
        <div className="max-w-[43rem]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Inside Sanctuary
          </span>
          <h2 className="display-section-title">
            A spacious, softly held room prepared with care.
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">
            Before each gathering, the room is arranged with instruments,
            flowers, warm light and everything you need to settle in.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <figure className="overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[#e6ddd2]">
            <img
              src="/homepage-images/sanctuary-sound-altar-detail.jpeg"
              alt="Singing bowls, flowers, candles and sound instruments arranged at Sanctuary+Health"
              className="h-[29rem] w-full object-cover object-center"
            />
          </figure>
          <figure className="overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[#ded2c5]">
            <img
              src="/homepage-images/sanctuary-floral-sound-bowls.jpeg"
              alt="Crystal singing bowls framed by fresh flowers at Sanctuary+Health"
              className="h-[29rem] w-full object-cover object-center"
            />
          </figure>
          <figure className="overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[#e6ddd2] md:col-span-2">
            <img
              src="/homepage-images/sanctuary-full-instrument-setup.jpeg"
              alt="The complete sound instrument arrangement at Sanctuary+Health with gongs, bowls, flowers and candles"
              className="h-auto max-h-[42rem] w-full object-cover object-center"
            />
          </figure>
        </div>
      </section>

      <section className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,252,248,0.92),rgba(230,194,162,0.23),rgba(168,178,159,0.2))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Feel the calling to become a sound practitioner and hold your own
              sound baths?
            </span>
            <h2 className="display-section-title">
              Move from receiving sound to learning how to share it.
            </h2>
            <p className="mt-5 max-w-[42rem] text-[1.02rem] leading-8 text-[var(--color-muted)]">
              Kate&apos;s Sound Practitioner Training is an immersive in-person
              experience for practitioners, space holders and heart-led
              students who want to facilitate restorative sound with presence,
              skill and intention.
            </p>
            <p className="mt-4 text-[0.95rem] font-semibold text-[var(--color-text)]">
              The next training takes place January 29 through 31, 2027.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={site.links.soundTraining} className="button-pill">
                Explore Sound Training
              </Link>
              <Link href={site.links.emailUpdates} className="button-pill">
                Receive Future Dates
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.62)] p-4 shadow-[0_22px_70px_rgba(59,41,31,0.08)]">
            <img
              src="/homepage-images/moodysound.jpeg"
              alt="Crystal singing bowls, bell, flowers and candles arranged for an intimate sound experience"
              className="mx-auto block max-h-[31rem] w-full rounded-[22px] object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-8 text-center shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Hosted in Patchogue
        </span>
        <h2 className="display-section-title">Sanctuary+Health</h2>
        <p className="mx-auto mt-4 max-w-[38rem] text-[var(--color-muted)]">
          64 W Main Street, Patchogue, NY 11772. This gathering is led by Kate
          Gajewski of The Lightness of Being and hosted at Sanctuary+Health.
        </p>
        <p className="mx-auto mt-3 max-w-[38rem] text-[0.88rem] leading-6 text-[var(--color-muted)]">
          Registration, payment and ticket policies are managed by
          Sanctuary+Health.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href={sanctuaryRegistrationUrl}
            target="_blank"
            rel="noreferrer"
            className="button-pill"
          >
            Reserve Your Space
          </a>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Sanctuary%2BHealth%2C%2064%20W%20Main%20Street%2C%20Patchogue%2C%20NY%2011772"
            target="_blank"
            rel="noreferrer"
            className="button-pill"
          >
            Get Directions
          </a>
        </div>
      </section>
    </PageShell>
  );
}
