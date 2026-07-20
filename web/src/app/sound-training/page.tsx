import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const soundTrainingFeatures = [
  "Instrument care, setup, and intuitive listening",
  "Facilitation skills for private sessions, classes, and ceremony",
  "Practice holding sound with presence, pacing, and confidence",
] as const;

const soundTrainingSections = [
  {
    title: "Who it is for",
    description:
      "This training is for practitioners, space holders, and heart-led students who feel called to bring sound more intentionally into healing work, ritual, classes, or private sessions.",
  },
  {
    title: "What you practice",
    description:
      "You will work with instruments, energetic awareness, client comfort, transitions, and the subtle art of creating a restorative sound experience.",
  },
  {
    title: "How it unfolds",
    description:
      "The training moves through guided teaching, hands-on practice, reflection, and integration so you can learn through the body, not only the mind.",
  },
] as const;

const waitlistHref =
  "/contact?inquiryType=training&subject=Sound%20Practitioner%20Training%20Waitlist&draft=Hi%20Kate%2C%20I%27d%20love%20to%20join%20the%20waitlist%20for%20the%20January%202027%20Sound%20Practitioner%20Training.";

export default function SoundTrainingPage() {
  return (
    <PageShell
      eyebrow="Sound Training"
      title="Sound Practitioner Training"
      description="Led by Kate Gajewski and Raquel Vamos, this immersive in-person training explores instruments, facilitation, and grounded sound practice. The next training is planned for January 2027, with exact dates to be announced."
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Live Training Experience
          </span>
          <h2 className="display-section-title">
            Learn to facilitate sound experiences in a way that feels intentional, embodied, and deeply restorative.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            Inside the training, you will explore how sound supports the nervous
            system, how to work with instruments responsibly, and how to create
            spaces that feel clear, grounded, and caring.
          </p>
          <ul className="mt-8 grid gap-3 text-[var(--color-muted)]">
            {soundTrainingFeatures.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto w-full max-w-[20rem]">
            <img
              src="/homepage-images/moodysound.jpeg"
              alt="Sound healing training atmosphere"
              className="block h-auto w-full rounded-[32px] object-contain object-center"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {soundTrainingSections.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <h2 className="display-card-title">
              {item.title}
            </h2>
            <p className="mt-4 text-[var(--color-muted)]">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <div className="max-w-[46rem]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Next Training
          </span>
          <h2 className="display-section-title">January 2027</h2>
          <p className="mt-4 text-[var(--color-muted)]">
            Exact dates are still being finalized, so registration and payment
            are not open yet. Join the waitlist to be the first to receive the
            full schedule and enrollment details when they are ready.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={waitlistHref}
            className="button-pill"
          >
            Join the Waitlist
          </Link>
          <Link
            href={site.links.contact}
            className="button-pill"
          >
            Ask a Question
          </Link>
        </div>
      </section>

    </PageShell>
  );
}
