import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({ title: "About Kate Gajewski, Holistic Practitioner & Teacher", description: "Meet Kate Gajewski, a Patchogue-based Reiki Master Teacher, sound healing practitioner, clinical hypnotherapist, yoga teacher, and holistic mentor.", path: "/about", image: "/homepage-images/about-roses-kate-flipped.jpeg" });

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
      title="Meet the practitioner behind The Lightness of Being."
      description="Discover the path of Kate Gajewski, a holistic practitioner, teacher, and mentor whose work integrates energy medicine, sound healing, and hypnotherapy, offering deeply personalized support both in-person in Patchogue, New York, and remotely."
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
          <h2 className="display-section-title">
            Healing that feels both spiritual and embodied.
          </h2>
          <p className="mt-5 text-[var(--color-muted)]">
            This work isn&apos;t about fixing, it&apos;s about being met where
            you are.
          </p>
          <p className="mt-4 text-[var(--color-muted)]">
            Each session is guided by what&apos;s present in the moment,
            blending Reiki, sound healing, hypnotherapy, and intuitive support
            in a way that allows the body to soften and the mind to settle.
          </p>
          <p className="mt-4 text-[var(--color-muted)]">
            The Lightness of Being is built on the belief that healing begins
            when you feel safe enough to soften. There is no rigid structure
            and no one-size-fits-all approach, only intentional, responsive
            care that meets you where you are.
          </p>
        </div>
      </div>

      <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.9),rgba(239,229,217,0.86))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Kate&apos;s Path
            </span>
            <h2 className="max-w-[22ch] display-section-title">
              Rooted in devotion, shaped by study, and guided by lived experience.
            </h2>
            <p className="mt-5 max-w-[42rem] text-[var(--color-muted)]">
              For years, Reiki was quietly calling Kate long before she fully
              said yes to it. Even with that inner pull, she was initially
              skeptical, but once she experienced Reiki for herself, everything
              shifted. It supported her healing in profound ways, expanded her
              perspective, and deepened her connection to who she truly is.
            </p>
            <p className="mt-4 max-w-[42rem] text-[var(--color-muted)]">
              That experience led her to devote herself fully to the path of
              healing, study, and service. Today, her work supports women in
              reconnecting to themselves beneath the noise, conditioning, and
              patterns they&apos;ve been carrying.
            </p>
            <p className="mt-4 max-w-[42rem] text-[var(--color-muted)]">
              Kate is a Reiki Master in both Usui Ryoho and Holy Fire®, with
              advanced training in sound healing, clinical hypnotherapy,
              regression work, and yoga. Combined with her background in
              psychology, education, and community-centered healing, her
              approach is both intuitive and grounded, spiritual without losing
              structure, and deeply personal without ever becoming
              performative.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[19rem] overflow-hidden rounded-[28px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,248,242,0.8)] p-3">
            <img
              src="/homepage-images/portal-login-handsup.jpeg"
              alt="Kate in her healing space"
              className="block h-auto w-full rounded-[22px] object-contain object-center"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.9),rgba(239,229,217,0.86)),linear-gradient(0deg,rgba(248,242,235,0.52),rgba(248,242,235,0.52)),url('/homepage-images/ghl-healing-session.webp')] bg-cover bg-center p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Why Work With Kate
        </span>
        <h2 className="max-w-[22ch] display-section-title">
          Refined, personalized care for those seeking depth and real change.
        </h2>
        <p className="mt-5 max-w-[46rem] text-[var(--color-muted)]">
          Each session is thoughtfully designed around you, your needs, your
          pace, and what is present in the moment. Blending energy work,
          hypnotherapy, and sound healing, Kate offers a high-touch,
          integrative approach within a space that is both grounded and deeply
          supportive.
        </p>
        <p className="mt-4 max-w-[46rem] text-[var(--color-muted)]">
          With over nine years of experience, her work is known for its depth,
          intention, and ability to create lasting shifts, without force,
          pressure, or performance.
        </p>
      </div>

      <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Training & Background
        </span>
        <h2 className="max-w-[22ch] display-section-title">
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
    </PageShell>
  );
}
