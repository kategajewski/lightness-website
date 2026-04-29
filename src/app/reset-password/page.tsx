import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <PageShell
      eyebrow="Set New Password"
      title="Choose a new password for your member account."
      description="Open this page from the email link Supabase sends you. Once you arrive here, you can set a fresh password and return to the member login."
    >
      <section className="grid gap-6 rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Reset Access
          </span>
          <h2 className="font-display text-[clamp(2.3rem,5vw,3.5rem)] leading-[0.98] tracking-[-0.02em]">
            Create a new password and get back into your account.
          </h2>
          <p className="mt-4 max-w-[36rem] text-[var(--color-muted)]">
            If this page is opened from the recovery email link, Supabase will
            let you update the password securely here.
          </p>
          <p className="mt-4 max-w-[36rem] text-[var(--color-muted)]">
            If you see an auth-session error here, request a fresh reset link and
            open the newest email.
          </p>
          <div className="mt-6">
            <Link href="/login" className="font-bold text-[#5d5148]">
              Back to login
            </Link>
          </div>
        </div>

        <ResetPasswordForm />
      </section>
    </PageShell>
  );
}
