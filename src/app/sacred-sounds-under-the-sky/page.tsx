import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const details = [
  {
    title: "Main Date",
    description:
      "Saturday, May 23, 2026 · 11:00 AM-12:00 PM at The Lightness Grounds in Bayport, NY",
  },
  {
    title: "Rain Date",
    description:
      "Sunday, May 24, 2026 · 11:00 AM-12:00 PM. An update will be shared by 9:00 AM if the rain date is used.",
  },
  {
    title: "Investment",
    description:
      "$30 in advance. Day-of-event pricing will be $35 if space is still available.",
  },
] as const;

export default function SacredSoundsUnderTheSkyPage() {
  return (
    <PageShell
      eyebrow="Outdoor Sound Bath"
      title="Sacred Sounds Under the Sky"
      description="An outdoor sound bath experience designed to help you rest, reset, and receive while surrounded by nature, open sky, and healing frequencies."
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Outdoor Gathering
          </span>
          <h2 className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-[0.96] tracking-[-0.02em]">
            A gentle outdoor sound bath to help you exhale, soften, and come back to yourself.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            Sacred Sounds Under the Sky is an open-air sound bath experience
            held at The Lightness Grounds in Bayport. It is meant to offer a
            simple, welcoming space to pause, breathe, and receive healing
            frequencies outdoors beneath the sky.
          </p>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Come as you are. No experience is needed, just an open heart and a
            willingness to let yourself be supported by sound, fresh air, and a
            calm shared atmosphere.
          </p>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Dress in layers to help you stay warm and comfortable, and bring a
            yoga mat, blanket, or anything else that helps you settle in
            easily. The gathering takes place at The Lightness Grounds, on the
            corner of Gillette Avenue and Academy Street.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <form action="/api/checkout/event" method="post">
              <input
                type="hidden"
                name="eventSlug"
                value="sacred-sounds-under-the-sky"
              />
              <button type="submit" className="button-pill">
                Purchase Ticket
              </button>
            </form>
            <Link href={site.links.events} className="button-pill">
              Back to Events
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto w-full max-w-[20rem]">
            <img
              src="/homepage-images/sacred-sounds-outdoor.jpeg"
              alt="Outdoor sound bath setup for Sacred Sounds Under the Sky"
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

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Good to Know
          </span>
          <h2 className="font-display text-[clamp(2.3rem,5vw,3.5rem)] leading-[0.98] tracking-[-0.02em]">
            Rest outdoors, breathe deeply, and let the experience meet you gently.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            We will be outside soaking in the fresh air, open sky, and good
            energy. This is a fully outdoor gathering with no bathroom
            facilities on site, so it is best to come prepared to stay warm,
            comfortable, and at ease for the full experience.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Before you come
          </strong>
          <ul className="mt-4 grid gap-3 text-[var(--color-muted)]">
            <li>All are welcome</li>
            <li>No previous experience is needed</li>
            <li>Dress in layers and bring a yoga mat, blanket, or any other comfort items</li>
            <li>The Lightness Grounds is located on the corner of Gillette Avenue and Academy Street</li>
            <li>No bathroom facilities are available on site</li>
            <li>If weather shifts, a rain-date update will be shared by 9:00 AM</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
