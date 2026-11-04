import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Wedding Officiation in Long Island, NY",
  description:
    "Heart-led, personalized wedding ceremonies and officiation by Kate Gajewski for couples celebrating in Long Island and beyond.",
  path: "/special-blessing/wedding-officiation",
  image: "/homepage-images/events-ceremony-outdoor.jpeg",
});

const packages = [
  {
    title: "Simple Ceremony",
    price: "$350",
    description:
      "A warm, meaningful ceremony for couples who would like to keep things clear and heartfelt.",
    includes: [
      "A planning call to align on the flow of your ceremony",
      "A thoughtful ceremony using Kate’s core ceremony structure",
      "Couples write and share their own vows",
      "Wedding-day officiation and marriage license signing",
    ],
  },
  {
    title: "Your Story Ceremony",
    price: "$500",
    description:
      "A more personal ceremony that brings your relationship, personality and vision into the room.",
    includes: [
      "Everything in the Simple Ceremony",
      "A wedding questionnaire to get to know your story",
      "A custom-written ceremony shaped around the two of you",
      "Personal vow-writing support, if you would like help finding the words",
    ],
  },
  {
    title: "Full Ceremony Experience",
    price: "$650",
    description:
      "For couples who want a personalized ceremony and the added ease of a rehearsal together.",
    includes: [
      "Everything in the Your Story Ceremony",
      "Rehearsal attendance and guidance for your wedding party",
      "A final ceremony walkthrough so everyone feels ready",
      "A grounded, supported ceremony-day experience",
    ],
  },
] as const;

const inquiryHref =
  "/contact?inquiryType=events&subject=Wedding%20Officiation%20Inquiry&draft=Hi%20Kate%2C%20we%27re%20interested%20in%20wedding%20officiation.%20Our%20date%2C%20location%20and%20what%20we%27re%20envisioning%20are%3A";

export default function WeddingOfficiationPage() {
  return (
    <PageShell
      eyebrow="Wedding Officiation"
      title="A wedding ceremony that sounds like the two of you."
      description="Kate creates personal, heart-led wedding ceremonies that make space for your story, your people and the promises you are making together."
    >
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.7)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src="/homepage-images/events-ceremony-outdoor.jpeg"
            alt="Kate leading an outdoor ceremony"
            className="h-full min-h-[25rem] w-full object-cover object-center"
          />
        </div>
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Your Ceremony, Your Way
          </span>
          <h2 className="display-section-title">Meaningful, personal and held with care.</h2>
          <p className="mt-5 text-[1.03rem] text-[var(--color-muted)]">
            Your ceremony can be joyful, reverent, lighthearted, spiritual or a blend that is entirely your own. Kate works with you to create a ceremony that feels natural to speak, beautiful to witness and true to the life you are building together.
          </p>
          <Link href={inquiryHref} className="button-pill mt-8">
            Inquire About Your Wedding
          </Link>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[42rem] text-center">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Ways to Work Together</span>
          <h2 className="display-section-title">Choose the level of support that feels right for your day.</h2>
          <p className="mx-auto mt-4 text-[var(--color-muted)]">Every ceremony begins with care. The difference is how much personalization and hands-on support you would like along the way.</p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {packages.map((pkg) => (
            <article key={pkg.title} className="flex flex-col rounded-[26px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
              <h3 className="display-card-title">{pkg.title}</h3>
              <p className="mt-3 text-[1.35rem] font-semibold text-[var(--color-text)]">{pkg.price}</p>
              <p className="mt-3 text-[var(--color-muted)]">{pkg.description}</p>
              <ul className="mt-6 grid gap-3 text-[0.94rem] text-[var(--color-muted)]">
                {pkg.includes.map((item) => <li key={item} className="flex gap-3"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b3887e]" /><span>{item}</span></li>)}
              </ul>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-[42rem] text-center text-[0.92rem] text-[var(--color-muted)]">Personal vow-writing support is available as a $125 add-on. Travel outside the local area, additional planning and unique ceremony requests can be discussed during your inquiry.</p>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(255,252,248,0.9),rgba(230,194,162,0.22),rgba(168,178,159,0.16))] p-8 text-center shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <h2 className="mx-auto max-w-[26ch] display-section-title">Let&apos;s make room for the moment you will remember forever.</h2>
        <p className="mx-auto mt-4 max-w-[38rem] text-[var(--color-muted)]">Tell Kate a little about your celebration to begin the conversation.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={inquiryHref} className="button-pill">Start Your Inquiry</Link>
          <Link href={site.links.specialBlessing} className="button-pill">Explore Private Ceremonies</Link>
        </div>
      </section>
    </PageShell>
  );
}
