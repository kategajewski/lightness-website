import Image from "next/image";
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
    <main className="flex min-h-[calc(100vh-82px)] flex-col bg-[var(--color-ivory)] text-[var(--color-text)]">
      <section className="bg-[var(--color-rose-soft)]">
        <div className="mx-auto grid w-full max-w-[1180px] items-center gap-8 px-5 py-9 sm:px-8 sm:py-12 lg:grid-cols-[1.16fr_1fr] lg:gap-8 lg:px-[60px] lg:pb-8 xl:gap-10 xl:px-6">
          <div>
            <span className="home-eyebrow mb-5">
              Energy Healing with Kate Gajewski
            </span>
            <h1 className="display-page-title home-hero-title">
              Come home<br /> to yourself.
            </h1>
            <p className="mt-6 max-w-[36rem] text-[0.94rem] leading-[1.55] text-[var(--color-brown)]">
              Step into a sacred space where intuition leads and healing
              unfolds. Through Reiki, hypnotherapy, sound therapy and holistic
              practices, Kate gently guides you back to your essence: light,
              whole and aligned.
            </p>
            <p className="mt-4 max-w-[36rem] text-[0.94rem] leading-[1.55] text-[var(--color-brown)]">
              Located in Patchogue, New York, with sessions available remotely.
              1:1 sessions designed for support, clarity and transformation.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
              <Link href={site.links.services} className="button-pill">
                Book a Session
              </Link>
              <Link href={site.links.courses} className="button-pill button-pill-secondary">
                Explore Programs
              </Link>
            </div>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-[28px] sm:h-[460px] lg:h-[460px]">
            <Image
              src="/homepage-images/about-pinkbowlsmile.jpeg"
              alt="Kate Gajewski holding a rose-colored sound healing bowl outdoors"
              fill
              priority
              sizes="(min-width: 1180px) 480px, (min-width: 1024px) 42vw, 90vw"
              className="object-cover object-[80%_center]"
            />
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-beige)] px-5 py-9 text-center sm:px-8 sm:py-10">
        <div className="mx-auto max-w-[1180px]">
          <span className="home-eyebrow mb-4">A Place To Begin</span>
          <h2 className="display-section-title home-intro-title">
            Choose the kind of support you&apos;re looking for.
          </h2>
        </div>
      </section>

      <section aria-label="Ways to work with Kate" className="px-5 pt-7 sm:px-6 sm:pt-8">
        <div className="mx-auto grid w-full max-w-[1180px] gap-5 md:grid-cols-3">
          <Link href={site.links.services} className="home-pathway">
            <div className="relative h-[260px] md:h-[230px] xl:h-[270px]">
              <Image
                src="/homepage-images/healing-session.jpeg"
                alt="A softly lit healing space at The Lightness of Being"
                fill
                sizes="(min-width: 1180px) 380px, (min-width: 768px) 31vw, 90vw"
                className="object-cover object-center"
              />
            </div>
            <div className="p-5">
              <span className="mb-2 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-brown)]">
                Private Sessions
              </span>
              <p className="text-[0.9rem] leading-[1.55] text-[var(--color-muted)]">
                Explore 1:1 healing sessions designed to help you soften, release and come back into alignment.
              </p>
            </div>
          </Link>
          <Link href={site.links.events} className="home-pathway">
            <div className="relative h-[260px] md:h-[230px] xl:h-[270px]">
              <Image
                src="/homepage-images/moodysound.jpeg"
                alt="Crystal singing bowls prepared for a sound healing gathering"
                fill
                sizes="(min-width: 1180px) 380px, (min-width: 768px) 31vw, 90vw"
                className="object-cover object-center"
              />
            </div>
            <div className="p-5">
              <span className="mb-2 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-brown)]">
                Sound Baths & Events
              </span>
              <p className="text-[0.9rem] leading-[1.55] text-[var(--color-muted)]">
                Join gatherings and sound experiences that bring restoration, ritual and community into the work.
              </p>
            </div>
          </Link>
          <Link href={site.links.courses} className="home-pathway">
            <div className="relative h-[260px] md:h-[230px] xl:h-[270px]">
              <Image
                src="/homepage-images/space-detail-2.jpeg"
                alt="Kate offering a healing session in her practice space"
                fill
                sizes="(min-width: 1180px) 380px, (min-width: 768px) 31vw, 90vw"
                className="object-cover object-center"
              />
            </div>
            <div className="p-5">
              <span className="mb-2 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-brown)]">
                Training, Coaching & Mentorship
              </span>
              <p className="text-[0.9rem] leading-[1.55] text-[var(--color-muted)]">
                The Embodied Healer and private Reiki coaching are available now. Find personal guidance for your healing journey or practitioner growth.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="px-5 pt-7 sm:px-6 sm:pt-8">
        <div className="mx-auto w-full max-w-[1180px]">
          {featuredTestimonial ? (
            <figure className="rounded-[22px] bg-[var(--color-rose-hero)] px-7 py-10 sm:px-8 sm:py-12">
              <div className="mx-auto flex max-w-[35rem] flex-col items-center text-center">
                <blockquote className="font-display text-[clamp(1.7rem,3.2vw,2.35rem)] leading-[1.2]">
                  “{featuredTestimonial.quote}”
                </blockquote>
                <div aria-hidden="true" className="my-5 h-[2px] w-14 bg-[var(--color-brown)]" />
                <figcaption className="text-[0.95rem] tracking-[0.08em] text-[var(--color-brown)]">
                  {featuredTestimonial.name}
                </figcaption>
              </div>
            </figure>
          ) : null}
        </div>
      </section>
    </main>
  );
}
