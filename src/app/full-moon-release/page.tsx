import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const features = [
  "A Reiki-infused sound bath held under the energy of the full moon",
  "Created to support release, reflection, rest, and nervous system softening",
  "Held at Sanctuary+Health in Patchogue on Saturday, May 2, 2026",
  "Open to those who want a restorative, intentional community experience",
] as const;

const details = [
  {
    title: "Date & Place",
    description: "Saturday, May 2, 2026 · Sanctuary+Health, Patchogue",
  },
  {
    title: "What it offers",
    description:
      "A blend of Reiki, sound, and intentional space to help you release what feels heavy and reconnect with yourself.",
  },
  {
    title: "Who it is for",
    description:
      "Those craving a gentler reset, energetic clearing, and a more grounded way to move through the full moon.",
  },
] as const;

export default function FullMoonReleasePage() {
  return (
    <PageShell
      eyebrow="Full Moon Event"
      title="Full Moon Release: Reiki Infused Sound Journey"
      description="A restorative evening experience designed to help you soften, clear, and reconnect through Reiki, sound, and the reflective energy of the full moon."
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Upcoming Seasonal Gathering
          </span>
          <h2 className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-[0.96] tracking-[-0.02em]">
            A full moon evening for release, rest, and energetic recalibration.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            This Reiki infused sound journey is designed as a space to exhale.
            Through sound, energetic support, and intentional atmosphere, the
            evening invites you to soften what has built up, release what no longer
            needs to be carried, and reconnect with yourself in a more spacious way.
          </p>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Whether you come for rest, ritual, emotional reset, or simply the chance
            to be held inside a meaningful gathering, this event is meant to feel
            restorative, gentle, and nourishing.
          </p>
          <ul className="mt-8 grid gap-3 text-[var(--color-muted)]">
            {features.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="https://www.sanctuary-health.org/events-list"
              className="button-pill"
            >
              Reserve Your Spot
            </Link>
            <Link href={site.links.events} className="button-pill">
              Back to Events
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto w-full max-w-[20rem]">
            <img
              src="/homepage-images/full-moon-sound-bath.jpeg"
              alt="Floating floral sound bath experience"
              className="block h-auto w-full rounded-[32px] object-contain object-center"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {details.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <h3 className="font-display text-[2rem] leading-[0.98] tracking-[-0.02em]">
              {item.title}
            </h3>
            <p className="mt-4 text-[var(--color-muted)]">{item.description}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
