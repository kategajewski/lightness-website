import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasActiveAccess, getCurrentUserWithAccess } from "@/lib/member-access";

const courseWeeks = [
  {
    title: "Week 1 · April 1, 2026",
    focus: "What Is Reiki? The Science Behind Reiki and Its History",
    summary:
      "Begin with the foundations of Reiki, including what Reiki is, how it is understood, and the history that supports this practice.",
    href: "https://drive.google.com/file/d/1BUnwcKm6O8Q7KeGrLlaYTF6vGNys5znf/view?usp=sharing",
  },
  {
    title: "Week 2 · April 8, 2026",
    focus: "Energy Anatomy: The Chakras, Meridians, and Aura",
    summary:
      "Explore the energetic body more deeply through the chakras, meridians, and aura, and begin building a stronger relationship with subtle energy.",
    href: "https://drive.google.com/file/d/1_UxHS3sKQjcUnIIlnP7XN1pYSuB4d66L/view?usp=sharing",
  },
  {
    title: "Week 3 · April 15, 2026",
    focus: "Grounding, Shielding, and the Ocean of Holy Love Experience",
    summary:
      "Strengthen your energetic foundation through grounding and shielding practices, and receive the Ocean of Holy Love Experience as part of your healing journey.",
    href: "https://drive.google.com/file/d/1rSRx5NbmW_Tdvo7x6cKURcIBSZATHUaR/view?usp=sharing",
  },
  {
    title: "Week 4 · April 22, 2026",
    focus: "The Three Pillars of Reiki, Self-Reiki, and Level 1 Placement",
    summary:
      "Learn the Three Pillars of Reiki, deepen into self-Reiki practice, and receive your Level 1 placement as you begin embodying the work more fully.",
    href: "https://drive.google.com/file/d/1sVSugV8LEGj3yWely8NP1KW-FEgOHT7m/view?usp=sharing",
  },
  {
    title: "Week 5",
    focus: "How to Share Reiki with Others & Self-Reiki Practice",
    summary:
      "Continue building confidence with self-Reiki while learning how to share Reiki with others in a grounded and respectful way.",
    href: "https://drive.google.com/file/d/16xmSRPgAoQuxEnNCKB7qgJxn5cyCv_dE/view?usp=sharing",
  },
] as const;

const downloads = [
  {
    title: "Holy Fire III Reiki Level 1 Manual",
    href: "/reiki-rising/ReikiLevel1TrainingFinalPDF.pdf",
  },
  {
    title: "Holy Fire III Reiki Level 2 Manual",
    href: "/reiki-rising/ReikiLevel2TrainingLuxuryPrintable.pdf",
  },
] as const;

export default async function ReikiRisingLibraryPage() {
  const { user, accessRows } = await getCurrentUserWithAccess();

  if (!user) {
    redirect("/login?error=Please%20sign%20in%20to%20open%20your%20course.");
  }

  if (!hasActiveAccess(accessRows, "reiki-rising")) {
    redirect("/account");
  }

  return (
    <main className="relative flex flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_18%_18%,rgba(231,198,170,0.6),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(196,205,188,0.38),transparent_24%),radial-gradient(circle_at_56%_8%,rgba(223,154,150,0.28),transparent_18%)]" />

      <section className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 pb-8 pt-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Reiki Rising Library
          </span>
          <h1 className="display-page-title">
            Welcome to your Reiki Rising course space.
          </h1>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            This portal is a space to hold your class replays, PDFs, course materials, and future lesson content in one calm, organized place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/account"
              className="button-pill"
            >
              Back to Student Portal
            </Link>
            <Link
              href="/contact"
              className="button-pill"
            >
              Ask a Question
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,248,242,0.78)] p-4 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto max-w-[16rem] sm:max-w-[18rem] lg:max-w-[20rem]">
            <Image
              src="/homepage-images/reiki-rising-portal-sunsethandsup.jpeg"
              alt="Kate in a reflective sunset moment with her hands lifted."
              width={1200}
              height={1500}
              className="h-auto w-full rounded-[26px] object-contain"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 pb-16 sm:px-6">
        <div className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Course Journey
          </span>
          <h2 className="display-section-title">
            Move through each week in order, and return to the replay whenever you need it.
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {courseWeeks.map((week, index) => (
              <article
                key={week.title}
                className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(168,178,159,0.25)] text-[0.95rem] font-bold text-[var(--color-text)]">
                  {index + 1}
                </div>
                <span className="inline-block text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  {week.title}
                </span>
                <h2 className="mt-3 display-card-title">
                  {week.focus}
                </h2>
                <p className="mt-3 text-[var(--color-muted)]">
                  {week.summary}
                </p>
                <div className="mt-5">
                  <Link
                    href={week.href}
                    target="_blank"
                    rel="noreferrer"
                    className="button-pill"
                  >
                    Watch Class Replay
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <aside className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Student Portal
            </span>
            <strong className="block text-[1.08rem]">
              Signed in as {user.email}
            </strong>
            <p className="mt-3 text-[var(--color-muted)]">
              This space is protected for students with active Reiki Rising access.
            </p>
          </aside>
        </div>

        <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Downloads
          </span>
          <h2 className="display-section-title">
            Keep your manuals and class materials close by.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            These downloads are here for easy reference as you move through the course and return to the teachings.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {downloads.map((download) => (
              <article
                key={download.title}
                className="rounded-[22px] bg-[rgba(255,248,242,0.86)] p-5"
              >
                <strong className="block text-[1.02rem] text-[var(--color-text)]">
                  {download.title}
                </strong>
                <div className="mt-4">
                  <Link
                    href={download.href}
                    target="_blank"
                    rel="noreferrer"
                    className="button-pill"
                  >
                    Open PDF
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
