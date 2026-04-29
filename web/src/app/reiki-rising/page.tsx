import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const reikiRisingFeatures = [
  "A 10-week live online Reiki training container",
  "Designed to support both personal healing and confident practice",
  "A guided group experience with space for integration and embodiment",
  "Best for those who want depth, structure, and a supportive spiritual container",
] as const;

const reikiRisingSections = [
  {
    title: "What it is",
    description:
      "Reiki Rising is a 10-week online experience that blends sacred Reiki study, energetic practice, and personal transformation in a grounded group format.",
  },
  {
    title: "Who it is for",
    description:
      "This path is for those who feel called to learn Reiki in a deeper way, whether for their own healing, their spiritual path, or the beginning of supporting others.",
  },
  {
    title: "Enrollment rhythm",
    description:
      "Reiki Rising is offered approximately three times each year. The current round is in progress, and the next cohort is expected in roughly 3-4 months.",
  },
] as const;

export default function ReikiRisingPage() {
  return (
    <PageShell
      eyebrow="Reiki Rising"
      title="A 10-week online Reiki experience for healing, remembrance, and embodied growth."
      description="Reiki Rising is a live online training designed to help students deepen into Reiki with structure, support, and a more meaningful relationship to their own healing path."
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Live Online Group Program
          </span>
          <h2 className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-[0.96] tracking-[-0.02em]">
            Learn Reiki in a way that feels spacious, personal, and deeply transformative.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            Reiki Rising is for those who want more than a quick introduction.
            It offers a steady 10-week container to receive, practice, integrate,
            and deepen into Reiki with support along the way.
          </p>
          <ul className="mt-8 grid gap-3 text-[var(--color-muted)]">
            {reikiRisingFeatures.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact?inquiryType=training&subject=Reiki%20Rising%20Waitlist&draft=Hi%20Kate%2C%20I%27d%20love%20to%20join%20the%20waitlist%20for%20the%20next%20Reiki%20Rising%20cohort."
              className="button-pill"
            >
              Join the Waitlist
            </Link>
            <Link href={site.links.mentorship} className="button-pill">
              Explore 1:1 Mentorship
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto w-full max-w-[20rem]">
            <img
              src="https://storage.googleapis.com/msgsndr/UjW44wJD5eUk7BCDEe2Z/media/68353a2cc305a903ecc0be02.webp"
              alt="Reiki Rising training"
              className="block h-auto w-full rounded-[32px] object-contain object-center"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {reikiRisingSections.map((item) => (
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
            Current Enrollment
          </span>
          <h2 className="font-display text-[clamp(2.3rem,5vw,3.5rem)] leading-[0.98] tracking-[-0.02em]">
            The current round is underway, and the next cohort will open in the coming months.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            If Reiki Rising is calling to you, this is the perfect time to join
            the waitlist. You&apos;ll be first to know when the next round opens
            and can step into the next cohort with more clarity and intention.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            What to expect
          </strong>
          <ul className="mt-4 grid gap-3 text-[var(--color-muted)]">
            <li>10 weeks of guided online learning and practice</li>
            <li>A supportive container for healing and integration</li>
            <li>Live cohort rhythm rather than a self-paced course</li>
            <li>Waitlist now, with the next opening expected in 3-4 months</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
