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

const pricingOptions = [
  {
    title: "Pay in Full",
    price: "$1,344",
    details: "One-time payment for the full October 2-4, 2026 training.",
  },
  {
    title: "Payment Plan",
    price: "5 monthly payments of $288",
    details: "A more spacious payment rhythm while still reserving your place in the training.",
  },
] as const;

export default function SoundTrainingPage() {
  return (
    <PageShell
      eyebrow="Sound Training"
      title="Sound Practitioner Training"
      description="Led by Kate Gajewski and Raquel Vamos, this in-person training takes place October 2-4, 2026 and explores instruments, facilitation, and grounded sound practice."
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
            Next Training Dates
          </span>
          <h2 className="display-section-title">October 2-4, 2026</h2>
          <p className="mt-4 text-[var(--color-muted)]">
            Registration is open for the next in-person Sound Practitioner
            Training. Reserve your place now, or reach out if you want to feel
            into whether this is the right next step.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/checkout/sound-training"
            className="button-pill"
          >
            Reserve Your Spot
          </Link>
          <Link
            href={site.links.contact}
            className="button-pill"
          >
            Ask a Question
          </Link>
        </div>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Investment
        </span>
        <h2 className="max-w-[20ch] display-section-title">
          Choose the payment path that feels most supportive.
        </h2>
        <p className="mt-5 max-w-[42rem] text-[var(--color-muted)]">
          Both options reserve your place in the October training.
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {pricingOptions.map((item) => (
            <article
              key={item.title}
              className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.84)] p-6 shadow-[0_12px_32px_rgba(59,41,31,0.08)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h3 className="display-card-title">
                  {item.title}
                </h3>
                <strong className="text-[1.1rem] text-[var(--color-text)]">
                  {item.price}
                </strong>
              </div>
              <p className="mt-4 text-[var(--color-muted)]">{item.details}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
