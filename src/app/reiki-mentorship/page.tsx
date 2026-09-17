import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "The Healer's Emergence | Private Reiki Mentorship",
  description:
    "Six-week and twelve-week private Reiki mentorship with Kate Gajewski for trained practitioners ready to deepen their knowledge, build confidence and begin a Reiki business.",
  path: "/reiki-mentorship",
  image: "/homepage-images/embodied-healer-warm-mentorship-final.jpeg",
});

const inquiryHref =
  "/contact?inquiryType=training&subject=The%20Healer%27s%20Emergence%20Mentorship";

const sharedSupport = [
  "Guidance deepening and enriching your existing Reiki knowledge",
  "Support strengthening your confidence, intuition and self-trust",
  "Help navigating practitioner fears, questions and energetic boundaries",
  "Guidance creating Reiki sessions that feel supportive and professional",
  "Business support with offers, pricing, messaging and client experience",
  "Practical guidance getting visible and beginning to attract clients",
  "Personalized next steps, accountability and encouragement",
] as const;

const mentorshipOptions = [
  {
    eyebrow: "Recommended",
    title: "The Healer's Emergence Mentorship",
    subtitle: "A 12-week private container for meaningful growth",
    description:
      "This option gives us time to deepen your knowledge, strengthen your confidence and build the foundations of your Reiki business. Our sessions will meet what is most relevant each week while staying connected to the larger vision you want to bring to life.",
    features: [
      "12 weekly 45-minute private mentorship sessions",
      "A personalized roadmap based on your goals",
      ...sharedSupport,
      "Weekday voice note or email support, with replies within one to two business days",
      "A final integration plan for continuing your growth",
    ],
    paidInFull: "$2,200 paid in full",
    paymentPlan: "or 3 monthly payments of $750",
  },
  {
    eyebrow: "Focused Support",
    title: "The Healer's Emergence Intensive",
    subtitle: "A 6-week private container centered on one clear goal",
    description:
      "This option is designed for practitioners who want focused support around one specific area of their Reiki practice or business. Together, we will choose a clear direction and use our six weeks to build confidence and create real movement.",
    features: [
      "6 weekly 45-minute private mentorship sessions",
      "One clearly defined goal for our six weeks together",
      ...sharedSupport,
      "Weekday voice note or email support, with replies within one to two business days",
      "A clear plan for your next steps",
    ],
    paidInFull: "$1,200 paid in full",
    paymentPlan: "or 2 monthly payments of $625",
  },
] as const;

const focusAreas = [
  {
    title: "Deepen Your Reiki Knowledge",
    description:
      "Revisit what you have learned, fill in the places where you feel uncertain and continue developing through real practice and personal guidance.",
  },
  {
    title: "Grow Your Practitioner Confidence",
    description:
      "Strengthen your intuition, boundaries and trust in yourself so you can begin working with others with greater steadiness and ease.",
  },
  {
    title: "Bring Your Reiki Business to Life",
    description:
      "Receive practical support shaping your offers, choosing your pricing, talking about your work and beginning to connect with clients.",
  },
] as const;

export default function ReikiMentorshipPage() {
  return (
    <PageShell
      eyebrow="Private Reiki Mentorship"
      title="The Healer's Emergence"
      description="From trained in Reiki to a confident, visible practitioner. Deepen your Reiki knowledge, strengthen your confidence and receive practical support building a business around the work you feel called to share."
    >
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            For Trained Reiki Practitioners
          </span>
          <h2 className="display-section-title">
            Your Reiki training gave you the foundation. Now it is time to emerge.
          </h2>
          <p className="mt-5 text-[1.03rem] leading-[1.75] text-[var(--color-muted)]">
            Learning Reiki is one part of the journey. Beginning to use it,
            trust it and share it with others can bring an entirely new set of
            questions. This mentorship gives you a consistent place to deepen
            what you know and work through those questions with personal
            guidance and honest support.
          </p>
          <p className="mt-4 leading-[1.75] text-[var(--color-muted)]">
            Some weeks may center on your Reiki skills or confidence. Others
            may focus on shaping your offers, choosing your pricing, talking
            about your work or finding clients. This is where your Reiki
            knowledge begins becoming a practice you can truly share.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={inquiryHref} className="button-pill">
              Inquire About Mentorship
            </Link>
            <Link href={site.links.courses} className="button-pill">
              Compare All Reiki Paths
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/embodied-healer-warm-mentorship-final.jpeg"
            alt="Kate offering personal guidance during a Reiki mentorship session"
            className="block h-[30rem] w-full object-cover object-center"
          />
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[46rem] text-center">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Three Areas of Support
          </span>
          <h2 className="display-section-title">
            Become a confident, visible practitioner with a business that reflects your gifts.
          </h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {focusAreas.map((area) => (
            <article
              key={area.title}
              className="rounded-[26px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
            >
              <h3 className="display-card-title">{area.title}</h3>
              <p className="mt-4 leading-[1.7] text-[var(--color-muted)]">
                {area.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[46rem] text-center">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Choose Your Container
          </span>
          <h2 className="display-section-title">
            Two ways to receive consistent, personalized support.
          </h2>
          <p className="mt-5 leading-[1.75] text-[var(--color-muted)]">
            Both options are private and tailored to you. The difference is the
            amount of time available for integration, practice and momentum.
          </p>
          <div className="mt-7 rounded-[22px] border border-[rgba(139,111,96,0.18)] bg-[rgba(234,216,204,0.5)] p-5 text-left sm:p-6">
            <strong className="block text-[1.05rem] text-[var(--color-text)]">
              Founding Rate
            </strong>
            <p className="mt-2 leading-[1.7] text-[var(--color-muted)]">
              Available to the first three practitioners who join The
              Healer&apos;s Emergence. Future enrollment will be offered at a
              higher investment.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {mentorshipOptions.map((option) => (
            <article
              key={option.title}
              className="flex h-full flex-col rounded-[30px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,251,246,0.86)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10"
            >
              <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {option.eyebrow}
              </span>
              <h3 className="display-section-title">{option.title}</h3>
              <strong className="mt-3 block text-[1rem] text-[var(--color-text)]">
                {option.subtitle}
              </strong>
              <p className="mt-5 leading-[1.75] text-[var(--color-muted)]">
                {option.description}
              </p>
              <ul className="mt-7 grid gap-3 text-[var(--color-muted)]">
                {option.features.map((feature) => (
                  <li key={feature} className="flex gap-3 leading-[1.65]">
                    <span
                      aria-hidden="true"
                      className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b6f60]"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-[rgba(76,58,48,0.1)] pt-6">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Founding Investment
                </span>
                <strong className="mt-2 block text-[1.25rem] text-[var(--color-text)]">
                  {option.paidInFull}
                </strong>
                <p className="mt-1 text-[var(--color-muted)]">
                  {option.paymentPlan}
                </p>
              </div>
              <div className="mt-7">
                <Link href={inquiryHref} className="button-pill">
                  Inquire About This Mentorship
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(234,216,204,0.62)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Not Ready for a Container?
          </span>
          <h2 className="display-card-title">Book one focused mentorship session.</h2>
          <p className="mt-4 max-w-[44rem] leading-[1.75] text-[var(--color-muted)]">
            A 45-minute Personalized Guidance session is available for $150 if
            you want support with one specific question or next step.
          </p>
        </div>
        <Link
          href="https://calendly.com/thelightnessofbeing/mentorship"
          className="button-pill"
        >
          Book Personalized Guidance
        </Link>
      </section>
    </PageShell>
  );
}
