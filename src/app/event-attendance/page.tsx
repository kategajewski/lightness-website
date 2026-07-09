import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { activeEventSlugs, getEventBySlug } from "@/lib/events";
import { isAdminEmail } from "@/lib/site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type EventAttendanceRow = {
  id: string;
  event_slug: string;
  event_name: string;
  customer_name: string | null;
  customer_email: string | null;
  amount_total: number | null;
  currency: string | null;
  payment_status: string | null;
  stripe_session_id: string;
  purchased_at: string;
};

// Keep archived/past event lists out of the current admin roster.
const hiddenRosterEventSlugs = new Set<string>(["reiki-share-july-1-2026"]);
const rosterEventSlugs = activeEventSlugs.filter(
  (slug) => !hiddenRosterEventSlugs.has(slug),
);

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAmount(amount: number | null, currency: string | null) {
  if (amount == null || !currency) {
    return "Amount unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function getEventDateLabel(eventSlug: string) {
  const event = getEventBySlug(eventSlug);
  const dateLine = event?.emailDetailLines.find((line) =>
    line.toLowerCase().startsWith("date:"),
  );

  return dateLine?.replace(/^date:\s*/i, "") ?? null;
}

function getRosterEventTitle(eventSlug: string, fallbackName?: string | null) {
  const event = getEventBySlug(eventSlug);
  const eventName = event?.name || fallbackName || eventSlug;
  const dateLabel = getEventDateLabel(eventSlug);

  return dateLabel ? `${eventName} - ${dateLabel}` : eventName;
}

export default async function EventAttendancePage() {
  const { user } = await getCurrentUserWithAccess();

  if (!user?.email) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/account");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("event_attendance")
    .select(
      "id, event_slug, event_name, customer_name, customer_email, amount_total, currency, payment_status, stripe_session_id, purchased_at",
    )
    .in("event_slug", rosterEventSlugs)
    .order("purchased_at", { ascending: false })
    .limit(300);

  const attendees = (data ?? []) as EventAttendanceRow[];
  const groupedAttendees = attendees.reduce<Record<string, EventAttendanceRow[]>>(
    (groups, attendee) => {
      const key = attendee.event_slug || attendee.event_name;
      groups[key] = [...(groups[key] ?? []), attendee];
      return groups;
    },
    {},
  );

  return (
    <PageShell
      eyebrow="Event Attendance"
      title="A clear list of who bought tickets."
      description="This private page collects completed Stripe event purchases so each upcoming gathering has a clean attendance list."
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
        <div>
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Signed in as {user.email}
          </strong>
          <p className="mt-2 text-[var(--color-muted)]">
            Showing completed event purchases recorded from Stripe checkout.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/inquiries" className="button-pill">
            View Inquiries
          </Link>
          <Link href="/account" className="button-pill">
            Back to Account
          </Link>
        </div>
      </section>

      {error ? (
        <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <h2 className="display-section-title">Attendance table is not ready yet.</h2>
          <p className="mt-4 text-[var(--color-muted)]">
            The page is built, but Supabase still needs the{" "}
            <code>event_attendance</code> table before purchases can appear here.
          </p>
        </section>
      ) : null}

      {!error && attendees.length === 0 ? (
        <section className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <h2 className="display-section-title">No event purchases yet.</h2>
          <p className="mt-4 text-[var(--color-muted)]">
            Once someone completes an event checkout through Stripe, their name and email will appear here.
          </p>
        </section>
      ) : null}

      {!error
        ? Object.entries(groupedAttendees).map(([eventSlug, rows]) => (
            <section
              key={eventSlug}
              className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    {rows.length} ticket{rows.length === 1 ? "" : "s"}
                  </span>
                  <h2 className="display-section-title">
                    {getRosterEventTitle(eventSlug, rows[0]?.event_name)}
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {rows.map((attendee) => (
                  <article
                    key={attendee.id}
                    className="rounded-[22px] bg-[rgba(255,248,242,0.86)] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <strong className="block text-[1.03rem] text-[var(--color-text)]">
                          {attendee.customer_name || "Name not provided"}
                        </strong>
                        <p className="mt-2 text-[var(--color-muted)]">
                          {attendee.customer_email || "Email not provided"}
                        </p>
                      </div>
                      <div className="text-right text-[0.92rem] text-[var(--color-muted)]">
                        <p className="font-semibold capitalize text-[var(--color-text)]">
                          {attendee.payment_status ?? "unknown"}
                        </p>
                        <p className="mt-1">
                          {formatAmount(attendee.amount_total, attendee.currency)}
                        </p>
                        <p className="mt-1">{formatDate(attendee.purchased_at)}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-[0.9rem] text-[var(--color-muted)]">
                      Stripe session: {attendee.stripe_session_id}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))
        : null}
    </PageShell>
  );
}
