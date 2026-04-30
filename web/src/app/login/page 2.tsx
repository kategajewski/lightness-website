import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { integrations } from "@/lib/env";
import { site } from "@/lib/site";

export default function LoginPage() {
  return (
    <PageShell
      eyebrow="Member Login"
      title="Your new member portal is being prepared."
      description="We can build the full login flow now and connect Supabase authentication as soon as you share the project credentials."
    >
      <section className="grid gap-6 rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h2 className="font-display text-[clamp(2.3rem,5vw,3.5rem)] leading-[0.98] tracking-[-0.02em]">
            The shell is here. Authentication gets plugged in next.
          </h2>
          <p className="mt-4 max-w-[36rem] text-[var(--color-muted)]">
            Right now this page is acting as the future home for customer login,
            password reset, and member access. Once Supabase is connected, this
            becomes the real entry point for courses and subscriptions.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Current status
          </strong>
          <p className="mt-3 text-[var(--color-muted)]">
            {integrations.supabase
              ? "Supabase credentials are connected. We can wire the real login flow next."
              : "Supabase credentials are not connected yet, so this remains a staged login page for now."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={site.links.account}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#5f5048,#453933)] px-6 py-4 text-[0.95rem] font-bold text-[#fffaf5]"
            >
              Preview Member Area
            </Link>
            <Link
              href="https://portal.bethelightness.com"
              className="inline-flex items-center justify-center rounded-full border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.86)] px-6 py-4 text-[0.95rem] font-bold"
            >
              Open Current Portal
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
