import Link from "next/link";
import { signOutAction } from "@/app/login/actions";
import { PageShell } from "@/components/page-shell";
import { getCurrentUserWithAccess, hasActiveAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";

const portalSpaces = [
  {
    slug: "reiki-rising-fall-2026",
    title: "Reiki Rising Fall 2026",
    description:
      "Open your Fall 2026 cohort portal for weekly modules, live call details, replays, materials, and certification requirements.",
    href: "/library/reiki-rising-fall-2026",
    cta: "Enter Fall 2026 Portal",
  },
  {
    slug: "reiki-rising",
    title: "Reiki Rising",
    description:
      "Return to your class replays, downloadable materials, and the resources that support your Reiki Rising journey.",
    href: "/library/reiki-rising",
    cta: "Enter Reiki Rising",
  },
  {
    slug: "monthly-membership",
    title: "Monthly Membership",
    description:
      "Open your membership space for rituals, recordings, and the gentle support held there for you.",
    href: "/library/monthly-membership",
    cta: "Enter Membership",
  },
  {
    slug: "sound-training",
    title: "Sound Training",
    description:
      "Step into your protected sound training materials and the resources gathered for your learning.",
    href: "/library/sound-training",
    cta: "Enter Sound Training",
  },
] as const;

export default async function AccountPage() {
  const { user, accessRows } = await getCurrentUserWithAccess();
  const isAdmin = isAdminEmail(user?.email);

  return (
    <PageShell
      eyebrow="Student Portal"
      title="Welcome to your private portal."
      description="This is a quiet space to return to your Reiki Rising materials, recordings, downloads, and other protected resources."
    >
      {user ? (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div>
            <strong className="block text-[1.05rem] text-[var(--color-text)]">
              Signed in as {user.email}
            </strong>
            <p className="mt-2 text-[var(--color-muted)]">
              Your available spaces and course materials are ready below.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/reset-password" className="button-pill">
              Change Password
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="button-pill"
              >
                Sign Out
              </button>
            </form>
          </div>
        </section>
      ) : (
        <section className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Sign in to open your portal
          </strong>
          <p className="mt-3 text-[var(--color-muted)]">
            Sign in here to open your recordings, downloads, and other protected course materials.
          </p>
          <div className="mt-5">
            <Link
              href="/login"
              className="button-pill"
            >
              Go to Login
            </Link>
          </div>
        </section>
      )}

      {isAdmin ? (
        <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Admin Tools
          </span>
          <h2 className="display-section-title">
            Keep track of website activity.
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/event-attendance" className="button-pill">
              Event Attendance
            </Link>
            <Link href="/inquiries" className="button-pill">
              Website Inquiries
            </Link>
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Your Spaces
        </span>
        <h2 className="display-section-title">
          Open the spaces connected to your account.
        </h2>
        <p className="mt-4 max-w-[42rem] text-[var(--color-muted)]">
          If your email is connected to Reiki Rising or another protected offering, it will appear here for easy access.
        </p>

        {user ? (
          accessRows.length > 0 ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {portalSpaces
                .filter((space) => hasActiveAccess(accessRows, space.slug))
                .map((space) => (
                  <article
                    key={space.slug}
                    className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6"
                  >
                    <strong className="block text-[1.08rem] text-[var(--color-text)]">
                      {space.title}
                    </strong>
                    <p className="mt-3 text-[var(--color-muted)]">
                      {space.description}
                    </p>
                    <div className="mt-5">
                      <Link href={space.href} className="button-pill">
                        {space.cta}
                      </Link>
                    </div>
                  </article>
                ))}
            </div>
          ) : (
            <p className="mt-6 rounded-[22px] bg-[rgba(255,248,242,0.86)] px-5 py-4 text-[var(--color-muted)]">
              There are no active spaces connected to this account just yet.
            </p>
          )
        ) : null}
      </section>

    </PageShell>
  );
}
