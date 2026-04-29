import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const offerings = [
  {
    title: "Corporate Sound Baths",
    description:
      "Restorative sound experiences designed to help teams decompress, reset, and return to work with more clarity and steadiness.",
  },
  {
    title: "Group Guided Meditations",
    description:
      "Grounding guided meditation experiences that support stress relief, presence, and a more regulated workplace atmosphere.",
  },
  {
    title: "Yoga Classes & Team Gatherings",
    description:
      "Customized yoga and wellness offerings for offices, leadership retreats, staff appreciation events, and community spaces.",
  },
] as const;

const details = [
  "Offerings can be tailored for small teams, larger groups, wellness events, and retreats",
  "Experiences may include sound baths, guided meditation, yoga, grounding practices, and intentional facilitation",
  "Available for on-site gatherings and select off-site collaborations",
  "Each inquiry begins with a conversation so the experience can be shaped around your goals",
] as const;

export default function CorporateWellnessPage() {
  return (
    <PageShell
      eyebrow="Corporate Wellness"
      title="Grounding, restorative experiences for teams, workplaces, and intentional gatherings."
      description="Corporate wellness offerings are designed to bring more calm, presence, and meaningful care into the workplace through sound baths, guided meditation, yoga, and supportive experiences tailored to the environment."
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Tailored Team Support
          </span>
          <h2 className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-[0.96] tracking-[-0.02em]">
            Wellness experiences that help people soften, reconnect, and return to themselves inside the workplace.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            These offerings are designed for teams, workplaces, retreats, and
            community organizations that want something more intentional than a
            standard wellness add-on. Corporate sound baths, guided meditations,
            yoga classes, and restorative facilitation can help create a deeper
            sense of ease, steadiness, and collective reset.
          </p>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Whether you are planning a one-time event or looking for a meaningful
            wellness element inside a larger gathering, Kate works collaboratively
            to shape the experience around your people, space, and intention so it
            feels both supportive and beautifully held.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact?inquiryType=corporate&subject=Corporate%20Wellness%20Inquiry&draft=Hi%20Kate%2C%20I%27m%20interested%20in%20a%20corporate%20wellness%20offering.%20Here%27s%20a%20little%20about%20our%20team%2C%20event%2C%20or%20workplace%3A"
              className="button-pill"
            >
              Inquire About Corporate Wellness
            </Link>
            <Link href={site.links.events} className="button-pill">
              Back to Events
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto w-full max-w-[20rem]">
            <img
              src="/homepage-images/corporate-wellness.jpeg"
              alt="Sound bath setup for a group wellness experience"
              className="block h-auto w-full rounded-[32px] object-contain object-center"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {offerings.map((item) => (
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
            What to Expect
          </span>
          <h2 className="font-display text-[clamp(2.3rem,5vw,3.5rem)] leading-[0.98] tracking-[-0.02em]">
            A customized experience shaped around the energy, pace, and needs of your group.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Each corporate wellness offering begins with a conversation about
            your team, setting, timeline, and intention. From there, the
            experience can be tailored to feel grounding, accessible, and truly
            supportive for the people in the room, whether the goal is stress relief,
            connection, appreciation, or simply a more meaningful pause in the day.
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
