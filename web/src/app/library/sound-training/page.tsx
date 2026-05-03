import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserWithAccess, hasActiveAccess } from "@/lib/member-access";

const modules = [
  {
    title: "Module 1: Foundations of Sound Healing",
    summary:
      "Introduce the energetic principles, practitioner mindset, and grounded philosophy behind sound-based healing work.",
  },
  {
    title: "Module 2: Instruments, Presence, and Practice",
    summary:
      "Explore the use of sound tools, pacing, listening, and the practitioner presence that shapes the session experience.",
  },
  {
    title: "Module 3: Holding Space for Sessions",
    summary:
      "Learn how to structure private or group experiences with safety, intention, boundaries, and trust.",
  },
  {
    title: "Module 4: Integration and Professional Development",
    summary:
      "Support students in integrating the work, refining facilitation, and bringing sound healing into their practice.",
  },
] as const;

export default async function SoundTrainingLibraryPage() {
  const { user, accessRows } = await getCurrentUserWithAccess();

  if (!user) {
    redirect("/login?error=Please%20sign%20in%20to%20open%20your%20course.");
  }

  if (!hasActiveAccess(accessRows, "sound-training")) {
    redirect("/account");
  }

  return (
    <main className="relative flex flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(221,202,183,0.7),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(168,178,159,0.35),_transparent_28%)]" />

      <section className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 pb-8 pt-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Sound Training Attendee Resources
          </span>
          <h1 className="display-page-title">
            Welcome to your Sound Training resource space.
          </h1>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            Because this offer is really a live training, this protected area is
            better treated as an attendee resource hub for follow-up materials,
            notes, recordings, and integration support after the event.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/account"
              className="button-pill"
            >
              Back to Member Area
            </Link>
            <Link
              href="/contact"
              className="button-pill"
            >
              Ask a Question
            </Link>
          </div>
        </div>

        <div
          className="min-h-[460px] rounded-[32px] bg-cover bg-center shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(76,58,48,0.08), rgba(76,58,48,0.22)), url('https://storage.googleapis.com/msgsndr/UjW44wJD5eUk7BCDEe2Z/media/68353a2d66829df7dc8f202e.webp')",
          }}
        />
      </section>

      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 pb-16 sm:px-6">
        <div className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Resource Roadmap
          </span>
          <div className="grid gap-5 lg:grid-cols-2">
            {modules.map((module, index) => (
              <article
                key={module.title}
                className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(168,178,159,0.25)] text-[0.95rem] font-bold text-[var(--color-text)]">
                  {index + 1}
                </div>
                <h2 className="display-card-title">
                  {module.title}
                </h2>
                <p className="mt-3 text-[var(--color-muted)]">
                  {module.summary}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              What Comes Next
            </span>
            <h2 className="display-section-title">
              This can support the live training without pretending it is a self-paced course.
            </h2>
            <ul className="mt-5 grid gap-3 text-[var(--color-muted)]">
              <li>Downloadable practice resources and worksheets</li>
              <li>Welcome notes and attendee preparation details</li>
              <li>Optional recordings or integration prompts</li>
              <li>Follow-up materials after the live training</li>
            </ul>
          </section>

          <aside className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Access Check
            </span>
            <strong className="block text-[1.08rem]">
              Signed in as {user.email}
            </strong>
            <p className="mt-3 text-[var(--color-muted)]">
              This page is only available because your account has an active
              `sound-training` access row in Supabase.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
