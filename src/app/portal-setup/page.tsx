import Link from "next/link";
import { PageShell } from "@/components/page-shell";

type PortalSetupPageProps = {
  searchParams?: Promise<{
    token?: string;
    type?: string;
    next?: string;
    status?: string;
  }>;
};

export default async function PortalSetupPage({
  searchParams,
}: PortalSetupPageProps) {
  const params = await searchParams;
  const token = params?.token;
  const type = params?.type ?? "recovery";
  const next = params?.next ?? "/create-password";
  const isExpired = params?.status === "expired";
  const isReady = Boolean(token) && !isExpired;

  return (
    <PageShell
      eyebrow="Student Portal"
      title={isReady ? "Your secure setup link is ready." : "Let’s get you a fresh portal link."}
      description={
        isReady
          ? "Continue when you are ready to choose your private portal password."
          : "Portal links are protected and can only be used once. Request a fresh link below."
      }
    >
      <section className="mx-auto max-w-[46rem] rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-8 text-center shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        {isReady ? (
          <>
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              One More Step
            </span>
            <h2 className="display-section-title">
              Continue to create your password.
            </h2>
            <p className="mx-auto mt-5 max-w-[38rem] leading-7 text-[var(--color-muted)]">
              This confirmation step protects your one-time link from automated
              email security checks. Your link will not be used until you press
              the button below.
            </p>
            <form action="/portal-setup/continue" method="post" className="mt-8">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="next" value={next} />
              <button type="submit" className="button-pill">
                Continue to Create Password
              </button>
            </form>
          </>
        ) : (
          <>
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Fresh Link Needed
            </span>
            <h2 className="display-section-title">
              This link has expired or was already used.
            </h2>
            <p className="mx-auto mt-5 max-w-[38rem] leading-7 text-[var(--color-muted)]">
              Request a new link using the email address connected to your
              enrollment. Only the newest portal email should be used.
            </p>
            <div className="mt-8">
              <Link href="/forgot-password" className="button-pill">
                Request a Fresh Link
              </Link>
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}
