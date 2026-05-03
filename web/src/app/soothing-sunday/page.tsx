import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const soothingSundayDates = [
  {
    title: "Sunday, May 17, 2026",
    details:
      "Lindenhurst Village Square Gazebo · Outdoors weather permitting, otherwise indoors at Island Kava, Lindenhurst",
    eventSlug: "soothing-sunday-may-17-2026",
  },
  {
    title: "Sunday, June 14, 2026",
    details:
      "Lindenhurst Village Square Gazebo · Outdoors weather permitting, otherwise indoors at Island Kava, Lindenhurst",
    eventSlug: "soothing-sunday-june-14-2026",
  },
] as const;

const soothingSundayFeatures = [
  "A gentle yoga, sound bath, and kava experience",
  "Held monthly at Island Kava in Lindenhurst",
  "Designed to help you reset, soften, and begin the week in a more grounded way",
  "A welcoming community experience whether you come alone or with a friend",
] as const;

export default function SoothingSundayPage() {
  return (
    <PageShell
      eyebrow="Soothing Sunday"
      title="A monthly Island Kava gathering for rest, ritual, and a softer start to the week."
      description="Soothing Sunday blends gentle movement, sound healing, and kava in a community setting designed to help you slow down, reconnect, and reset."
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Monthly Event Series
          </span>
          <h2 className="display-section-title">
            Gentle yoga, sound bath, and kava in a warm community space.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            Soothing Sunday is a recurring Island Kava gathering created to
            help you exhale before the week begins. It brings together gentle
            movement, restorative sound, and the grounding ritual of kava in a
            way that feels both nourishing and easy to arrive to.
          </p>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            No previous yoga, kava, or sound healing experience is needed.
            The stretching is gentle and beginner-friendly, with space to
            move at your own pace.
          </p>
          <ul className="mt-8 grid gap-3 text-[var(--color-muted)]">
            {soothingSundayFeatures.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={site.links.events} className="button-pill">
              Back to Events
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto w-full max-w-[20rem]">
            <img
              src="/homepage-images/events-island-kava-sound.jpeg"
              alt="Soothing Sunday sound bath setup at Island Kava"
              className="block h-auto w-full rounded-[32px] object-contain object-center"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {soothingSundayDates.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <h3 className="display-card-title">
              {item.title}
            </h3>
            <p className="mt-4 text-[var(--color-muted)]">{item.details}</p>
            <form action="/api/checkout/event" method="post" className="mt-5">
              <input type="hidden" name="eventSlug" value={item.eventSlug} />
              <button type="submit" className="button-pill">
                Buy Ticket - $45
              </button>
            </form>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            What to expect
          </span>
          <h2 className="display-section-title">
            A simple, grounding ritual to carry you into the week ahead.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Soothing Sunday is meant to feel approachable and restorative.
            Come as you are, settle in slowly, and let the experience meet you
            where you are.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Good to know
          </strong>
          <ul className="mt-4 grid gap-3 text-[var(--color-muted)]">
            <li>Dress comfortably and in layers</li>
            <li>Your body may naturally cool down during the sound bath</li>
            <li>Bring a yoga mat and blanket</li>
            <li>May and June are planned for the Lindenhurst Village Square gazebo, with an indoor move to Island Kava if weather shifts</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
