import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const trainingPaths = [
  {
    eyebrow: "Group Program",
    title: "Reiki Rising",
    description:
      "A 10-week online Reiki journey designed to help students build confidence, deepen their understanding, and integrate Reiki into daily life and healing work.",
    details:
      "This live group container runs about three times each year. The current round is underway, and the next cohort is expected in approximately 3-4 months.",
    cta: "Join the Waitlist",
    href: site.links.reikiTraining,
  },
  {
    eyebrow: "1:1 Mentorship",
    title: "The Embodied Healer",
    description:
      "An ongoing Reiki Master mentorship for those who feel called to deeper personal healing, hands-on guidance, and a more intimate path toward mastery and teaching.",
    details:
      "This personalized training is always onboarding and supports your growth as both a practitioner and a healer in your own life.",
    cta: "Explore Mentorship",
    href: site.links.mentorship,
  },
  {
    eyebrow: "Seasonal Training",
    title: "Sound Practitioner Training",
    description:
      "A practitioner training for those who want to facilitate restorative, grounded sound experiences with intention, presence, and confidence.",
    details:
      "This immersive training is offered two times each year and is best for those ready to deepen into sound as both a personal and professional practice.",
    cta: "Learn About Sound Training",
    href: site.links.soundTraining,
  },
] as const;

export default function CoursesPage() {
  return (
    <PageShell
      eyebrow="Training"
      title="Three distinct paths for learning, growth, and embodied practice."
      description="Explore the training experiences offered through The Lightness of Being, from group Reiki study to private mentorship and seasonal sound practitioner education."
    >
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Learning at The Lightness of Being
          </span>
          <h2 className="max-w-[22ch] display-section-title">
            Choose the training path that meets where you are being called.
          </h2>
          <p className="mt-5 max-w-[42rem] text-[var(--color-muted)]">
            Whether you are looking for an intimate mentorship, a live group
            Reiki container, or a seasonal sound practitioner training, each path
            is designed to support personal transformation as much as skill
            development.
          </p>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/services-lightnesssound.jpeg"
            alt="Kate facilitating a sound experience"
            className="block h-full min-h-[24rem] w-full object-cover object-center"
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {trainingPaths.map((path) => (
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
    </PageShell>
  );
}
