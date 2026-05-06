import Link from "next/link";
import { submitEmailSignup } from "@/app/email-updates/actions";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const updateOptions = [
  {
    value: "events",
    label: "Monthly events",
    description: "Community gatherings, readings, sound journeys, and seasonal rituals.",
  },
  {
    value: "yoga",
    label: "Yoga classes",
    description: "Weekly class schedule updates, special classes, and gentle movement offerings.",
  },
  {
    value: "reiki",
    label: "Reiki trainings",
    description: "Reiki Rising cohorts, Level 1 and Level 2 education, and training announcements.",
  },
  {
    value: "sound",
    label: "Sound healing and sound training",
    description: "Sound baths, private sound offerings, and practitioner training news.",
  },
  {
    value: "ceremonies",
    label: "Private sessions and ceremonies",
    description: "Private healing sessions, group experiences, blessings, and custom ceremonies.",
  },
  {
    value: "membership",
    label: "Membership and Reiki Rising updates",
    description: "Monthly membership notes and student portal/course updates.",
  },
] as const;

type EmailUpdatesPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function EmailUpdatesPage({
  searchParams,
}: EmailUpdatesPageProps) {
  const params = await searchParams;
  const status = params?.status;
  const message = params?.message;

  return (
    <PageShell
      eyebrow="Email Updates"
      title="Email updates."
      description="Stay connected with events, yoga classes, trainings, sound healing, private ceremonies, and the offerings that feel relevant to you."
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <form
          action={submitEmailSignup}
          className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.9),rgba(239,229,217,0.86))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10"
        >
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Choose Your Updates
          </span>

          {status === "success" ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(124,163,130,0.22)] bg-[rgba(168,178,159,0.22)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              You are on the email update list. Thank you for staying connected.
            </p>
          ) : null}

          {status === "error" ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(160,95,88,0.18)] bg-[rgba(201,167,156,0.18)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              {message ?? "There was a problem joining the email list."}
            </p>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Name
              </span>
              <input
                type="text"
                name="name"
                required
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>

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
          </div>

          <fieldset className="mt-6 grid gap-3">
            <legend className="mb-1 text-[0.92rem] font-medium text-[var(--color-text)]">
              What would you like to hear about?
            </legend>

            <div className="grid gap-3">
              {updateOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex gap-3 rounded-[20px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.72)] p-4 text-[var(--color-muted)]"
                >
                  <input
                    type="checkbox"
                    name="preferences"
                    value={option.value}
                    className="mt-1 h-4 w-4 accent-[#5d5148]"
                  />
                  <span>
                    <strong className="block text-[var(--color-text)]">
                      {option.label}
                    </strong>
                    <span className="mt-1 block text-[0.92rem] leading-relaxed">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 flex gap-3 rounded-[20px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.72)] p-4 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
            <input
              type="checkbox"
              name="consent"
              value="yes"
              required
              className="mt-1 h-4 w-4 accent-[#5d5148]"
            />
            <span>
              Yes, I would like to receive email updates from The Lightness of
              Being. I understand I can unsubscribe at any time.
            </span>
          </label>

          <button type="submit" className="button-pill mt-6">
            Join Email Updates
          </button>
        </form>

        <aside className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Gentle Inbox Energy
          </span>
          <h2 className="display-section-title">
            Receive only the updates you actually want.
          </h2>
          <p className="mt-5 text-[var(--color-muted)]">
            This list is here so you can choose what feels supportive, without
            being overwhelmed by every single offering.
          </p>
          <p className="mt-4 text-[var(--color-muted)]">
            You can use it for upcoming event reminders, yoga schedule shifts,
            new training rounds, private ceremony announcements, and membership
            updates.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={site.links.events} className="button-pill">
              View Events
            </Link>
            <Link href={site.links.contact} className="button-pill">
              Contact Kate
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
