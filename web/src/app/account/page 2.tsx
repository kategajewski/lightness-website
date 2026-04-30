import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { featuredCourses, featuredMemberships } from "@/lib/offers";

export default function AccountPage() {
  return (
    <PageShell
      eyebrow="Member Area"
      title="A calm, branded space for courses, subscriptions, and private resources."
      description="This is the foundation for your future customer dashboard. Once Supabase auth and Stripe webhooks are connected, access can be granted automatically after purchase."
    >
      <section className="grid gap-6 rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-display text-[clamp(2.3rem,5vw,3.6rem)] leading-[0.98] tracking-[-0.02em]">
            Your portal can hold paid learning, recurring support, and client resources together.
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">
            Instead of sending people into a separate, branded-off experience,
            the new portal can feel like a seamless continuation of the website.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[22px] bg-[rgba(255,248,242,0.86)] p-5">
            <strong className="block text-[1.02rem]">What members will see</strong>
            <ul className="mt-3 grid gap-2 text-[var(--color-muted)]">
              <li>Course library with unlocked lessons</li>
              <li>Membership-only rituals, recordings, and updates</li>
              <li>Account details and billing links</li>
              <li>Support links for booking and contact</li>
            </ul>
          </div>
          <div className="rounded-[22px] bg-[rgba(255,248,242,0.86)] p-5">
            <strong className="block text-[1.02rem]">What still gets connected</strong>
            <ul className="mt-3 grid gap-2 text-[var(--color-muted)]">
              <li>Supabase authentication</li>
              <li>Stripe purchase-to-access rules</li>
              <li>Password reset and account emails</li>
              <li>Optional video/file hosting strategy</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {[...featuredCourses, ...featuredMemberships].map((offer) => (
          <article
            key={offer.slug}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {offer.category}
            </span>
            <h3 className="mt-3 font-display text-[2rem] leading-[0.98] tracking-[-0.02em]">
              {offer.name}
            </h3>
            <p className="mt-3 text-[var(--color-muted)]">{offer.detail}</p>
            <Link
              href={offer.href}
              className="mt-5 inline-flex items-center justify-center rounded-full border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.86)] px-6 py-4 text-[0.95rem] font-bold"
            >
              View Checkout Page
            </Link>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
