import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserWithAccess, hasActiveAccess } from "@/lib/member-access";

const memberSections = [
  {
    title: "Grounding Practices",
    description:
      "A place for calming rituals, meditations, and resources members can revisit as part of a steady healing rhythm.",
  },
  {
    title: "Monthly Reflections",
    description:
      "Prompts, teachings, and seasonal themes that keep the membership feeling alive and intentionally guided.",
  },
  {
    title: "Exclusive Releases",
    description:
      "Future recordings, bonuses, or intimate offerings that give members a reason to stay engaged over time.",
  },
] as const;

export default async function MonthlyMembershipLibraryPage() {
  const { user, accessRows } = await getCurrentUserWithAccess();

  if (!user) {
    redirect("/login?error=Please%20sign%20in%20to%20open%20your%20membership.");
  }

  if (!hasActiveAccess(accessRows, "monthly-membership")) {
    redirect("/account");
  }

  return (
    <main className="relative flex flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(221,202,183,0.7),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(168,178,159,0.35),_transparent_28%)]" />

      <section className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 pb-8 pt-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Monthly Membership Library
          </span>
          <h1 className="display-page-title">
            Welcome to your recurring support space.
          </h1>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            This is the protected area for your membership. It can grow into a
            full library of resources, reflections, audio practices, and member-only updates.
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
        <div className="grid gap-5 lg:grid-cols-3">
          {memberSections.map((section) => (
            <article
              key={section.title}
              className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
            >
              <h2 className="display-card-title">
                {section.title}
              </h2>
              <p className="mt-4 text-[var(--color-muted)]">{section.description}</p>
            </article>
          ))}
        </div>

        <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Access Check
          </span>
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Signed in as {user.email}
          </strong>
          <p className="mt-3 text-[var(--color-muted)]">
            This page is only available because your account has an active
            `monthly-membership` access row in Supabase.
          </p>
        </section>
      </section>
    </main>
  );
}
