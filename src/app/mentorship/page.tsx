import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const mentorshipFeatures = [
  "No previous Reiki experience is required",
  "A personalized 1:1 Reiki path from your very first steps through deeper mastery",
  "Hands-on guidance, healing sessions, manuals, ignitions, and experiential practice",
  "Support for personal healing, practitioner development, and eventual teaching if you feel called",
] as const;

const mentorshipSections = [
  {
    title: "Who this is for",
    description:
      "This path is for those who feel genuinely called to Reiki, whether you are beginning from scratch or ready to deepen into a more intimate, supported way of learning.",
  },
  {
    title: "How it works",
    description:
      "The Embodied Healer is shaped around you. Sessions unfold one-on-one with space for learning, healing, integration, and steady guidance at a pace that feels supportive rather than overwhelming.",
  },
  {
    title: "What it can become",
    description:
      "Your mentorship can begin with personal healing and grow all the way into practitioner training, Master Teacher work, Animal & Pet Reiki, and business support if that path opens for you.",
  },
] as const;

const mentorshipTestimonials = [
  {
    quote:
      "The one-on-one format made it possible to move at a pace that truly fit my life, while still feeling deeply supported and transformed by the work.",
    author: "Jacqueline, NY",
  },
  {
    quote:
      "Kate teaches Reiki in a way that feels attainable, sacred, and grounded. I always felt encouraged, safe, and fully supported as I learned.",
    author: "Mary Beth, NY",
  },
] as const;

const mentorshipInvestments = [
  {
    title: "Traditional Usui Levels 1 through Master",
    details: "Includes Animal Reiki and business development. Approximately 40 hours.",
    price: "$4,500",
  },
  {
    title: "Usui Holy Fire® Levels 1 through Master",
    details: "Includes Animal Reiki and business development. Approximately 35 hours.",
    price: "$4,000",
  },
  {
    title: "Usui Holy Fire® Master Mini",
    details:
      "For students already attuned to Levels 1 and 2 in any lineage who want to become a Holy Fire Reiki Master. Approximately 18–20 hours.",
    price: "$2,200",
  },
  {
    title: "Embodied Practitioner",
    details:
      "Levels 1 and 2 only, plus an Animal & Pet Reiki overview. Approximately 16 hours.",
    price: "$1,700",
  },
] as const;

export default function MentorshipPage() {
  return (
    <PageShell
      eyebrow="The Embodied Healer"
      title="A private Reiki mentorship for healing, remembrance, and the path of becoming an embodied practitioner."
      description="The Embodied Healer is a personalized 1:1 Reiki mentorship for those who feel called to begin or deepen their journey in a highly supported way. No prior Reiki experience is required."
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Personalized 1:1 Mentorship
          </span>
          <h2 className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-[0.96] tracking-[-0.02em]">
            Reiki can begin here, even if you are just answering the call for the first time.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            The Embodied Healer is for those who want to learn Reiki in a way
            that feels personal, spacious, and deeply supported. This is not a
            rushed certification path. It is a living mentorship that allows
            you to receive Reiki, embody it, and grow alongside it.
          </p>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Some students arrive here as complete beginners. Others come with
            previous experience and a desire to go deeper. Both are welcome.
            The mentorship meets you where you are and supports the next honest
            step on your path.
          </p>
          <ul className="mt-8 grid gap-3 text-[var(--color-muted)]">
            {mentorshipFeatures.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={site.links.mentorshipApplication} className="button-pill">
              Apply Now
            </Link>
            <Link href={site.links.reikiTraining} className="button-pill">
              Prefer a Group Path?
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto w-full max-w-[20rem]">
            <img
              src="/homepage-images/embodied-healer-mentorship.jpeg"
              alt="Kate guiding a student during The Embodied Healer Reiki mentorship"
              className="block h-auto w-full rounded-[32px] object-contain object-center"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {mentorshipSections.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <h2 className="font-display text-[2rem] leading-[0.98] tracking-[-0.02em]">
              {item.title}
            </h2>
            <p className="mt-4 text-[var(--color-muted)]">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Ongoing Enrollment
          </span>
          <h2 className="font-display text-[clamp(2.3rem,5vw,3.5rem)] leading-[0.98] tracking-[-0.02em]">
            This mentorship is always onboarding.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Because this is a one-on-one path, you do not need to wait for a
            group cohort to open. Applications are reviewed on an ongoing basis
            so the timing can meet the season you are in and the level of
            support you are truly ready for.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            What this path can include
          </strong>
          <ul className="mt-4 grid gap-3 text-[var(--color-muted)]">
            <li>Step-by-step Reiki guidance from Level 1 through Master Teacher</li>
            <li>Activations, ignitions, and experiential practice</li>
            <li>Animal & Pet Reiki as part of the longer path</li>
            <li>Business guidance if you feel called to professional practice</li>
          </ul>
        </div>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Investment
        </span>
        <h2 className="max-w-[18ch] font-display text-[clamp(2.3rem,5vw,3.4rem)] leading-[0.98] tracking-[-0.02em]">
          Clear pricing for the path you feel called toward.
        </h2>
        <p className="mt-5 max-w-[42rem] text-[var(--color-muted)]">
          Because this mentorship is deeply personal, the shape of the journey
          can vary. These pathways offer a clear starting point so you can feel
          into what is aligned before applying.
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {mentorshipInvestments.map((item) => (
            <article
              key={item.title}
              className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.84)] p-6 shadow-[0_12px_32px_rgba(59,41,31,0.08)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h3 className="max-w-[18ch] font-display text-[1.7rem] leading-[1] tracking-[-0.02em]">
                  {item.title}
                </h3>
                <strong className="text-[1.2rem] text-[var(--color-text)]">
                  {item.price}
                </strong>
              </div>
              <p className="mt-4 text-[var(--color-muted)]">{item.details}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {mentorshipTestimonials.map((item) => (
          <article
            key={item.author}
            className="rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <p className="text-[1.03rem] leading-[1.8] text-[var(--color-muted)]">
              “{item.quote}”
            </p>
            <p className="mt-5 text-[0.95rem] font-medium text-[var(--color-text)]">
              {item.author}
            </p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
