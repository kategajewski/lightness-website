import Image from "next/image";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Reiki Rising Online Reiki Training",
  description: "A 10-week online Reiki training with Kate Gajewski combining weekly modules, live support, personal healing, embodied practice and practitioner development.",
  path: "/reiki-rising",
  image: "/homepage-images/reiki-rising-kate-hands-raised-soft.png",
});

const programFeatures = [
  "10 prerecorded weekly modules released every Sunday",
  "Live support calls on Wednesdays at 7:00 PM (Eastern Time)",
  "A private student portal with replays, materials and weekly guidance",
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
    value: "Wednesdays at 7:00 PM (Eastern Time), September 30 - December 2",
  },
  {
    label: "Call Length",
    value: "Usually 60 minutes, with space to extend to 75 minutes",
  },
] as const;

const moduleMap = [
  "The foundations of Reiki, how Reiki can feel, Reiki history and the science behind energy healing",
  "Chakras, the aura, meridians and how energy can show up in the body",
  "Grounding, shielding and creating energetic safety",
  "The Three Pillars of Reiki, self-Reiki and hand positions",
  "Sharing Reiki with others, animals, plants, food and water",
  "Reiki symbols and Cho Ku Rei",
  "Sei He Ki, Koki-ho and Gyoshi Ho",
  "Hon Sha Ze Sho Nen and distant Reiki",
  "Practicing a full Reiki session with symbols and documentation",
  "Bringing Reiki into the world, business foundations and psychic surgery",
] as const;

const liveCallMap = [
  "Welcome, Q&A and Ocean of Holy Love experience",
  "Additional chakra teaching, toning and Q&A",
  "Grounding cord and coil meditation with Q&A",
  "Level One placement and support",
  "Self-Reiki practice support",
  "Holy Love One experience and integration",
  "Level Two placement and support",
  "Guided remote Reiki practice",
  "Breakout rooms for sharing Reiki and reflection",
  "Final Q&A, closing reflections and next steps",
] as const;

