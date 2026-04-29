import Link from "next/link";
import { site } from "@/lib/site";

const offerings = [
  {
    title: "Reiki & Energy Healing",
    description:
      "Utilizing Reiki and other energy healing modalities to clear blockages, restore balance, and support emotional and spiritual well-being.",
    href: `${site.links.services}#reiki-energy-healing`,
    cta: "View Sessions",
  },
  {
    title: "Hypnotherapy & Regression Therapy",
    description:
      "Including hypnotherapy, age regression, and past life regression to uncover patterns, release what is holding you back, and reconnect with your truth.",
    href: `${site.links.services}#hypnotherapy-regression`,
    cta: "View Sessions",
  },
  {
    title: "Sound Healing & Sacred Sessions",
    description:
      "Immersive sound healing experiences that soothe the nervous system, invite deep restoration, and support emotional release.",
    href: `${site.links.services}#sound-healing`,
    cta: "View Sessions",
  },
] as const;

const trustPoints = [
  {
    title: "Integrative Healing Guide",
    detail: "Blending Reiki, sound, and subconscious healing.",
  },
  {
    title: "Private Sessions",
    detail: "One-on-one care tailored to your needs.",
  },
  {
    title: "Patchogue, New York",
    detail: "Local in-person sanctuary space.",
  },
  {
    title: "Calm, Personal Care",
    detail: "Gentle, intuitive, and heart-centered approach.",
  },
] as const;

const testimonials = [
  {
    quote:
      "Kate is magic! My reiki session today was deeply grounding and brought clarity I did not even know I needed.",
    name: "Lindsey Cacy",
    featured: true,
  },
  {
    quote:
      "Kate truly makes you feel safe and comfortable.",
    name: "Amanda Pereira",
    featured: false,
  },
  {
    quote:
      "I am relaxed and peaceful beyond words. Best session I ever had.",
    name: "Michael Connors",
    featured: false,
  },
] as const;

