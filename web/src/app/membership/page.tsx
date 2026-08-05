import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({ title: "Monthly Rest & Reset Healing Membership", description: "Receive one Rest & Receive energy healing session each month, ongoing support, member savings, and a steady rhythm of restorative care.", path: "/membership", image: "/homepage-images/ghl-healing-session.webp" });

const membershipFeatures = [
  "One Rest & Receive session each month",
  "Automatic monthly payment of $130 instead of $140",
  "10% off all additional services",
  "A minimum 3-month commitment before canceling",
] as const;

const membershipTerms = [
  "$130 automatic monthly payment for one Rest & Receive session each month",
  "Unused sessions may roll over, with up to 2 sessions held at a time",
  "Includes 10% off additional private 1:1 services only",
  "Membership is non-transferable",
  "3-month minimum commitment before canceling",
  "Membership may be paused with one month's notice",
] as const;

export default function MembershipPage() {
  return (
    <PageShell
      eyebrow="Monthly Membership"
      title="A monthly Rest & Reset membership for ongoing support."
      description="A simple recurring membership for clients who want steady care, monthly healing, and a more supported path back to themselves."
    >
      <section className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Monthly Rest & Reset
          </span>
          <h2 className="display-section-title">
            Ongoing healing support with built-in savings and a steady rhythm of care.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            This membership is designed for those who want to make healing a
            regular part of their life. Each month includes one Rest & Receive
            session, an automatic discounted rate, and added savings on any
            other services you book along the way.
          </p>
          <ul className="mt-8 grid gap-3 text-[var(--color-muted)]">
            {membershipFeatures.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <form action="/api/checkout" method="post">
              <input type="hidden" name="slug" value="monthly-membership" />
              <button type="submit" className="button-pill">
                Join Monthly Membership
              </button>
            </form>
            <Link
              href={site.links.services}
              className="button-pill"
            >
              Explore Healing Sessions
            </Link>
          </div>
        </div>

        <div
          className="min-h-[560px] rounded-[32px] bg-cover bg-center shadow-[0_24px_80px_rgba(59,41,31,0.08)] max-md:min-h-[420px]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(76,58,48,0.08), rgba(76,58,48,0.22)), url('/homepage-images/ghl-healing-session.webp')",
          }}
        />
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Membership Details
          </span>
          <h2 className="display-section-title">
            A grounded monthly rhythm of care, savings, and support.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Monthly Rest & Reset is for clients who want healing to feel steady
            and sustainable. It offers one monthly session, simple savings, and
            a clear path for staying connected to the work over time.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Membership Terms
          </strong>
          <ul className="mt-4 grid gap-3 text-[var(--color-muted)]">
            {membershipTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
