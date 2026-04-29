import Link from "next/link";
import { submitMentorshipApplication } from "@/app/mentorship/actions";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

type MentorshipApplicationPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function MentorshipApplicationPage({
  searchParams,
}: MentorshipApplicationPageProps) {
  const params = await searchParams;
  const status = params?.status;
  const message = params?.message;

  return (
    <PageShell
      eyebrow="Mentorship Application"
      title="Apply for The Embodied Healer."
      description="Share where you are, what is calling you, and what kind of support you are seeking. No prior Reiki experience is required."
    >
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Before You Apply
          </span>
          <h2 className="font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-[0.96] tracking-[-0.02em]">
            This path is open to both beginners and those already deepening into Reiki.
          </h2>
          <p className="mt-5 text-[var(--color-muted)]">
            The Embodied Healer is intentionally personalized, so this
            application is simply a way to understand what is calling you and
            whether this path is the right fit for this season of your life.
          </p>
          <ul className="mt-6 grid gap-3 text-[var(--color-muted)]">
            <li>No previous Reiki experience is required</li>
            <li>Applications are reviewed on an ongoing basis</li>
            <li>You&apos;ll receive a personal response from Kate within about one week</li>
            <li>Please review the mentorship investment options before applying</li>
          </ul>
          <div className="mt-6">
            <Link href={site.links.mentorship} className="button-pill">
              Back to Mentorship Page
            </Link>
          </div>
        </div>

        <form
          action={submitMentorshipApplication}
          className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.9),rgba(239,229,217,0.86))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10"
        >
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Application Form
          </span>
          <h2 className="font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-[0.96] tracking-[-0.02em]">
            Tell Kate what is calling you here.
          </h2>
          <p className="mt-4 max-w-[36rem] text-[var(--color-muted)]">
            This does not need to be perfect. A thoughtful, honest response is
            more helpful than polished language.
          </p>

          {status === "success" ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(124,163,130,0.22)] bg-[rgba(168,178,159,0.22)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              Your application has been lovingly received. Kate will be in touch within about one week.
            </p>
          ) : null}

          {status === "error" ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(160,95,88,0.18)] bg-[rgba(201,167,156,0.18)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              {message ?? "There was a problem submitting the application."}
            </p>
          ) : null}

          <div className="mt-6 grid gap-4">
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

            <div className="grid gap-4 sm:grid-cols-2">
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

              <label className="grid gap-2">
                <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                  Phone
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Reiki experience level
              </span>
              <select
                name="experienceLevel"
                defaultValue=""
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              >
                <option value="" disabled>
                  Select one
                </option>
                <option value="none">I&apos;m completely new to Reiki</option>
                <option value="curious">I&apos;ve explored it personally</option>
                <option value="trained">I have previous Reiki training</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                What are you hoping this path will support?
              </span>
              <select
                name="focus"
                defaultValue=""
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              >
                <option value="" disabled>
                  Select one
                </option>
                <option value="personal-healing">Primarily my own healing and growth</option>
                <option value="both">Both personal healing and learning to support others</option>
                <option value="professional-path">A future practitioner or teaching path</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                What is calling you to this mentorship?
              </span>
              <textarea
                name="interest"
                required
                rows={4}
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                What season of life are you moving through right now?
              </span>
              <textarea
                name="currentSeason"
                rows={4}
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                What are your intentions for this path?
              </span>
              <textarea
                name="intentions"
                required
                rows={5}
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                When are you hoping to begin?
              </span>
              <select
                name="startTiming"
                defaultValue=""
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              >
                <option value="" disabled>
                  Select one
                </option>
                <option value="asap">As soon as possible</option>
                <option value="one-to-three-months">Within the next 1–3 months</option>
                <option value="just-exploring">I&apos;m exploring and feeling into timing</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Anything else you&apos;d like Kate to know?
              </span>
              <textarea
                name="additionalNotes"
                rows={4}
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>
          </div>

          <button type="submit" className="button-pill mt-6">
            Submit Application
          </button>
        </form>
      </section>
    </PageShell>
  );
}
