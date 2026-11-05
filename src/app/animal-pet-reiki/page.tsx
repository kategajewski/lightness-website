import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Animal & Pet Reiki, with Equine Reiki in Long Island, NY",
  description:
    "Animal and pet Reiki with a special focus on gentle, animal-led equine Reiki sessions for horses and their people across Long Island.",
  path: "/animal-pet-reiki",
  image: "/homepage-images/equine-reiki-kate-white-horse.jpeg",
});

const inquiryHref =
  "/contact?inquiryType=services&subject=Animal%20%26%20Pet%20Reiki%20Inquiry&draft=Hi%20Kate%2C%20I%27m%20interested%20in%20Animal%20%26%20Pet%20Reiki.%20My%20animal%2C%20location%20and%20what%20I%27m%20hoping%20to%20support%20are%3A";

const offerings = [
  {
    title: "Equine Reiki",
    description:
      "A quiet, respectful Reiki session for horses, offered at their pace and with deep attention to their comfort, communication, and environment.",
  },
  {
    title: "Pet Reiki",
    description:
      "Gentle energy support for companion animals who may benefit from more ease, grounding, or a calm moment of care in a familiar space.",
  },
  {
    title: "Distance Reiki",
    description:
      "A remote option for animals and their people when an in-person session is not the best fit. Details can be discussed during your inquiry.",
  },
] as const;

export default function AnimalPetReikiPage() {
  return (
    <PageShell
      eyebrow="Animal & Pet Reiki"
      title="Gentle support for the animals you love."
      description="Animal Reiki offers a quiet, compassionate space for your animal to receive. Kate’s work has a special focus on horses, honoring their sensitivity, wisdom, and individual way of communicating."
    >
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.7)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/equine-reiki-kate-white-horse.jpeg"
            alt="Kate connecting with a white horse outdoors"
            className="h-[19rem] w-full object-cover object-center sm:h-[22rem]"
          />
        </div>
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Equine Reiki
          </span>
          <h2 className="display-section-title">A quiet moment of care, offered at their pace.</h2>
          <p className="mt-5 text-[1.03rem] text-[var(--color-muted)]">
            Horses are deeply perceptive animals. Equine Reiki creates a calm, grounded space where your horse can simply be, with no expectation to perform or respond in a particular way. Kate follows their cues throughout the session.
          </p>
          <p className="mt-4 text-[var(--color-muted)]">
            Sessions are a complementary wellness offering and are not a substitute for veterinary care, diagnosis, or treatment.
          </p>
          <Link href={inquiryHref} className="button-pill mt-8">
            Inquire About Equine Reiki
          </Link>
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,252,248,0.9),rgba(230,194,162,0.2),rgba(168,178,159,0.14))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.8fr_1.2fr] sm:p-10">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Rooted in Experience</span>
          <h2 className="display-section-title">A lifelong relationship with horses.</h2>
        </div>
        <div className="max-w-[44rem] text-[var(--color-muted)]">
          <p>
            Kate has been riding on and off since she was seven, in both hunter jumper and western disciplines. Since 2014, she has worked side by side with horses and continues to be guided by their presence, sensitivity, and honesty.
          </p>
          <p className="mt-4">
            In 2018, Kate completed her Pet and Animal Reiki course and has been sharing Reiki with horses ever since. This offering is an extension of that long-standing relationship, held with care, patience, and respect for each animal’s individuality.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[42rem] text-center">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Ways to Receive
          </span>
          <h2 className="display-section-title">Support that begins with listening.</h2>
          <p className="mx-auto mt-4 text-[var(--color-muted)]">
            Every animal is different. Reiki sessions are guided by your animal’s comfort, personality, and the setting that helps them feel most at ease.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {offerings.map((offering) => (
            <article key={offering.title} className="rounded-[26px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
              <h3 className="display-card-title">{offering.title}</h3>
              <p className="mt-4 text-[var(--color-muted)]">{offering.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.72)] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)]">
            <img
              src="/homepage-images/equine-reiki-kate-black-horse.jpeg"
              alt="Kate sharing a quiet moment with a black horse"
              className="block h-[26rem] w-full object-cover object-[center_35%]"
            />
          </div>
          <div className="overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)]">
            <img
              src="/homepage-images/equine-reiki-sound-bowls.jpeg"
              alt="Kate offering a sound and Reiki experience beside a horse"
              className="block h-[26rem] w-full object-cover object-[center_35%]"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-8 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,252,248,0.9),rgba(230,194,162,0.22),rgba(168,178,159,0.16))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.85fr_1.15fr] sm:p-10">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">What to Expect</span>
          <h2 className="display-section-title">A session shaped around your animal.</h2>
        </div>
        <ol className="grid gap-4 text-[var(--color-muted)]">
          <li><strong className="text-[var(--color-text)]">1. Begin with their story.</strong> Share a little about your animal, their setting, and what you would like support around.</li>
          <li><strong className="text-[var(--color-text)]">2. Make room for choice.</strong> Kate allows your animal to choose their distance, movement, and level of engagement throughout the session.</li>
          <li><strong className="text-[var(--color-text)]">3. Receive gentle reflections.</strong> Afterward, Kate shares any observations from the session and offers space for your questions.</li>
        </ol>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-8 text-center shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <h2 className="mx-auto max-w-[30ch] display-section-title">Let&apos;s create a gentle moment of care for your animal.</h2>
        <p className="mx-auto mt-4 max-w-[40rem] text-[var(--color-muted)]">Tell Kate about your animal and your location to begin the conversation.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={inquiryHref} className="button-pill">Start Your Inquiry</Link>
          <Link href={site.links.services} className="button-pill button-pill-secondary">Explore Healing Sessions</Link>
        </div>
      </section>
    </PageShell>
  );
}
