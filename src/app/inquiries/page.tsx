import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";

type ContactInquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  inquiry_type: string;
  message: string;
  status: string;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function InquiriesPage() {
  const { user } = await getCurrentUserWithAccess();

  if (!user?.email) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/account");
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("contact_inquiries")
    .select("id, name, email, phone, inquiry_type, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const inquiries = (data ?? []) as ContactInquiryRow[];

  return (
    <PageShell
      eyebrow="Private Inbox"
      title="Website inquiries in one calm place."
      description="This private page pulls your latest contact form submissions from Supabase so you do not have to open the database every time someone reaches out."
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
        <div>
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Signed in as {user.email}
          </strong>
          <p className="mt-2 text-[var(--color-muted)]">
            Inquiry notifications can be layered on later, but the messages are already being captured here.
          </p>
        </div>
        <Link
          href="/account"
          className="button-pill"
        >
          Back to Account
        </Link>
      </section>

      <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Contact Form Inbox
            </span>
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.3rem)] leading-[0.98] tracking-[-0.02em]">
              Latest submissions
            </h2>
          </div>
          <p className="text-[var(--color-muted)]">
            Showing the most recent {inquiries.length} inquiries.
          </p>
        </div>

        {inquiries.length > 0 ? (
          <div className="mt-8 grid gap-5">
            {inquiries.map((inquiry) => (
              <article
                key={inquiry.id}
                className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <strong className="block text-[1.05rem] text-[var(--color-text)]">
                      {inquiry.name}
                    </strong>
                    <p className="mt-2 text-[var(--color-muted)]">
                      {inquiry.email}
                      {inquiry.phone ? ` • ${inquiry.phone}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-[0.92rem] text-[var(--color-muted)]">
                    <p className="font-semibold capitalize text-[var(--color-text)]">
                      {inquiry.inquiry_type.replaceAll("-", " ")}
                    </p>
                    <p className="mt-1">Status: {inquiry.status}</p>
                    <p className="mt-1">{formatDate(inquiry.created_at)}</p>
                  </div>
                </div>
                <p className="mt-5 whitespace-pre-line text-[var(--color-text)]">
                  {inquiry.message}
                </p>
                <div className="mt-5">
                  <a
                    href={`mailto:${inquiry.email}?subject=${encodeURIComponent("Re: your inquiry with The Lightness of Being")}`}
                    className="button-pill"
                  >
                    Reply by Email
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-[24px] bg-[rgba(255,248,242,0.86)] px-6 py-5 text-[var(--color-muted)]">
            No inquiries have come through yet.
          </p>
        )}
      </section>
    </PageShell>
  );
}
