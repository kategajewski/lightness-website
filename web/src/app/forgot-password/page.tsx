import Link from "next/link";
import { requestPasswordResetAction } from "@/app/login/actions";
import { PageShell } from "@/components/page-shell";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const status = params?.status;
  const message = params?.message;

  return (
    <PageShell
      eyebrow="Password Reset"
      title="Reset your password and get back into your account."
      description="Use the email address connected to your member account and we’ll send you a reset link through Supabase."
    >
      <section className="grid gap-6 rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Account Recovery
          </span>
          <h2 className="display-section-title">
            We&apos;ll send you a secure link to choose a new password.
          </h2>
          <p className="mt-4 max-w-[36rem] text-[var(--color-muted)]">
            This uses Supabase&apos;s built-in recovery flow, so it fits the account
            system you already have without relying on GoHighLevel.
          </p>
        </div>

        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          {status === "success" ? (
            <p className="rounded-[18px] border border-[rgba(124,163,130,0.22)] bg-[rgba(168,178,159,0.22)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              Reset link sent. Check your email and open the link to set a new password.
            </p>
          ) : null}

          {status === "error" ? (
            <p className="rounded-[18px] border border-[rgba(160,95,88,0.18)] bg-[rgba(201,167,156,0.18)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              {message ?? "There was a problem sending the reset email."}
            </p>
          ) : null}

          <form action={requestPasswordResetAction} className="mt-6 grid gap-4">
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

            <button
              type="submit"
              className="button-pill"
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-5">
            <Link href="/login" className="font-bold text-[#5d5148]">
              Back to login
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
