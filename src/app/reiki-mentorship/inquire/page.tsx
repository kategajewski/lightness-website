import Link from "next/link";
import { submitHealersEmergenceInquiry } from "@/app/reiki-mentorship/actions";
import { FormSecurityFields } from "@/components/form-security-fields";
import { PageShell } from "@/components/page-shell";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Inquire About The Healer's Emergence",
  description:
    "Begin a conversation with Kate about private Reiki practitioner mentorship through The Healer's Emergence.",
  path: "/reiki-mentorship/inquire",
  image: "/homepage-images/healers-emergence-mentorship.jpeg",
});

const supportAreas = [
  "Deepening my Reiki knowledge",
  "Building confidence as a practitioner",
  "Structuring sessions and improving client experience",
  "Creating offers and choosing pricing",
  "Marketing and becoming more visible",
  "Attracting clients",
  "Accountability and momentum",
] as const;

type ReikiMentorshipInquiryPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function ReikiMentorshipInquiryPage({
  searchParams,
}: ReikiMentorshipInquiryPageProps) {
  const params = await searchParams;
  const status = params?.status;
  const message = params?.message;

  return (
    <PageShell
      eyebrow="The Healer's Emergence"
      title="Begin the conversation."
      description="Share a little about where you are in your Reiki journey, what you are hoping to build and the support that would feel most meaningful right now."
    >
      <section className="grid min-w-0 gap-6 sm:gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <aside className="min-w-0 rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-8 lg:sticky lg:top-28">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Before You Begin
          </span>
          <h2 className="display-card-title">
            This is simply a place to begin an honest conversation.
          </h2>
          <p className="mt-4 leading-[1.75] text-[var(--color-muted)]">
            You do not need to have everything figured out. Your answers will
            help Kate understand what you have already learned, where you feel
            stuck and which kind of support may be the best fit.
          </p>
          <ul className="mt-6 grid gap-3 leading-[1.65] text-[var(--color-muted)]">
            <li>Submitting an inquiry does not commit you to enrolling.</li>
            <li>Both the six and twelve-week options are private and personalized.</li>
            <li>Kate will read your responses and follow up personally.</li>
          </ul>
          <Link href="/reiki-mentorship" className="button-pill mt-7">
            Back to Mentorship Details
          </Link>
        </aside>

        <form
          action={submitHealersEmergenceInquiry}
          className="min-w-0 rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.9),rgba(239,229,217,0.86))] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10"
        >
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Mentorship Inquiry
          </span>
          <h2 className="display-section-title">Tell Kate what is calling you forward.</h2>
          <p className="mt-4 max-w-[38rem] leading-[1.7] text-[var(--color-muted)]">
            Thoughtful and honest is more helpful than polished. Take your time
            and answer in whatever way feels natural to you.
          </p>

          <FormSecurityFields />

          {status === "success" ? (
            <div
              role="status"
              className="mt-6 rounded-[18px] border border-[rgba(124,163,130,0.22)] bg-[rgba(168,178,159,0.22)] px-5 py-4 text-[var(--color-text)]"
            >
              Your inquiry has been received. Kate will read your responses and
              be in touch personally.
            </div>
          ) : null}

          {status === "error" ? (
            <p
              role="alert"
              className="mt-6 rounded-[18px] border border-[rgba(160,95,88,0.18)] bg-[rgba(201,167,156,0.18)] px-5 py-4 text-[var(--color-text)]"
            >
              {message ?? "There was a problem submitting your inquiry."}
            </p>
          ) : null}

          <div className="mt-7 grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                  Name
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  className="min-h-12 w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
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
                  autoComplete="email"
                  className="min-h-12 w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Phone <span className="font-normal text-[var(--color-muted)]">(optional)</span>
              </span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                className="min-h-12 w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Which container are you most interested in?
              </span>
              <select
                name="containerInterest"
                required
                defaultValue=""
                className="min-h-12 w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
              >
                <option value="" disabled>Select one</option>
                <option value="12-week mentorship">The 12-week mentorship</option>
                <option value="6-week intensive">The 6-week intensive</option>
                <option value="unsure">I am not sure yet</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Tell me about your Reiki training and experience so far.
              </span>
              <textarea
                name="reikiExperience"
                required
                rows={5}
                placeholder="You might share your Reiki level, lineage, when you trained and how you currently practice."
                className="w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none placeholder:text-[rgba(93,81,72,0.65)] focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
              />
            </label>

            <fieldset className="grid gap-3">
              <legend className="text-[0.92rem] font-medium text-[var(--color-text)]">
                What are you seeking support with? Select all that apply.
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {supportAreas.map((area) => (
                  <label
                    key={area}
                    className="flex cursor-pointer items-start gap-3 rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.66)] p-4 leading-[1.55] text-[var(--color-muted)]"
                  >
                    <input
                      type="checkbox"
                      name="supportAreas"
                      value={area}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#72594c]"
                    />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                Please choose at least one.
              </p>
            </fieldset>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                What would you most like support navigating right now?
              </span>
              <textarea
                name="supportDetails"
                required
                rows={5}
                className="w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Where are you in building your Reiki business?
              </span>
              <select
                name="businessStage"
                required
                defaultValue=""
                className="min-h-12 w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
              >
                <option value="" disabled>Select one</option>
                <option value="exploring">I am exploring what professional practice could look like</option>
                <option value="not-started">I know I want a business but have not started yet</option>
                <option value="creating-offers">I am beginning to create my offers</option>
                <option value="first-clients">I have worked with a few clients</option>
                <option value="growing">I have an existing practice I want to grow</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                What feels most challenging or uncertain right now? <span className="font-normal text-[var(--color-muted)]">(optional)</span>
              </span>
              <textarea
                name="currentChallenge"
                rows={4}
                className="w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                How would you like to feel at the end of this mentorship?
              </span>
              <textarea
                name="desiredFeeling"
                required
                rows={4}
                className="w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                What would you love to have created or moved forward by the end? <span className="font-normal text-[var(--color-muted)]">(optional)</span>
              </span>
              <textarea
                name="desiredOutcome"
                rows={4}
                className="w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                When are you hoping to begin?
              </span>
              <select
                name="startTiming"
                required
                defaultValue=""
                className="min-h-12 w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
              >
                <option value="" disabled>Select one</option>
                <option value="as-soon-as-possible">As soon as possible</option>
                <option value="within-one-month">Within the next month</option>
                <option value="one-to-three-months">Within the next one to three months</option>
                <option value="exploring">I am still exploring the timing</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Is there anything else you would like Kate to know? <span className="font-normal text-[var(--color-muted)]">(optional)</span>
              </span>
              <textarea
                name="additionalNotes"
                rows={4}
                className="w-full min-w-0 rounded-[16px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[#8b6f60] focus:ring-2 focus:ring-[rgba(139,111,96,0.16)]"
              />
            </label>
          </div>

          <TurnstileWidget action="reiki_mentorship_inquiry" />

          <button type="submit" className="button-pill mt-7 w-full sm:w-auto">
            Send My Inquiry
          </button>
        </form>
      </section>
    </PageShell>
  );
}
