import Link from "next/link";
import { BookingCard } from "@/components/booking-card";
import { PageShell } from "@/components/page-shell";

const serviceSections = [
  {
    id: "reiki-energy-healing",
    eyebrow: "Reiki & Energy Healing",
    title: "Support for rest, reset, and energetic renewal.",
    description:
      "These sessions are best for those seeking Reiki, deeper energetic support, or gentle care for children.",
    explanation:
      "Reiki and energy healing work gently with the body, mind, and energy field to support relaxation, emotional balance, and a return to greater steadiness and flow.",
    services: [
      {
        title: "Rest & Receive",
        description:
          "A 60-minute Reiki and energy healing session to help you pause, soften, and receive support for nervous system regulation, energetic balance, and restoration.",
        href: "https://calendly.com/thelightnessofbeing/restandreceiveenergy",
        cta: "Book Rest & Receive",
      },
      {
        title: "Return to Self: Sacred Reset",
        description:
          "A two-hour guided healing experience that blends spiritual guidance, life coaching, Holy Fire healing, and Reiki to help you release, realign, and return to yourself.",
        href: "https://calendly.com/thelightnessofbeing/sacredreset",
        cta: "Book Sacred Reset",
      },
      {
        title: "Gentle Energy Support (for Children)",
        description:
          "A calm and nurturing 30-minute energy healing session designed to support children with emotional balance, relaxation, grounding, and gentle overall well-being.",
        href: "https://calendly.com/thelightnessofbeing/childrensreiki",
        cta: "Book Gentle Energy Support",
      },
    ],
  },
  {
    id: "hypnotherapy-regression",
    eyebrow: "Hypnotherapy & Regression",
    title: "Subconscious work for clarity, release, and deeper understanding.",
    description:
      "This offering is ideal for those ready to explore root patterns, beliefs, and the deeper layers shaping their present experience.",
    explanation:
      "Hypnotherapy and regression create a guided, relaxed state where the subconscious becomes more accessible, helping you understand patterns, shift beliefs, and uncover deeper insight.",
    services: [
      {
        title: "The Inner Journey",
        description:
          "A guided hypnotherapy and regression session designed to help you explore the subconscious, uncover root patterns, and support deep inner healing and recalibration.",
        href: "https://calendly.com/thelightnessofbeing/innerjourney",
        cta: "Book The Inner Journey",
      },
    ],
  },
  {
    id: "sound-healing",
    eyebrow: "Sound Healing",
    title: "Immersive sound support for restoration and nervous system softening.",
    description:
      "Private sound offerings are designed to help you settle deeply, receive, and be held inside a restorative sonic experience.",
    explanation:
      "Sound healing uses soothing frequencies and instruments like crystal bowls, gong, and chimes to calm the nervous system, invite rest, and support emotional and energetic release.",
    services: [
      {
        title: "Private Sound Immersion",
        description:
          "A private sound healing experience using crystal bowls, gong, chimes, and other instruments to calm the nervous system, support energetic release, and invite deep restoration.",
        href: "https://calendly.com/thelightnessofbeing/private-sound-healing",
        cta: "Book Sound Immersion",
      },
    ],
  },
  {
    id: "guidance-mentorship",
    eyebrow: "Guidance & Mentorship",
    title: "One-on-one support for clarity, growth, and deeper direction.",
    description:
      "This session is for those seeking guidance, coaching, Reiki mentorship, or sound support in a more conversational one-on-one format.",
    explanation:
      "Guidance sessions are more conversational and insight-based, offering space for reflection, practical clarity, spiritual support, and mentorship that meets you where you are.",
    services: [
      {
        title: "Personalized Guidance",
        description:
          "A one-on-one session for clarity, direction, and grounded support through coaching, Reiki mentorship, or sound guidance.",
        href: "https://calendly.com/thelightnessofbeing/mentorship",
        cta: "Book Personalized Guidance",
      },
    ],
  },
] as const;

export default function ServicesPage() {
  return (
    <PageShell
      eyebrow="Services"
      title="Healing support for where you are right now."
      description="Explore the private 1:1 offerings available through The Lightness of Being, each designed to meet you with care, clarity, and the support that feels right for this season of your life."
    >
      <div className="grid gap-8">
        {serviceSections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-28 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10"
          >
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {section.eyebrow}
            </span>
            <h2 className="font-display text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.98] tracking-[-0.02em]">
              {section.title}
            </h2>
            <p className="mt-4 max-w-[42rem] text-[var(--color-muted)]">
              {section.description}
            </p>
            <p className="mt-3 max-w-[48rem] text-[var(--color-muted)]">
              {section.explanation}
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {section.services.map((service) => (
                <article
                  key={service.title}
                  className="rounded-[22px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(180deg,rgba(255,252,248,0.85),rgba(250,243,236,0.92))] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
                >
                  <div className="mb-5 h-12 w-12 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fefaf4,rgba(255,255,255,0.15)),linear-gradient(135deg,rgba(168,178,159,0.7),rgba(201,159,146,0.75))]" />
                  <h3 className="font-display text-[2rem] leading-none tracking-[-0.02em]">
                    {service.title}
                  </h3>
                  <p className="mb-5 mt-3 text-[var(--color-muted)]">
                    {service.description}
                  </p>
                  <Link href={service.href} className="font-bold text-[#5d5148]">
                    {service.cta}
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-8">
        <p className="mb-5 max-w-2xl text-[var(--color-muted)] sm:mb-6">
          Experience the relaxing, cozy vibes of The Lightness of Being.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <img
              src="/homepage-images/services-reikikid.jpeg"
              alt="Gentle Reiki support for a child"
              className="block h-[16rem] w-full object-cover object-center"
            />
          </div>
          <div className="overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <img
              src="/homepage-images/services-thevibe.jpeg"
              alt="Calm healing atmosphere"
              className="block h-[16rem] w-full object-cover object-center"
            />
          </div>
          <div className="overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <img
              src="/homepage-images/services-gasho.jpeg"
              alt="Hands in prayer at the start of a healing session"
              className="block h-[16rem] w-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      <BookingCard />
    </PageShell>
  );
}
