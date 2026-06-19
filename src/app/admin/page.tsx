import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";

const adminTools = [
  {
    title: "Event Attendance",
    description:
      "See completed Stripe event purchases grouped into attendance lists.",
    href: "/event-attendance",
  },
  {
    title: "Website Inquiries",
    description:
      "Review recent contact, mentorship, and email update form submissions.",
    href: "/inquiries",
  },
] as const;

export default async function AdminPage() {
  const { user } = await getCurrentUserWithAccess();

  if (!user?.email) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/account");
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Website admin tools."
      description="A private starting place for the website lists and messages you need to check most often."
    >
      <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
        <strong className="block text-[1.05rem] text-[var(--color-text)]">
          Signed in as {user.email}
        </strong>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {adminTools.map((tool) => (
            <article
              key={tool.href}
              className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6"
            >
              <h2 className="text-[1.2rem] font-semibold text-[var(--color-text)]">
                {tool.title}
              </h2>
              <p className="mt-3 text-[var(--color-muted)]">
                {tool.description}
              </p>
              <div className="mt-5">
                <Link href={tool.href} className="button-pill">
                  Open {tool.title}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
