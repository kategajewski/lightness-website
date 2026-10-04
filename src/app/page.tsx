import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Holistic Healing, Training & Wellness in Patchogue, NY",
  description: "Explore Reiki, energy healing, hypnotherapy, sound healing, yoga, training, mentorship, events, corporate wellness, ceremonies, and sacred goods with Kate Gajewski.",
  path: "/",
  image: "/homepage-images/about-pinkbowlsmile.jpeg",
});

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

export default function Home() {
  const featuredTestimonial = testimonials.find((item) => item.featured);

  return (
    <main className="relative flex min-h-[calc(100vh-82px)] flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div aria-hidden="true" className="brand-home-glow pointer-events-none absolute inset-x-0 top-0 h-[40rem]" />

      <section className="relative mx-auto flex w-full max-w-[1180px] flex-col px-4 pb-5 pt-8 sm:px-6 sm:pb-10 sm:pt-12">
        <div className="grid items-start gap-7 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="brand-eyebrow mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em]">
              Energy Healing with Kate Gajewski
            </span>
            <h1 className="max-w-[10ch] display-page-title">
              Come home to yourself.
            </h1>
            <p className="mt-5 max-w-[36rem] text-[1.08rem] text-[var(--color-muted)]">
              Step into a sacred space where intuition leads and healing
              unfolds. Through Reiki, hypnotherapy, sound therapy, and holistic
              practices, Kate gently guides you back to your essence: light,
              whole, and aligned.
            </p>
            <p className="mt-4 max-w-[36rem] text-[1.02rem] text-[var(--color-muted)]">
              Located in Patchogue, New York, with sessions available remotely.
              1:1 sessions designed for support, clarity, and transformation.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
              <Link
                href={site.links.services}
                className="button-pill"
              >
                Book a Session
              </Link>
              <Link
                href={site.links.courses}
                className="button-pill button-pill-secondary"
              >
                Explore Programs
              </Link>
            </div>
          </div>

          <div className="relative min-h-[540px] overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(88,72,62,0.02),rgba(88,72,62,0.08)),url('/homepage-images/about-pinkbowlsmile.jpeg')] bg-cover bg-[position:80%_center] shadow-[0_24px_80px_rgba(59,41,31,0.08)] max-md:min-h-[340px] sm:rounded-[34px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,247,240,0.14),_transparent_30%),linear-gradient(180deg,rgba(255,251,247,0.02),rgba(62,46,38,0.1))]" />
          </div>
        </div>
      </section>

      <section className="px-4 pb-0 pt-5 sm:px-6 sm:pt-8">
        <div className="brand-intro mx-auto w-full max-w-[1180px] overflow-hidden rounded-[26px] border px-6 py-8 sm:rounded-[30px] sm:px-10 sm:py-12 lg:px-14">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <span className="brand-eyebrow mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em]">
                A Place To Begin
              </span>
              <h2 className="relative z-[1] max-w-[14ch] display-section-title">
                Choose the kind of support you&apos;re looking for.
              </h2>
            </div>
            <p className="relative z-[1] max-w-[36rem] text-[1.04rem] leading-relaxed text-[var(--color-text)] lg:justify-self-end">
              Whether you&apos;re seeking private healing sessions, sound bath
              experiences, or deeper training and mentorship, you can begin with
              the path that feels most aligned.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-0 pt-5 sm:px-6 sm:pt-12">
        <div className="mx-auto grid w-full max-w-[1180px] gap-5 md:grid-cols-3">
          <Link
            href={site.links.services}
            className="brand-pathway brand-pathway-peach group overflow-hidden rounded-[24px] border shadow-[0_24px_80px_rgba(59,41,31,0.08)] transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <div className="min-h-[230px] bg-[linear-gradient(180deg,rgba(88,72,62,0.02),rgba(88,72,62,0.06)),url('/homepage-images/healing-session.jpeg')] bg-cover bg-center sm:min-h-[270px]" />
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
            className="brand-pathway brand-pathway-rose group overflow-hidden rounded-[24px] border shadow-[0_24px_80px_rgba(59,41,31,0.08)] transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <div className="min-h-[230px] bg-[linear-gradient(180deg,rgba(88,72,62,0.02),rgba(88,72,62,0.06)),url('/homepage-images/moodysound.jpeg')] bg-cover bg-center sm:min-h-[270px]" />
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
            className="brand-pathway brand-pathway-sage group overflow-hidden rounded-[24px] border shadow-[0_24px_80px_rgba(59,41,31,0.08)] transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <div className="min-h-[230px] bg-[linear-gradient(180deg,rgba(88,72,62,0.02),rgba(88,72,62,0.06)),url('/homepage-images/space-detail-2.jpeg')] bg-cover bg-center sm:min-h-[270px]" />
            <div className="p-5">
              <span className="mb-2 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Training, Coaching & Mentorship
              </span>
              <p className="text-[var(--color-muted)]">
                The Embodied Healer and private Reiki coaching are available now. Find personal guidance for your healing journey or practitioner growth.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="px-4 pb-0 pt-5 sm:px-6 sm:pt-12">
        <div className="mx-auto w-full max-w-[1180px]">
          {featuredTestimonial ? (
            <article className="brand-testimonial rounded-[22px] border px-7 py-7 shadow-[0_18px_44px_rgba(59,41,31,0.06)] sm:px-8 sm:py-8">
              <div className="mx-auto flex max-w-[40rem] flex-col items-center text-center">
                <p className="mb-4 font-display text-[clamp(1.5rem,3vw,2.15rem)] leading-[1.14]">
                “{featuredTestimonial.quote}”
                </p>
                <span className="text-[var(--color-muted)]">
                  {featuredTestimonial.name}
                </span>
              </div>
            </article>
          ) : null}
        </div>
      </section>

    </main>
  );
}
