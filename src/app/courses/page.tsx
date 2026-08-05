import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Reiki & Sound Healing Training with Kate Gajewski",
  description: "Explore Reiki Rising, private Reiki mentorship, and immersive sound practitioner training for personal growth and confident healing practice.",
  path: "/courses",
  image: "/homepage-images/services-lightnesssound.jpeg",
});

const trainingPaths = [
  {
    eyebrow: "Group Program",
    title: "Reiki Rising",
    description:
      "A 10-week online Reiki journey designed to help students build confidence, deepen their understanding, and integrate Reiki into daily life and healing work.",
    details:
      "The Fall 2026 cohort begins September 27. Enrollment is open with one-time and payment-plan options available.",
    cta: "View Program & Enroll",
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
      "The next in-person training is planned for January 2027. Exact dates are still being finalized, and the waitlist is now open.",
    cta: "Join the Waitlist",
    href: site.links.soundTraining,
  },
] as const;

export default function CoursesPage() {
  return (
    <PageShell
      eyebrow="Training"
      title="Three distinct paths for learning, growth, and embodied practice."
      description="Explore group Reiki study, private mentorship, and seasonal sound practitioner education, each designed to support personal transformation as much as skill development."
    >
      <section className="overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
        <img
          src="/homepage-images/services-lightnesssound.jpeg"
          alt="Kate facilitating a sound experience"
          className="block h-[22rem] w-full object-cover object-center sm:h-[30rem]"
        />
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
