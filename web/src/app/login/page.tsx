import Link from "next/link";
import { signInAction } from "@/app/login/actions";
import { PageShell } from "@/components/page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createSupabaseServerClient();
  const [{ data: userResult }, params] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ]);
  const error = params?.error;

  return (
    <PageShell
      eyebrow="Portal Login"
      title="Sign in to your private student and member portal."
      description="Use this space to access Reiki Rising materials, membership resources, replay links, downloads, and other protected content."
    >
      <section className="grid gap-6 rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-display text-[clamp(2.3rem,5vw,3.5rem)] leading-[0.98] tracking-[-0.02em]">
            A calm place to return to your learning and resources.
          </h2>
          <p className="mt-4 max-w-[36rem] text-[var(--color-muted)]">
            This portal is a simple home for course materials, replay links, PDFs, and other protected resources, all gathered in one place.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] bg-[rgba(255,248,242,0.86)] p-5">
              <strong className="block text-[1.02rem] text-[var(--color-text)]">
                Reiki Rising students
              </strong>
              <p className="mt-2 text-[var(--color-muted)]">
                Access your class replays, course materials, and downloadable resources.
              </p>
            </div>
            <div className="rounded-[22px] bg-[rgba(255,248,242,0.86)] p-5">
              <strong className="block text-[1.02rem] text-[var(--color-text)]">
                Members and future trainings
              </strong>
              <p className="mt-2 text-[var(--color-muted)]">
                This same login can also hold membership resources, future trainings, and other private spaces as they are added.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          {userResult.user ? (
            <>
              <strong className="block text-[1.05rem] text-[var(--color-text)]">
                You&apos;re already signed in
              </strong>
              <p className="mt-3 text-[var(--color-muted)]">
                Signed in as {userResult.user.email}.
              </p>
              <div className="mt-6">
                <Link href="/account" className="button-pill">
                  Open Your Portal
                </Link>
              </div>
            </>
          ) : (
            <>
              <strong className="block text-[1.05rem] text-[var(--color-text)]">
                Sign in with your email and password
              </strong>
              <p className="mt-3 text-[var(--color-muted)]">
                Use the same email connected to your enrollment, membership, or other active access.
              </p>
              {error ? (
                <p className="mt-4 rounded-[18px] border border-[rgba(160,95,88,0.18)] bg-[rgba(201,167,156,0.18)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
                  {error}
                </p>
              ) : null}
              <form action={signInAction} className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                    Password
                  </span>
                  <input
                    type="password"
                    name="password"
                    required
                    className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
                  />
                </label>
                <button type="submit" className="button-pill mt-2">
                  Sign In
                </button>
              </form>
              <div className="mt-5">
                <Link href="/forgot-password" className="font-bold text-[#5d5148]">
                  Forgot your password?
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
