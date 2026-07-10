import Link from "next/link";
import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";
import { PageShell } from "@/components/page-shell";

export default function CreatePasswordPage() {
  return (
    <PageShell
      eyebrow="Portal Setup"
      title="Create your password for the student portal."
      description="Use the setup link from your welcome email to choose your password and enter your protected Reiki Rising course space."
    >
      <section className="grid gap-6 rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Student Access
          </span>
          <h2 className="display-section-title">
            Choose a password for your Lightness portal.
          </h2>
          <p className="mt-4 max-w-[36rem] text-[var(--color-muted)]">
            Once your password is created, use your email and password to return
            to your Reiki Rising materials anytime.
          </p>
          <p className="mt-4 max-w-[36rem] text-[var(--color-muted)]">
            If this setup link has already been opened or has expired, use
            Forgot Password from the login page to send yourself a fresh link.
          </p>
          <div className="mt-6">
            <Link href="/login" className="font-bold text-[#5d5148]">
              Back to login
            </Link>
          </div>
        </div>

        <ResetPasswordForm mode="setup" />
      </section>
    </PageShell>
  );
}