const secondaryPaths = [
  {
    title: "Coaching & Mentorship",
    description:
      "Support for those seeking deeper guidance, spiritual growth, and a more intentional relationship with themselves and their path.",
    href: site.links.mentorship,
    cta: "Explore Mentorship",
  },
  {
    title: "Reiki Training & Education",
    description:
      "Learn Reiki, deepen your practice, and grow through trainings designed for both personal healing and practitioner development.",
    href: site.links.reikiTraining,
    cta: "Explore Training",
  },
  {
    title: "Events & Workshops",
    description:
      "Join sacred gatherings, sound baths, and community experiences that create connection and restoration.",
    href: site.links.events,
    cta: "View Events",
  },
  {
    title: "Corporate Wellness",
    description:
      "Bring grounding, restoration, and mindful support into your workplace with curated wellness experiences.",
    href: site.links.corporateWellness,
    cta: "Learn More",
  },
] as const;

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
      <div>
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {eyebrow}
        </span>
        <h2 className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-[0.96] tracking-[-0.02em]">
          {title}
        </h2>
      </div>
      <p className="max-w-[38rem] text-[var(--color-muted)] lg:ml-auto">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  const featuredTestimonial = testimonials.find((item) => item.featured);

  return (
    <main className="relative flex min-h-[calc(100vh-82px)] flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top_center,_rgba(230,194,162,0.42),_rgba(230,194,162,0.16)_32%,_rgba(230,194,162,0.06)_48%,_transparent_72%)] blur-[6px]" />

      <section className="mx-auto flex w-full max-w-[1180px] flex-col px-4 py-16 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Energy Healing with Kate Gajewski
            </span>
            <h1 className="max-w-[10ch] font-display text-[clamp(3.5rem,8vw,6.2rem)] leading-[0.96] tracking-[-0.02em]">
              Come home to yourself.
            </h1>
            <p className="mt-5 max-w-[36rem] text-[1.08rem] text-[var(--color-muted)]">
              Step into a sacred space where intuition leads and healing
              unfolds. Through Reiki, hypnotherapy, sound therapy, and holistic
              practices, Kate gently guides you back to your essence: light,
              whole, and aligned.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={site.links.services}
                className="button-pill"
              >
                Book a Session
              </Link>
              <Link
                href={site.links.courses}
                className="button-pill"
              >
                Explore Programs
              </Link>
            </div>

            <p className="mt-5 text-[0.95rem] text-[var(--color-muted)]">
              Based in Patchogue, New York. Offering deeply personal 1:1
              sessions, sacred support, and transformational care.
            </p>
          </div>

          <div className="relative min-h-[620px] overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,rgba(88,72,62,0.1),rgba(88,72,62,0.24)),url('/homepage-images/hero-img-0509.jpeg')] bg-cover bg-center shadow-[0_24px_80px_rgba(59,41,31,0.08)] max-md:min-h-[420px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,247,240,0.3),_transparent_30%),linear-gradient(180deg,rgba(255,251,247,0.06),rgba(62,46,38,0.28))]" />
            <div className="absolute bottom-6 left-6 max-w-[280px] rounded-[22px] border border-[rgba(255,255,255,0.4)] bg-[rgba(255,249,244,0.74)] p-5 shadow-[0_16px_36px_rgba(44,31,25,0.14)] backdrop-blur-[14px]">
              <strong className="mb-1 block text-base">Private 1:1 Sessions</strong>
              <span className="text-[0.92rem] text-[var(--color-muted)]">
                Grounded support for stress, emotional heaviness, transition,
                and energetic renewal.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-5 pt-0 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1180px] gap-4 rounded-[22px] border border-[rgba(92,85,73,0.08)] bg-[rgba(168,178,159,0.16)] p-[1.15rem] md:grid-cols-2 xl:grid-cols-4">
          {trustPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-[14px] bg-[rgba(255,252,248,0.55)] px-4 py-4 text-center"
            >
              <strong className="mb-1 block text-[1.02rem]">{point.title}</strong>
              <span className="text-[0.9rem] text-[var(--color-muted)]">
                {point.detail}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="offerings" className="px-4 py-9 sm:px-6">
        <div className="mx-auto w-full max-w-[1180px]">
          <SectionHeading
            eyebrow="Healing Offerings"
            title="Choose the support that meets you where you are."
            description="Explore the private sessions and deeper support available through The Lightness of Being."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {offerings.map((offering) => (
              <article
                key={offering.title}
                className="rounded-[22px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(180deg,rgba(255,252,248,0.85),rgba(250,243,236,0.92))] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
              >
                <div className="mb-5 h-12 w-12 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fefaf4,rgba(255,255,255,0.15)),linear-gradient(135deg,rgba(168,178,159,0.7),rgba(201,159,146,0.75))]" />
                <h3 className="font-display text-[2rem] leading-none tracking-[-0.02em]">
                  {offering.title}
                </h3>
                <p className="mb-5 mt-3 text-[var(--color-muted)]">
                  {offering.description}
                </p>
                <Link
                  href={offering.href}
                  className="font-bold text-[var(--color-accent,#5d5148)]"
                >
                  {offering.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-4 pb-0 pt-10 sm:px-6">
        <div className="mx-auto w-full max-w-[1180px] rounded-[38px] bg-[rgba(255,250,245,0.72)] p-5 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(180deg,rgba(255,250,245,0.96),rgba(243,232,222,0.92))] p-6 sm:p-8">
              <img
                src="/homepage-images/about-pinkbowlsmile.jpeg"
                alt="Kate smiling with singing bowls"
                className="block h-auto max-h-[32rem] w-full rounded-[24px] object-contain object-center"
              />
            </div>
            <div className="flex flex-col justify-center px-4 py-6 sm:px-8">
              <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Meet Kate
              </span>
              <h2 className="font-display text-[clamp(2.8rem,5vw,4rem)] leading-[0.96] tracking-[-0.02em]">
                Healing begins where safety allows you to soften.
              </h2>
              <p className="mt-5 max-w-[34rem] text-[var(--color-muted)]">
                Kate Gajewski is a healer and guide whose work blends intuition,
                energy medicine, sound healing, hypnotherapy, and grounded
                presence. She offers deeply personal experiences that help
                clients release heaviness, reconnect with their inner light, and
                return to themselves.
              </p>
              <p className="mt-4 max-w-[34rem] text-[var(--color-muted)]">
                Each session is intentional, intuitive, and tailored to what is
                most needed in the moment.
              </p>
              <div className="mt-6">
                <Link
                  href={site.links.about}
                  className="button-pill"
                >
                  Read Kate&apos;s story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-0 pt-12 sm:px-6">
        <div className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.9),rgba(239,229,217,0.86)),linear-gradient(0deg,rgba(248,242,235,0.52),rgba(248,242,235,0.52)),url('/homepage-images/space-detail-2.jpeg')] bg-cover bg-center p-8 sm:p-14">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            A Place To Begin
          </span>
          <h2 className="relative z-[1] mb-4 max-w-[11ch] font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.96] tracking-[-0.02em]">
            Support for the moments that ask more of you.
          </h2>
          <p className="relative z-[1] max-w-[42rem] text-[1.04rem] text-[var(--color-muted)]">
            Whether you are moving through stress, grief, transition, spiritual
            awakening, or simply the feeling that something within you is ready
            for deeper care, this work offers a place to soften, reset, and come
            back into alignment.
          </p>
        </div>
      </section>

      <section className="px-4 pb-0 pt-8 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1180px] gap-5 md:grid-cols-3">
          <Link
            href={site.links.services}
            className="group overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)] transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="min-h-[270px] bg-[linear-gradient(180deg,rgba(88,72,62,0.08),rgba(88,72,62,0.16)),url('/homepage-images/healing-session.jpeg')] bg-cover bg-center" />
            <div className="p-5">
              <span className="mb-2 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Private Sessions
              </span>
              <p className="text-[var(--color-muted)]">
                Explore 1:1 healing sessions designed to help you soften, release, and come back into alignment.
              </p>
            </div>
          </Link>

          <Link
            href={site.links.events}
            className="group overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)] transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="min-h-[270px] bg-[linear-gradient(180deg,rgba(88,72,62,0.08),rgba(88,72,62,0.16)),url('/homepage-images/moodysound.jpeg')] bg-cover bg-center" />
            <div className="p-5">
              <span className="mb-2 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Sound Baths & Events
              </span>
              <p className="text-[var(--color-muted)]">
                Join gatherings and sound experiences that bring restoration, ritual, and community into the work.
              </p>
            </div>
          </Link>

          <Link
            href={site.links.courses}
            className="group overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)] transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="min-h-[270px] bg-[linear-gradient(180deg,rgba(88,72,62,0.08),rgba(88,72,62,0.16)),url('/homepage-images/space-detail-2.jpeg')] bg-cover bg-center" />
            <div className="p-5">
              <span className="mb-2 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Training, Coaching & Mentorship
              </span>
              <p className="text-[var(--color-muted)]">
                Deepen your practice through Reiki education, mentorship, and pathways for personal and practitioner growth.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="px-4 pb-0 pt-12 sm:px-6">
        <div className="mx-auto w-full max-w-[1180px]">
          {featuredTestimonial ? (
            <article className="rounded-[22px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
              <p className="mb-4 max-w-[32rem] font-display text-[clamp(2rem,4vw,2.8rem)] leading-[1.08]">
                “{featuredTestimonial.quote}”
              </p>
              <span className="text-[var(--color-muted)]">
                {featuredTestimonial.name}
              </span>
            </article>
          ) : null}
        </div>
      </section>

      <section id="book" className="px-4 py-16 sm:px-6">
        <div className="mx-auto w-full max-w-[1180px] rounded-[44px] bg-[radial-gradient(circle_at_top_center,rgba(221,202,183,0.3),transparent_35%),linear-gradient(135deg,#6d5c52,#4a3d37)] px-8 py-16 text-center text-[#fffaf6] shadow-[0_28px_80px_rgba(62,47,40,0.22)]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[rgba(255,248,241,0.72)]">
            Begin Here
          </span>
          <h2 className="font-display text-[clamp(2.8rem,5vw,4.6rem)] leading-[0.96] tracking-[-0.02em]">
            Your healing begins with one step.
          </h2>
          <p className="mx-auto mb-6 mt-4 max-w-[36rem] text-[rgba(255,248,241,0.82)]">
            If you&apos;ve been craving clarity, peace, and a deeper connection to
            yourself, this is your invitation to begin.
          </p>
          <Link
            href={site.links.services}
            className="button-pill"
          >
            Book a Session
          </Link>
        </div>
      </section>
    </main>
  );
}