const pricingOptions = [
  {
    title: "Enrollment",
    price: "$1,111 paid in full",
    plan: "or 4 monthly payments of $303 ($1,212 total)",
    note:
      "The fixed payment plan ends automatically after the fourth payment.",
    bonus:
      "Enrollment also includes a complimentary 45-minute private session with Kate. You choose the focus.",
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
      "No. Reiki Rising uses weekly module drops and live calls so the experience feels held, paced and supported while still giving you time to watch and practice between calls.",
  },
  {
    question: "Will I receive certification?",
    answer:
      "Yes. Reiki Rising is structured as a Reiki 1 and Reiki 2 certification path with placements, practice and integration. To receive certification, students must receive the Level 1 and Level 2 placements live. For each level, one additional group make-up placement is included if you cannot attend the Wednesday evening placement. If you need a personal private placement instead, it may be scheduled during office hours for $50 remotely or $75 in person.",
  },
  {
    question: "Will we cover how to begin building a Reiki business?",
    answer:
      "Yes. Week 10 includes videos introducing the foundations of beginning a Reiki business. Throughout the program, you can bring any business questions into the Telegram chat for guidance and support. Business is explored in much greater depth at the Master level, while Reiki Rising gives you a grounded place to begin.",
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
    <main className="overflow-hidden bg-[#f6f0e8] text-[#2f2520]">
      <section className="relative isolate px-5 pb-14 pt-10 sm:px-8 lg:px-10 lg:pb-20 lg:pt-16">
        <div aria-hidden="true" className="absolute -left-28 top-28 -z-10 h-72 w-72 rounded-full bg-[rgba(230,194,162,0.18)] blur-2xl" />
        <div className="mx-auto grid w-full max-w-[1180px] gap-12 lg:grid-cols-[0.93fr_1.07fr] lg:items-center lg:gap-7">
          <div className="relative z-10 lg:pb-10">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#695a51]">
              Fall 2026 · Live Online
            </p>
            <h1 className="mt-6 font-display text-[clamp(5rem,12vw,9.6rem)] font-light uppercase leading-[0.72] tracking-[-0.045em] text-[#332923]">
              <span className="block">Reiki</span>
              <span className="block">Rising</span>
            </h1>
            <svg aria-hidden="true" className="mt-8 h-5 w-[min(22rem,80vw)] text-[#d7a884]" viewBox="0 0 360 24" fill="none">
              <path d="M3 16.5C72 3 139 7.5 190 13s101 7 167-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="mt-5 font-display text-[clamp(2rem,3.7vw,3.25rem)] font-normal leading-none text-[#66725d]">
              Learn. Practice. Integrate.
            </p>
            <p className="mt-5 max-w-[31rem] text-[1rem] leading-7 text-[#5b4c44] sm:text-[1.05rem]">
              A 10-week Reiki One and Reiki Two certification journey with
              space to receive, practice and become.
            </p>
            <Link href="#discover" className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-[#4c3a30] px-7 text-[0.75rem] font-bold uppercase tracking-[0.18em] !text-white shadow-[0_14px_35px_rgba(76,58,48,0.2)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#5d493d]">
              Discover Reiki Rising
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-[36rem] lg:mr-0 lg:max-w-[39rem]">
            <Image
              src="/homepage-images/reiki-rising-mystic-watercolor.png"
              alt=""
              fill
              aria-hidden="true"
              sizes="(max-width: 1024px) 100vw, 680px"
              className="pointer-events-none absolute !-inset-[22%] !h-[144%] !w-[144%] max-w-none object-contain opacity-[0.82] saturate-[0.82]"
            />
            <div className="relative mx-auto aspect-[4/5] w-[76%] overflow-hidden rounded-[50%_50%_2.6rem_2.6rem/25%_25%_2.6rem_2.6rem] border-[4px] border-[#f8f1e8] shadow-[0_30px_70px_rgba(59,41,31,0.18)] sm:w-[74%]">
              <Image src="/homepage-images/reiki-rising-kate-hands-raised-soft.png" alt="Kate Gajewski offering Reiki with both hands raised" fill priority sizes="(max-width: 1024px) 82vw, 520px" className="object-cover object-center" />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,rgba(54,40,31,0.08)_100%)]" />
            </div>
            {[
              "left-[5%] top-[35%]",
              "right-[4%] top-[36%]",
              "left-[10%] bottom-[13%]",
              "right-[9%] bottom-[8%]",
            ].map((position) => (
              <span
                key={position}
                aria-hidden="true"
                className={`absolute ${position} h-7 w-7 drop-shadow-[0_0_10px_rgba(244,205,113,0.9)]`}
              >
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,#f4d99b,transparent)]" />
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[linear-gradient(90deg,transparent,#f4d99b,transparent)]" />
                <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff1bd] shadow-[0_0_10px_4px_rgba(244,205,113,0.55)]" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="border-y border-[rgba(76,58,48,0.12)] bg-[#ead2bd] px-5 py-5">
        <div className="mx-auto grid max-w-[960px] grid-cols-3 text-center font-display text-[clamp(1.25rem,2.2vw,1.85rem)] uppercase tracking-[0.08em] text-[#4c3a30]">
          <span>Learn.</span>
          <span className="border-x border-[rgba(76,58,48,0.18)]">Practice.</span>
          <span>Integrate.</span>
        </div>
      </div>

      <div id="discover" className="mx-auto flex w-full max-w-[1180px] scroll-mt-24 flex-col gap-16 px-5 py-20 sm:px-8 lg:gap-20 lg:px-10 lg:py-24">
        <section className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:gap-20">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#695a51]">The Journey</p>
            <h2 className="mt-5 max-w-[30rem] font-display text-[clamp(2.8rem,5vw,4.75rem)] font-light leading-[0.93]">
              More than a quick class. A space to truly meet the energy.
            </h2>
          </div>
          <div className="lg:pt-10">
            <p className="max-w-[40rem] font-display text-[clamp(1.65rem,2.6vw,2.25rem)] font-light leading-[1.18] text-[#4c3a30]">
              Reiki Rising gives you time to receive the teachings, practice
              with the energy, ask questions and integrate Reiki into your life
              in a grounded way.
            </p>
            <ul className="mt-9 grid gap-4 text-[#554842]">
              {programFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-4">
                  <span className="mt-[0.55rem] h-2 w-2 shrink-0 rounded-full bg-[#91a087]" />
                  <span className="leading-7">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/checkout/reiki-rising" className="button-pill">View Enrollment Options</Link>
              <Link href={site.links.mentorship} className="button-pill">Explore 1:1 Mentorship</Link>
            </div>
          </div>
        </section>

      <section className="grid overflow-hidden rounded-[32px] bg-[#a8b29f] lg:grid-cols-4">
        {scheduleItems.map((item) => (
          <article
            key={item.label}
            className="border-b border-white/35 p-7 last:border-b-0 lg:min-h-44 lg:border-b-0 lg:border-r lg:last:border-r-0"
          >
            <span className="mb-3 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {item.label}
            </span>
            <p className="font-display text-[1.5rem] font-normal leading-tight text-[#2f352b]">
              {item.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-10 rounded-[36px] bg-[#efe1d3] p-8 sm:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-14">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            The Format
          </span>
          <h2 className="display-section-title">
            Weekly modules give you space to learn. Live calls give you space to be held.
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">
            New prerecorded modules are released every Sunday, giving you a few
            days to watch, practice, reflect and gather questions before the
            Wednesday live support call.
          </p>
          <p className="mt-4 text-[var(--color-muted)]">
            The Telegram community remains open through the close of the final
            week so you have a place for questions, reflections and support as
            the work unfolds.
          </p>
        </div>
        <div className="grid gap-4">
          {pricingOptions.map((option) => (
            <article
              key={option.title}
              className="relative overflow-hidden rounded-[32px] bg-[#e6c2a2] p-9 shadow-[0_22px_55px_rgba(76,58,48,0.08)] sm:p-12"
            >
              <svg aria-hidden="true" className="absolute -right-14 -top-12 h-[115%] w-[72%] text-white/50" viewBox="0 0 360 420" fill="none">
                <path d="M321 -22C169 74 334 151 205 244C87 329 160 390 338 438" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M386 27C244 112 320 196 167 278C67 332 99 391 252 437" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <span aria-hidden="true" className="absolute right-[14%] top-[17%] h-2 w-2 rounded-full bg-[#fff9dc] shadow-[0_0_14px_5px_rgba(255,239,180,0.72)]" />
              <span aria-hidden="true" className="absolute bottom-[14%] right-[31%] h-1.5 w-1.5 rounded-full bg-[#fff9dc] shadow-[0_0_12px_4px_rgba(255,239,180,0.62)]" />
              <span className="relative mb-3 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {option.title}
              </span>
              <strong className="relative block text-[1.5rem] font-semibold leading-tight text-[var(--color-text)]">
                {option.price}
              </strong>
              <p className="relative mt-2 text-[0.95rem] text-[var(--color-muted)]">
                {option.plan}
              </p>
              <p className="relative mt-3 text-[0.92rem] text-[var(--color-muted)]">
                {option.note}
              </p>
              {option.bonus ? (
                <p className="relative mt-5 rounded-[20px] bg-[rgba(255,250,245,0.52)] px-5 py-4 text-[0.92rem] font-medium leading-6 text-[var(--color-text)]">
                  {option.bonus}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[62rem] border-y border-[rgba(76,58,48,0.13)] py-12 sm:py-16">
        <div className="text-center">
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              From a Reiki Rising Student
            </span>
            <blockquote className="mx-auto max-w-[52rem] font-display text-[clamp(2rem,3.8vw,3.2rem)] font-light leading-[1.1] text-[#4c3a30]">
              &ldquo;My Reiki experience has been life changing. I look at life
              differently, appreciate Mother Nature more, listen to my
              intuition and take more time for myself. Reiki Rising meant
              stepping outside of my comfort zone and following the pull to
              learn Reiki. I am so happy I pushed myself to do this.&rdquo;
            </blockquote>
            <p className="mt-6 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Janice, Reiki Rising student
            </p>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[36px] bg-[#d9c3be] p-8 sm:p-11 lg:p-14">
        <div aria-hidden="true" className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border border-white/40" />
        <div aria-hidden="true" className="absolute -bottom-10 -left-6 h-48 w-48 rounded-full border border-white/40" />
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Private Support Included
        </span>
        <h2 className="display-section-title">
          Your session. Your focus.
        </h2>
        <div className="mt-5 grid gap-4 text-[var(--color-muted)] lg:grid-cols-2">
          <p>
            Every Reiki Rising student also receives a complimentary 45-minute
            private session with Kate and chooses the focus that feels most
            supportive.
          </p>
          <p>
            Your session can be used to receive Reiki, ask for deeper personal
            guidance, explore business questions, receive practice support or
            integrate what is unfolding through the training. It may be used
            during the program or within one week after it ends. The session
            expires December 12, 2026.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[34px] bg-[#a8b29f] p-8 sm:p-10">
          <h2 className="display-section-title">What We&apos;ll Explore</h2>
          <ol className="mt-7 grid text-[#3e463a]">
            {moduleMap.map((module, index) => (
              <li key={module} className="flex gap-3 border-t border-white/35 py-3.5">
                <span className="font-display text-xl text-[#2f352b]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{module}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-[34px] bg-[#e6c2a2] p-8 sm:p-10">
          <h2 className="display-section-title">Live Support &amp; Integration</h2>
          <ol className="mt-7 grid text-[#554239]">
            {liveCallMap.map((call, index) => (
              <li key={call} className="flex gap-3 border-t border-white/35 py-3.5">
                <span className="font-display text-xl text-[#4c3a30]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{call}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid gap-10 py-4 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
        <div>
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          FAQs
        </span>
        <h2 className="display-section-title">A few things you may be wondering.</h2>
        </div>
        <div className="divide-y divide-[rgba(76,58,48,0.1)] border-y border-[rgba(76,58,48,0.1)]">
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

      <section className="grid gap-8 rounded-[36px] bg-[#a8b29f] p-8 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:p-14">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Certification
          </span>
          <h2 className="display-section-title">
            A meaningful path toward Reiki 1 and Reiki 2 certification.
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">
            These requirements are designed to help students receive the
            teachings, practice the energy and complete the training with
            grounded confidence.
          </p>
        </div>
        <div className="rounded-[28px] bg-[rgba(255,250,245,0.55)] p-6 sm:p-8">
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

      <section className="relative overflow-hidden py-12 text-center lg:py-20">
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 -z-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(230,194,162,0.28)] blur-3xl" />
        <div className="relative z-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Enrollment
        </span>
        <h2 className="display-section-title">
          Reiki Rising Fall 2026 begins Sunday, September 27.
        </h2>
        <p className="mx-auto mt-4 max-w-[42rem] text-[var(--color-muted)]">
          Review the enrollment options, choose the payment rhythm that feels
          aligned and step into the next cohort with clarity and support.
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
        </div>
      </section>
      </div>
    </main>
  );
}
