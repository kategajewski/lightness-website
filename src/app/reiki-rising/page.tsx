import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Reiki Rising Online Reiki Training",
  description: "A 10-week online Reiki training with Kate Gajewski combining weekly modules, live support, personal healing, embodied practice, and practitioner development.",
  path: "/reiki-rising",
  image: "/homepage-images/ghl-reiki-rising.webp",
});

const programFeatures = [
  "10 prerecorded weekly modules released every Sunday",
  "Live support calls on Wednesdays at 7:00 PM ET",
  "A private student portal with replays, materials, and weekly guidance",
  "Telegram community support through Saturday, December 5, 2026",
  "A grounded Reiki 1 and Reiki 2 learning path with time for integration",
] as const;

const scheduleItems = [
  {
    label: "Program Dates",
    value: "September 27 - December 5, 2026",
  },
  {
    label: "Module Drops",
    value: "Sundays, September 27 - November 29",
  },
  {
    label: "Live Calls",
    value: "Wednesdays at 7:00 PM ET, September 30 - December 2",
  },
  {
    label: "Call Length",
    value: "Usually 60 minutes, with space to extend to 75 minutes",
  },
] as const;

const moduleMap = [
  "The foundations of Reiki, how Reiki can feel, Reiki history, and the science behind energy healing",
  "Chakras, the aura, meridians, and how energy can show up in the body",
  "Grounding, shielding, and creating energetic safety",
  "The Three Pillars of Reiki, self-Reiki, and hand positions",
  "Sharing Reiki with others, animals, plants, food, and water",
  "Reiki symbols and Cho Ku Rei",
  "Sei He Ki, Koki-ho, and Gyoshi Ho",
  "Hon Sha Ze Sho Nen and distant Reiki",
  "Practicing a full Reiki session with symbols and documentation",
  "Bringing Reiki into the world, business foundations, and psychic surgery",
] as const;

const liveCallMap = [
  "Welcome, Q&A, and Ocean of Holy Love experience",
  "Additional chakra teaching, toning, and Q&A",
  "Grounding cord and coil meditation with Q&A",
  "Level One placement and support",
  "Self-Reiki practice support",
  "Holy Love One experience and integration",
  "Level Two placement and support",
  "Guided remote Reiki practice",
  "Breakout rooms for sharing Reiki and reflection",
  "Final Q&A, closing reflections, and next steps",
] as const;

const pricingOptions = [
  {
    title: "Early Bird Enrollment",
    price: "$888 paid in full",
    plan: "or 3 payments of $333",
    note: "Available through August 31, 2026.",
    bonus:
      "Includes a complimentary 45-minute private Reiki support session with Kate.",
  },
  {
    title: "Regular Enrollment",
    price: "$1111 paid in full",
    plan: "or 3 payments of $404",
    note: "Begins after Early Bird closes.",
    bonus: null,
  },
] as const;

const faqs = [
  {
    question: "What if I miss a live call?",
    answer:
      "Replays are added to the student portal so you can stay connected to the weekly teaching and integration even if you cannot attend live.",
  },
  {
    question: "Is this self-paced?",
    answer:
      "No. Reiki Rising uses weekly module drops and live calls so the experience feels held, paced, and supported while still giving you time to watch and practice between calls.",
  },
  {
    question: "Will I receive certification?",
    answer:
      "Yes. Reiki Rising is structured as a Reiki 1 and Reiki 2 certification path with placements, practice, and integration. To receive certification, students must receive the Level 1 and Level 2 placements live. For each level, one additional group make-up placement is included if you cannot attend the Wednesday evening placement. If you need a personal private placement instead, it may be scheduled during office hours for $50 remotely or $75 in person.",
  },
] as const;

const certificationRequirements = [
  "Receive the Level 1 and Level 2 placements live",
  "Complete the core weekly modules",
  "Practice self-Reiki at least 5 times",
  "Share remote Reiki at least 2 times",
  "Share Reiki in person with consent at least 1 time",
  "Submit a short final reflection or practice log",
] as const;

