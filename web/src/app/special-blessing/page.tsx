import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const offerings = [
  {
    title: "Mother Blessingways",
    description:
      "Sacred gatherings created to honor pregnancy, motherhood, and the emotional threshold of welcoming new life.",
  },
  {
    title: "Baby Blessings",
    description:
      "Gentle, heart-centered ceremonies to celebrate a child, welcome their arrival, and bless the season ahead.",
  },
  {
    title: "Home Clearings & Blessings",
    description:
      "Energetic support for homes and spaces that are ready to feel lighter, clearer, and more intentionally held.",
  },
  {
    title: "Custom Rituals & Ceremonies",
    description:
      "Personalized ceremonies for life transitions, sacred thresholds, remembrance, celebration, and meaningful gathering.",
  },
] as const;

const details = [
  "Each gathering is personalized to the moment, people, and intention being honored",
  "Offerings may include ritual design, blessing elements, sound, Reiki, prayer, or intuitive support",
  "Available for private clients, families, intimate groups, and select community collaborations",
  "Inquiries begin with a conversation so the ceremony can be shaped with care",
] as const;

export default function SpecialBlessingPage() {
  return (
    <PageShell
      eyebrow="Private Events & Ceremonies"
      title="Sacred ceremonies, blessings, and meaningful gatherings created with intention."
      description="From mother blessingways and baby blessings to home clearings and custom rituals, these offerings are designed to honor life transitions in a way that feels personal, held, and deeply aligned."
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Personalized Sacred Gatherings
          </span>
          <h2 className="display-section-title">
            Ritual support for the moments that deserve to be honored with care.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            These offerings are created for individuals, families, and small groups
            who want something more personal than a standard event. Whether you are
            celebrating, transitioning, welcoming, grieving, or blessing a new chapter,
            Kate works intuitively to shape a gathering that feels meaningful and true.
          </p>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Some ceremonies are soft and intimate. Others are spacious, communal, and
            woven with sound, prayer, energy work, or ritual elements. The heart of the
            experience is always the same: to help people feel held inside an important moment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact?inquiryType=events&subject=Private%20Event%20or%20Ceremony%20Inquiry&draft=Hi%20Kate%2C%20I%27m%20interested%20in%20creating%20a%20private%20event%20or%20ceremony.%20Here%27s%20what%20I%27m%20envisioning%3A"
              className="button-pill"
            >
              Inquire About a Ceremony
            </Link>
            <Link href={site.links.events} className="button-pill">
              Back to Events
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto w-full max-w-[20rem]">
            <img
              src="/homepage-images/private-events-ceremony.jpeg"
              alt="Private outdoor ceremony led by Kate"
              className="block h-auto w-full rounded-[32px] object-contain object-center"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {offerings.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <h3 className="display-card-title">
              {item.title}
            </h3>
            <p className="mt-4 text-[var(--color-muted)]">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            What to Expect
          </span>
          <h2 className="display-section-title">
            A ceremony that is shaped around the meaning of your moment.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Every private gathering begins with a conversation. From there, Kate
            listens for the emotional and spiritual heart of what is being asked for
            and helps shape a ceremony that feels grounded, personal, and intentional.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Good to know
          </strong>
          <ul className="mt-4 grid gap-3 text-[var(--color-muted)]">
            {details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
