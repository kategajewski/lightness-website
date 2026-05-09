import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const soundTrainingFeatures = [
  "A live in-person training held October 2-4, 2026",
  "Designed for those called to facilitate sound with intention, presence, and care",
  "Hands-on learning with instruments, facilitation, and grounded energetic awareness",
  "Support for both personal practice and professional development",
] as const;

const soundTrainingSections = [
  {
    title: "What it is",
    description:
      "Sound Practitioner Training is a live immersive experience for those who want to work with sound in a way that feels intuitive, grounded, and deeply supportive.",
  },
  {
    title: "Who it is for",
    description:
      "This training is for practitioners, space holders, and heart-led students who feel called to bring sound more intentionally into healing work, ritual, classes, or private sessions.",
  },
  {
    title: "Training rhythm",
    description:
      "The next training takes place October 2-4, 2026. It is offered twice each year, creating a seasonal path for learning, practice, and integration.",
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
      title="A live practitioner training for those called to hold sound with presence, care, and embodied confidence."
      description="Sound Practitioner Training is a live immersive experience for those who want to learn how to work with sound in a grounded, intuitive, and supportive way."
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
            This is not a prerecorded course or an abstract certification path.
            It is a live training designed to help you understand instruments,
            build confidence, and learn how to hold sound with clarity,
            presence, and reverence.
          </p>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Whether you feel called to weave sound into your private work,
            classes, ceremonies, or your own personal practice, this container
            is here to help you begin in a grounded and supported way.
          </p>
          <ul className="mt-8 grid gap-3 text-[var(--color-muted)]">
            {soundTrainingFeatures.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
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

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Next Training Dates
          </span>
          <h2 className="display-section-title">
            October 2-4, 2026
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            The next Sound Practitioner Training will be held across three days
            in October. If this training is calling to you, now is the right
            time to reach out and receive details as registration opens.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            What to expect
          </strong>
          <ul className="mt-4 grid gap-3 text-[var(--color-muted)]">
            <li>A live immersive training rather than a self-paced course</li>
            <li>Guidance around instruments, facilitation, and practitioner presence</li>
            <li>Space for learning, hands-on practice, and embodied integration</li>
            <li>Direct inquiry now, with fuller registration details to follow</li>
          </ul>
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
          Sound Practitioner Training is available through either a full
          payment or a monthly payment plan. Both options are intended to make
          it easier to say yes to the training in the way that best fits your
          current season.
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
