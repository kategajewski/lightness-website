import Link from "next/link";
import { EventCheckoutForm } from "@/components/event-checkout-form";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Called to Reiki | Holy Fire® Reiki Masterclass",
  description:
    "Called to Reiki is a live Holy Fire® Reiki masterclass and healing experience with Kate on September 16, 2026. Your $11 registration will be applied toward the Reiki Rising™ Experience if you enroll.",
  path: "/is-reiki-calling-you",
  image: "/homepage-images/reiki-masterclass-hero-kate.jpeg",
});

const experienceIncludes = [
  "A grounded introduction to Reiki and how the energy may feel",
  "Guidance for recognizing whether Reiki is calling you",
  "A settling meditation to help you arrive in your body",
  "A live Holy Fire® Reiki healing experience",
  "Space to integrate, reflect and ask your questions",
  "An introduction to the Reiki Rising certification journey",
] as const;

const forYouIf = [
  "You feel curious about Reiki but do not know where to begin",
  "You are a healer, helper or creative who wants another way to support others",
  "You feel sensitive to energy and want to understand that sensitivity",
  "You are considering Reiki training and want to experience Kate's approach first",
] as const;

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Called to Reiki",
  description:
    "A live Holy Fire® Reiki masterclass and healing experience with Kate Gajewski.",
  startDate: "2026-09-16T19:00:00-04:00",
  endDate: "2026-09-16T20:15:00-04:00",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "VirtualLocation",
    url: `${site.url}${site.links.reikiMasterclass}`,
  },
  organizer: {
    "@type": "Person",
    name: "Kate Gajewski",
    url: site.url,
  },
  offers: {
    "@type": "Offer",
    price: "11",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${site.url}${site.links.reikiMasterclass}`,
  },
};

export default function ReikiMasterclassPage() {
  return (
    <PageShell
      eyebrow="Wednesday, September 16 | 7:00-8:15 PM"
      title="Called to Reiki"
      description="A Holy Fire® Reiki Masterclass + Healing Experience"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <section className="grid overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,250,245,0.96),rgba(230,194,162,0.24),rgba(168,178,159,0.18))] shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1.02fr_0.98fr]">
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Live Online | $11
          </span>
          <h2 className="display-section-title max-w-[14ch]">
            Experience Reiki before deciding whether to learn it.
          </h2>
          <p className="mt-5 max-w-[36rem] text-[1.04rem] leading-7 text-[var(--color-muted)]">
            Come as you are. This live online gathering blends clear teaching
            with meditation, healing and time to ask the questions that have
            been sitting on your heart.
          </p>
          <p className="mt-6 max-w-[36rem] text-[0.98rem] font-semibold leading-7 text-[var(--color-text)]">
            Your $11 registration will be applied toward the Reiki Rising™
            Experience if you choose to enroll.
          </p>
          <div className="mt-8">
            <EventCheckoutForm
              eventSlug="reiki-rising-masterclass-september-16-2026"
              buttonLabel="Reserve My Place for $11"
            />
          </div>
        </div>

        <div className="min-h-[30rem] overflow-hidden lg:min-h-[42rem]">
          <img
            src="/homepage-images/reiki-masterclass-hero-kate.jpeg"
            alt="Kate Gajewski holding her hands forward beneath the trees"
            className="h-full w-full object-cover object-[center_38%]"
          />
        </div>
      </section>

      <section className="grid gap-8 rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="overflow-hidden rounded-[28px]">
          <img
            src="/homepage-images/reiki-masterclass-healing.jpeg"
            alt="Kate offering Reiki with her hands gently placed near a client's head"
            className="aspect-[4/5] w-full object-cover object-center"
          />
        </div>
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            More Than A Class
          </span>
          <h2 className="display-section-title">
            Learn about Reiki, then receive the experience for yourself.
          </h2>
          <p className="mt-5 max-w-[40rem] text-[1.02rem] leading-7 text-[var(--color-muted)]">
            Reiki is something you can understand with your mind, but it is
            also something you experience. Kate will guide you through a
            meditation and a Holy Fire® Reiki healing so you can feel into the
            practice from a grounded, supported place.
          </p>
          <ul className="mt-7 grid gap-3 text-[var(--color-muted)]">
            {experienceIncludes.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(145deg,rgba(230,194,162,0.28),rgba(255,251,246,0.88))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            This Space May Be For You
          </span>
          <h2 className="display-section-title">
            You do not need to know whether Reiki training is your next step.
          </h2>
          <p className="mt-5 text-[var(--color-muted)]">
            You only need enough curiosity to spend an evening listening,
            receiving and noticing what arises.
          </p>
          <ul className="mt-7 grid gap-4 text-[var(--color-muted)]">
            {forYouIf.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/reiki-masterclass-kate-prayer.jpeg"
            alt="Kate Gajewski seated with her hands together in a grounding practice"
            className="aspect-[4/5] w-full object-cover object-[center_28%]"
          />
          <div className="p-7">
            <span className="mb-3 inline-block text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Your Guide
            </span>
            <h2 className="font-[var(--font-cormorant)] text-[2rem] font-light leading-tight text-[var(--color-text)]">
              Meet Kate Gajewski
            </h2>
            <p className="mt-3 leading-7 text-[var(--color-muted)]">
              Kate is a Reiki Master Teacher, sound practitioner and guide who
              brings warmth, depth and real-life integration to every space she
              holds.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-[rgba(137,100,79,0.2)] bg-[linear-gradient(135deg,rgba(119,77,61,0.92),rgba(89,73,61,0.95))] p-8 text-[rgba(255,250,245,0.95)] shadow-[0_28px_90px_rgba(59,41,31,0.16)] sm:p-10 lg:p-12">
        <div className="mx-auto max-w-[48rem] text-center">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[rgba(255,250,245,0.72)]">
            Your Registration Becomes Tuition Credit
          </span>
          <h2 className="font-[var(--font-cormorant)] text-[clamp(2.25rem,5vw,4rem)] font-light leading-[0.98]">
            If Reiki is calling you forward, your investment comes with you.
          </h2>
          <p className="mx-auto mt-5 max-w-[39rem] text-[1.02rem] leading-7 text-[rgba(255,250,245,0.78)]">
            Your $11 registration will be applied toward the Reiki Rising™
            Experience if you choose to enroll by September 20. One credit is
            available per person and has no cash value.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={site.links.reikiTraining}
              className="button-pill border-white/20 bg-[rgba(255,250,245,0.94)] text-[var(--color-text)] hover:bg-white"
            >
              Explore Reiki Rising
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.86)] p-8 text-center shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10 lg:p-12">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Reserve Your Place
        </span>
        <h2 className="mx-auto max-w-[18ch] display-section-title">
          Give yourself one evening to listen for the answer.
        </h2>
        <p className="mx-auto mt-5 max-w-[38rem] leading-7 text-[var(--color-muted)]">
          Register for $11. Your Google Meet access, calendar invitation and
          preparation notes will arrive by email.
        </p>
        <div className="mx-auto mt-8 flex max-w-[30rem] justify-center [&>form]:items-center [&>form_label]:text-center">
          <EventCheckoutForm
            eventSlug="reiki-rising-masterclass-september-16-2026"
            buttonLabel="Reserve My Place for $11"
          />
        </div>
        <p className="mx-auto mt-6 max-w-[38rem] text-[0.82rem] leading-5 text-[var(--color-muted)]">
          All event purchases are final and non-refundable. Reiki is a
          complementary wellness practice and is not a substitute for medical
          or mental health care.
        </p>
      </section>
    </PageShell>
  );
}
