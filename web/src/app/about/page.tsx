import Link from "next/link";
import { BookingCard } from "@/components/booking-card";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const whyChooseKate = [
  "Extensive training with over nine years of professional experience across healing modalities.",
  "A holistic approach that combines energy healing, hypnotherapy, sound therapy, and spiritual support.",
  "Personalized care tailored to your unique needs and healing goals.",
  "A safe and nurturing environment where you are seen, heard, and supported.",
] as const;

const credentials = [
  "B.A. in Psychology",
  "M.A. in Childhood Education",
  "Usui Ryoho Reiki Master Teacher",
  "Holy Fire® III Reiki Master Teacher",
  "Animal & Pet Reiki Master Teacher",
  "Sekhem Energy Master",
  "Certified & Registered Clinical Hypnotherapist & Regression Therapist",
  "Certified Past Life Regression Therapist",
  "Trauma-Informed Practitioner",
  "Seraphim Blueprint Level 2 Practitioner",
  "Integrated Energy Therapy (IET) Basic Practitioner",
  "200-Hour Yoga Teacher Training",
  "Certified Yin Yoga Instructor",
  "Certified Restorative Yoga Instructor",
  "Certified Dharma Wheel Yoga Instructor",
  "Gong and Sound Resonance Teacher & Practitioner",
  "Ordained Minister",
] as const;

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About Kate"
      title="Meet the healer and guide behind The Lightness of Being."
      description="Discover the path of Kate Gajewski, a healer and guide whose work blends energy medicine, sound healing, hypnotherapy, and grounded personal care in Patchogue, New York."
    >
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(180deg,rgba(255,250,245,0.96),rgba(243,232,222,0.92))] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-8">
          <img
            src="/homepage-images/about-pinkbowlsmile.jpeg"
            alt="Kate smiling with singing bowls"
            className="block h-auto max-h-[36rem] w-full rounded-[24px] object-contain object-center"
          />
        </div>

        <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <h2 className="font-display text-[clamp(2.5rem,5vw,3.8rem)] leading-[0.96] tracking-[-0.02em]">
            Healing that feels both spiritual and embodied.
          </h2>
          <p className="mt-5 text-[var(--color-muted)]">
            Kate Gajewski is a healer and guide whose work is rooted in
            intuition, energy medicine, and grounded presence. Through Reiki,
            sound healing, hypnotherapy, and holistic support, she creates
            deeply personal experiences that help clients release heaviness,
            reconnect to their inner light, and return to themselves.
          </p>
          <p className="mt-4 text-[var(--color-muted)]">
            The Lightness of Being is built around the belief that healing begins
            when you feel safe enough to soften. Each session is intentional and
            responsive to what you most need in the moment rather than forcing a
            one-size-fits-all process.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={site.links.courses}
              className="button-pill"
            >
              Explore Programs
            </Link>
            <Link
              href={site.links.calendly}
              className="button-pill"
            >
              Book a Session
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.9),rgba(239,229,217,0.86))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Kate&apos;s Path
            </span>
            <h2 className="max-w-[18ch] font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-[0.98] tracking-[-0.02em]">
              Rooted in devotion, shaped by study, and guided by lived experience.
            </h2>
            <p className="mt-5 max-w-[42rem] text-[var(--color-muted)]">
              For years, Reiki was quietly calling Kate long before she fully said
              yes to it. Even with that inner pull, she was skeptical at first. But
              once she experienced Reiki for herself, it changed her world. It
              supported her healing in countless ways, opened her mind to a world of
              deeper possibility, and helped uncover a more authentic relationship
              with who she truly is.
            </p>
            <p className="mt-4 max-w-[42rem] text-[var(--color-muted)]">
              Inspired by how profoundly Reiki transformed her own life, Kate
              devoted herself to the path of healing, study, and service. Her work
              is now rooted in helping women remember who they truly are beneath the
              noise, the conditioning, and the heaviness they may be carrying.
            </p>
            <p className="mt-4 max-w-[42rem] text-[var(--color-muted)]">
              Along the way, Kate became a Reiki Master in both Usui Ryoho and Holy
              Fire, trained in Animal and Pet Reiki, Gong and Sound Resonance,
              Clinical Hypnosis and Regression Therapy, and yoga, while also drawing
              from a background in psychology, childhood education, and
              community-centered healing work. The result is an approach that is
              both intuitive and grounded: spiritual without losing practical care,
              and deeply personal without ever becoming performative.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[19rem] overflow-hidden rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,248,242,0.8)] p-3">
            <img
              src="/homepage-images/contact-buddha.jpeg"
              alt="A grounding Buddha detail in the healing space"
              className="block h-auto w-full rounded-[22px] object-contain object-center"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.9),rgba(239,229,217,0.86)),linear-gradient(0deg,rgba(248,242,235,0.52),rgba(248,242,235,0.52)),url('https://storage.googleapis.com/msgsndr/UjW44wJD5eUk7BCDEe2Z/media/68353a2c66829d893e8f2029.webp')] bg-cover bg-center p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Why Choose Kate
        </span>
        <div className="grid gap-4 md:grid-cols-2">
          {whyChooseKate.map((item) => (
            <div
              key={item}
              className="rounded-[22px] bg-[rgba(255,251,246,0.82)] p-5 text-[var(--color-text)] shadow-[0_12px_32px_rgba(59,41,31,0.08)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Training & Background
        </span>
        <h2 className="max-w-[18ch] font-display text-[clamp(2.2rem,5vw,3.2rem)] leading-[0.98] tracking-[-0.02em]">
          Deeply intuitive work, supported by years of study and practice.
        </h2>
        <ul className="mt-6 grid gap-x-8 gap-y-3 md:grid-cols-2">
          {credentials.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 border-b border-[rgba(76,58,48,0.08)] pb-3 text-[var(--color-text)]"
            >
              <span className="mt-[0.45rem] h-1.5 w-1.5 flex-none rounded-full bg-[rgba(93,81,72,0.8)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <BookingCard />
    </PageShell>
  );
}
