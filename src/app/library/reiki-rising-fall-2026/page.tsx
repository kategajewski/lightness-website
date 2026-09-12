import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserWithAccess, hasActiveAccess } from "@/lib/member-access";
import {
  reikiRisingGoogleCalendarHref,
  reikiRisingLiveCalls,
} from "@/lib/reiki-rising-live-calls";

const textbookHref = "https://www.reiki.org/store/books/reiki-healing-touch";

const modules = [
  {
    date: "September 27, 2026",
    title:
      "The foundations of Reiki, how Reiki can feel, Reiki history, and the science behind energy healing",
  },
  {
    date: "October 4, 2026",
    title:
      "Chakras, the aura, meridians, and how energy can show up in the body",
  },
  {
    date: "October 11, 2026",
    title: "Grounding, shielding, and creating energetic safety",
  },
  {
    date: "October 18, 2026",
    title: "The Three Pillars of Reiki, self-Reiki, and hand positions",
  },
  {
    date: "October 25, 2026",
    title: "Sharing Reiki with others, animals, plants, food, and water",
  },
  {
    date: "November 1, 2026",
    title: "Reiki symbols and Cho Ku Rei",
  },
  {
    date: "November 8, 2026",
    title: "Sei He Ki, Koki-ho, and Gyoshi Ho",
  },
  {
    date: "November 15, 2026",
    title: "Hon Sha Ze Sho Nen and distant Reiki",
  },
  {
    date: "November 22, 2026",
    title: "Practicing a full Reiki session with symbols and documentation",
  },
  {
    date: "November 29, 2026",
    title: "Bringing Reiki into the world, business foundations, and psychic surgery",
  },
] as const;

const liveCalls = [
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

const certificationRequirements = [
  "Receive the Level 1 and Level 2 placements live",
  "Complete the core weekly modules",
  "Practice self-Reiki at least 5 times",
  "Share remote Reiki at least 2 times",
  "Share Reiki in person with consent at least 1 time",
  "Submit a short final reflection or practice log",
] as const;

export default async function ReikiRisingFall2026LibraryPage() {
  const { user, accessRows } = await getCurrentUserWithAccess();

  if (!user) {
    redirect("/login?error=Please%20sign%20in%20to%20open%20your%20course.");
  }

  if (!hasActiveAccess(accessRows, "reiki-rising-fall-2026")) {
    redirect("/account");
  }

  return (
    <main className="relative flex flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_18%_18%,rgba(231,198,170,0.6),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(196,205,188,0.38),transparent_24%),radial-gradient(circle_at_56%_8%,rgba(223,154,150,0.28),transparent_18%)]" />

      <section className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 pb-8 pt-16 sm:px-6 lg:grid-cols-[0.96fr_1.04fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Reiki Rising Fall 2026
          </span>
          <h1 className="display-page-title">
            Welcome to your student portal.
          </h1>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            This is your home for weekly modules, live call details, replays,
            materials, and the pieces that support your Reiki Rising journey.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={reikiRisingLiveCalls.meetHref}
              target="_blank"
              rel="noreferrer"
              className="button-pill"
            >
              Join Weekly Google Meet
            </Link>
            <Link
              href={reikiRisingGoogleCalendarHref}
              target="_blank"
              rel="noreferrer"
              className="button-pill"
            >
              Add Calls to Google Calendar
            </Link>
            <Link
              href={reikiRisingLiveCalls.calendarFileHref}
              className="button-pill"
            >
              Download Calendar File
            </Link>
            <Link href="/account" className="button-pill">
              Back to Student Portal
            </Link>
            <Link href="/contact" className="button-pill">
              Ask a Question
            </Link>
          </div>
        </div>

        <aside className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Cohort Details
          </span>
          <div className="grid gap-3 text-[var(--color-muted)]">
            <p>
              <strong className="text-[var(--color-text)]">Program:</strong>{" "}
              September 27 - December 5, 2026
            </p>
            <p>
              <strong className="text-[var(--color-text)]">Modules:</strong>{" "}
              Released on Sundays
            </p>
            <p>
              <strong className="text-[var(--color-text)]">Live calls:</strong>{" "}
              Wednesdays at 7:00 PM ET
            </p>
            <p>
              <strong className="text-[var(--color-text)]">Call time:</strong>{" "}
              7:00-8:15 PM ET
            </p>
            <p>
              <strong className="text-[var(--color-text)]">Dial in:</strong>{" "}
              {reikiRisingLiveCalls.dialIn}, PIN {reikiRisingLiveCalls.pin}
            </p>
            <p>
              <strong className="text-[var(--color-text)]">Telegram:</strong>{" "}
              Open through Saturday, December 5, 2026
            </p>
          </div>
        </aside>
      </section>

      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 pb-16 sm:px-6">
        <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Start Here
          </span>
          <h2 className="display-section-title">
            Prepare for the first week.
          </h2>
          <div className="mt-5 grid gap-4 text-[var(--color-muted)]">
            <p>
              Please purchase the Reiki Level 1 &amp; 2 textbook before the
              program begins. Make sure you select whether you want a hard copy,
              digital copy, or both.
            </p>
            <p>
              You may also want a special notebook or journal dedicated to your
              Reiki journey for reflections, practice notes, and questions.
            </p>
          </div>
          <div className="mt-6">
            <Link href={textbookHref} target="_blank" rel="noreferrer" className="button-pill">
              Purchase Textbook
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Weekly Modules
          </span>
          <h2 className="display-section-title">
            Move through each week in order.
          </h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {modules.map((module, index) => (
              <article
                key={module.date}
                className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(168,178,159,0.25)] text-[0.95rem] font-bold text-[var(--color-text)]">
                  {index + 1}
                </div>
                <span className="inline-block text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  {module.date}
                </span>
                <h2 className="mt-3 display-card-title">{module.title}</h2>
                <p className="mt-3 text-[var(--color-muted)]">
                  Module materials and replay links will appear here as they are
                  released.
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Live Support
            </span>
            <h2 className="display-section-title">
              Wednesdays at 7:00 PM ET.
            </h2>
            <ol className="mt-6 grid gap-3 text-[var(--color-muted)]">
              {liveCalls.map((call) => (
                <li key={call}>{call}</li>
              ))}
            </ol>
          </section>

          <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Certification
            </span>
            <h2 className="display-section-title">
              A meaningful Reiki 1 and Reiki 2 path.
            </h2>
            <ul className="mt-6 grid gap-3 text-[var(--color-muted)]">
              {certificationRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
            <p className="mt-5 text-[var(--color-muted)]">
              For each level, one additional group make-up placement is
              included. A personal private placement may be scheduled during
              office hours for $50 remotely or $75 in person.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