export default function ReikiRisingPage() {
  return (
    <PageShell
      eyebrow="Reiki Rising"
      title="A 10-week Reiki 1 and Reiki 2 journey for healing, practice, and embodied confidence."
      description="Reiki Rising Fall 2026 blends weekly prerecorded teachings, live support calls, community connection, and spacious integration inside a guided 10-week Reiki training experience."
    >
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Fall 2026 Cohort
          </span>
          <h2 className="display-section-title">
            Learn Reiki with structure, spaciousness, and support between every step.
          </h2>
          <p className="mt-5 max-w-[42rem] text-[1.03rem] text-[var(--color-muted)]">
            Reiki Rising is for students who want more than a quick class. This
            cohort gives you time to receive the teachings, practice with the
            energy, ask questions, and integrate Reiki into your life in a
            grounded way.
          </p>
          <ul className="mt-8 grid gap-3 text-[var(--color-muted)]">
            {programFeatures.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/checkout/reiki-rising" className="button-pill">
              View Enrollment Options
            </Link>
            <Link href={site.links.mentorship} className="button-pill">
              Explore 1:1 Mentorship
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto w-full max-w-[20rem]">
            <img
              src="/homepage-images/ghl-reiki-rising.webp"
              alt="Reiki Rising training"
              className="block h-auto w-full rounded-[32px] object-contain object-center"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        {scheduleItems.map((item) => (
          <article
            key={item.label}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <span className="mb-3 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {item.label}
            </span>
            <p className="text-[1.02rem] font-semibold text-[var(--color-text)]">
              {item.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            The Format
          </span>
          <h2 className="display-section-title">
            Weekly modules give you space to learn. Live calls give you space to be held.
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">
            New prerecorded modules are released every Sunday, giving you a few
            days to watch, practice, reflect, and gather questions before the
            Wednesday live support call.
          </p>
          <p className="mt-4 text-[var(--color-muted)]">
            The Telegram community remains open through the close of the final
            week so you have a place for questions, reflections, and support as
            the work unfolds.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {pricingOptions.map((option) => (
            <article
              key={option.title}
              className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6"
            >
              <span className="mb-3 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {option.title}
              </span>
              <strong className="block text-[2rem] font-semibold text-[var(--color-text)]">
                {option.price}
              </strong>
              <p className="mt-2 text-[var(--color-muted)]">{option.plan}</p>
              <p className="mt-3 text-[0.92rem] text-[var(--color-muted)]">
                {option.note}
              </p>
              {option.bonus ? (
                <p className="mt-3 rounded-[18px] bg-[rgba(231,206,177,0.32)] px-4 py-3 text-[0.92rem] font-medium text-[var(--color-text)]">
                  {option.bonus}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
        <div className="p-8 sm:p-10 lg:p-12">
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              From a Reiki Rising Student
            </span>
            <blockquote className="max-w-[48rem] font-[var(--font-cormorant)] text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-[1.15] text-[var(--color-text)]">
              &ldquo;My Reiki experience has been life changing. I look at life
              differently, appreciate Mother Nature more, listen to my
              intuition, and take more time for myself. Reiki Rising meant
              stepping outside of my comfort zone and following the pull to
              learn Reiki. I am so happy I pushed myself to do this.&rdquo;
            </blockquote>
            <p className="mt-6 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Janice, Reiki Rising student
            </p>
        </div>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Early Bird Bonus
        </span>
        <h2 className="display-section-title">
          Extra support inside the Reiki Rising container.
        </h2>
        <div className="mt-5 grid gap-4 text-[var(--color-muted)] lg:grid-cols-2">
          <p>
            Enroll by August 31 and receive a complimentary 45-minute private
            Reiki support session with Kate to use anytime during Reiki Rising.
          </p>
          <p>
            Use it for Reiki healing, Reiki coaching, practice questions,
            energetic support, or integration as you move through the journey.
            Bonus session expires December 12, 2026.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <h2 className="display-section-title">What We&apos;ll Explore</h2>
          <ol className="mt-6 grid gap-3 text-[var(--color-muted)]">
            {moduleMap.map((module, index) => (
              <li key={module} className="flex gap-3">
                <span className="font-semibold text-[var(--color-text)]">
                  {index + 1}.
                </span>
                <span>{module}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <h2 className="display-section-title">Live Support &amp; Integration</h2>
          <ol className="mt-6 grid gap-3 text-[var(--color-muted)]">
            {liveCallMap.map((call, index) => (
              <li key={call} className="flex gap-3">
                <span className="font-semibold text-[var(--color-text)]">
                  {index + 1}.
                </span>
                <span>{call}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          FAQs
        </span>
        <h2 className="display-section-title">A few things you may be wondering.</h2>
        <div className="mt-7 divide-y divide-[rgba(76,58,48,0.1)] border-y border-[rgba(76,58,48,0.1)]">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                <span className="display-card-title">{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(231,206,177,0.32)] text-[1.35rem] font-light leading-none text-[var(--color-text)] transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[52rem] pb-6 pr-12 text-[var(--color-muted)]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Certification
          </span>
          <h2 className="display-section-title">
            A meaningful path toward Reiki 1 and Reiki 2 certification.
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">
            These requirements are designed to help students receive the
            teachings, practice the energy, and complete the training with
            grounded confidence.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <ul className="grid gap-3 text-[var(--color-muted)]">
            {certificationRequirements.map((requirement) => (
              <li key={requirement} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[0.95rem] text-[var(--color-muted)]">
            For each level, one additional group make-up placement is included
            if you cannot attend the Wednesday evening placement. A personal
            private placement may be scheduled during office hours for $50
            remotely or $75 in person.
          </p>
        </div>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 text-center shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Enrollment
        </span>
        <h2 className="display-section-title">
          Reiki Rising Fall 2026 begins Sunday, September 27.
        </h2>
        <p className="mx-auto mt-4 max-w-[42rem] text-[var(--color-muted)]">
          Review the enrollment options, choose the payment rhythm that feels
          aligned, and step into the next cohort with clarity and support.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/checkout/reiki-rising" className="button-pill">
            View Enrollment Options
          </Link>
          <Link
            href="/contact?inquiryType=training&subject=Reiki%20Rising%20Question"
            className="button-pill"
          >
            Ask a Question
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
