import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { TrainingPathQuiz } from "@/components/training-path-quiz";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Reiki & Sound Healing Training with Kate Gajewski",
  description: "Explore Reiki Rising, private Reiki mentorship and immersive sound practitioner training for personal growth and confident healing practice.",
  path: "/courses",
  image: "/homepage-images/ghl-reiki-rising.webp",
});

const reikiTrainingPaths = [
  {
    eyebrow: "Group Program",
    title: "Reiki Rising",
    description:
      "A 10-week online Reiki journey designed to help students build confidence, deepen their understanding and integrate Reiki into daily life and healing work.",
    details:
      "The Fall 2026 cohort begins September 27. Enrollment is open with one-time and payment-plan options available.",
    cta: "View Program & Enroll",
    href: site.links.reikiTraining,
  },
  {
    eyebrow: "1:1 Mentorship",
    title: "The Embodied Healer",
    description:
      "An ongoing Reiki Master mentorship for those who feel called to deeper personal healing, hands-on guidance and a more intimate path toward mastery and teaching.",
    details:
      "This personalized training is always onboarding and supports your growth as both a practitioner and a healer in your own life.",
    cta: "Explore Mentorship",
    href: site.links.mentorship,
  },
] as const;

export default function CoursesPage() {
  return (
    <PageShell
      eyebrow="Training"
      title="Training paths for energy healing, sound practice and embodied growth."
      description="Explore Reiki education, private mentorship and seasonal sound practitioner training. Each path supports personal transformation as much as skill development."
    >
      <section className="mx-auto w-full max-w-[44rem] overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
        <img
          src="/homepage-images/ghl-reiki-rising.webp"
          alt="Kate offering Reiki during a healing session"
          className="block h-[18rem] w-full object-cover object-center sm:h-[22rem]"
        />
      </section>

      <section className="pt-4 text-center">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Reiki Training and Mentorship
        </span>
        <h2 className="mx-auto max-w-[30ch] display-section-title">
          Learn Reiki through a supportive group or a deeply personal path.
        </h2>
        <p className="mx-auto mt-5 max-w-[44rem] text-[1.03rem] leading-[1.75] text-[var(--color-muted)]">
          Choose a live online cohort or individualized mentorship shaped around
          your experience, pace and calling.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {reikiTrainingPaths.map((path) => (
          <article
            key={path.title}
            className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {path.eyebrow}
            </span>
            <h2 className="display-section-title">
              {path.title}
            </h2>
            <p className="mt-4 text-[var(--color-muted)]">{path.description}</p>
            <p className="mt-4 text-[var(--color-muted)]">{path.details}</p>
            <div className="mt-6">
              <Link href={path.href} className="button-pill">
                {path.cta}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <TrainingPathQuiz />

      <section className="mt-5">
        <div className="mx-auto w-full max-w-[44rem] overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/rise-into-light-sound-bowl-cropped.jpeg"
            alt="Kate playing a crystal sound bowl outdoors"
            className="block h-[18rem] w-full object-cover object-center sm:h-[22rem]"
          />
        </div>
        <div className="mx-auto max-w-[48rem] pt-10 text-center sm:pt-12">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Seasonal In-Person Training
          </span>
          <h2 className="display-section-title">Sound Practitioner Training</h2>
          <p className="mt-5 text-[1.03rem] leading-[1.75] text-[var(--color-muted)]">
            An immersive training for those who want to facilitate restorative
            sound experiences with intention, presence and confidence. Learn
            through guided teaching, hands-on practice and embodied integration.
          </p>
          <div className="mx-auto mt-6 max-w-[38rem] rounded-[22px] bg-[rgba(255,248,242,0.86)] p-5">
            <strong className="block text-[var(--color-text)]">
              Next training: January 29 through 31, 2027
            </strong>
            <p className="mt-2 text-[var(--color-muted)]">
              Led by Kate Gajewski and Raquel Vamos on Long Island.
            </p>
          </div>
          <div className="mt-7 flex justify-center">
            <Link href={site.links.soundTraining} className="button-pill">
              Explore Sound Practitioner Training
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Already Working With Sound?
          </span>
          <h2 className="display-card-title">Personalized Guidance</h2>
          <p className="mt-4 max-w-[44rem] leading-[1.75] text-[var(--color-muted)]">
            If you already facilitate sound experiences and want focused support
            without entering another full training, book a one-on-one session
            for perspective, practical clarity or mentorship.
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
