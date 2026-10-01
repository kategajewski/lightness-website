import Image from "next/image";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Reiki Rising | Returning Fall 2027",
  description: "Reiki Rising returns Fall 2027. Join the interest list for Kate Gajewski's guided Reiki One and Reiki Two journey. Private mentorship and Reiki coaching are available now.",
  path: "/reiki-rising",
  image: "/homepage-images/reiki-rising-kate-hands-raised-soft.png",
});

const interestHref = "/contact?inquiryType=training&subject=Reiki%20Rising%20Fall%202027%20Interest%20List";

export default function ReikiRisingPage() {
  return (
    <main className="overflow-hidden bg-[#f6f0e8] text-[#2f2520]">
      <section className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#695a51]">Returning Fall 2027 · Live Online</p>
          <h1 className="mt-6 font-display text-[clamp(4rem,10vw,8rem)] font-light leading-[0.9]">Reiki Rising</h1>
          <p className="mt-6 font-display text-3xl text-[#66725d]">Learn. Practice. Integrate.</p>
          <p className="mt-5 max-w-[32rem] leading-7 text-[#5b4c44]">A guided Reiki One and Reiki Two journey with Kate Gajewski, with space for personal healing, supported practice and integration.</p>
          <p className="mt-5 max-w-[32rem] leading-7 text-[#5b4c44]">Enrollment for the current cohort is closed. Reiki Rising returns Fall 2027. Join the interest list to hear when the next dates and enrollment details are ready.</p>
          <Link href={interestHref} className="mt-7 inline-flex button-pill">Join the Fall 2027 Interest List</Link>
          <p className="mt-5 text-sm text-[#5b4c44]">Already enrolled? <Link href="/library/reiki-rising-fall-2026" className="underline underline-offset-4">Visit your student portal</Link>.</p>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-[36px] bg-[#d9c3be]">
          <Image src="/homepage-images/reiki-rising-kate-hands-raised-soft.png" alt="Kate Gajewski offering Reiki with both hands raised" fill priority sizes="(max-width: 1024px) 90vw, 460px" className="object-cover" />
        </div>
      </section>
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-5 pb-16 sm:px-8">
        <section className="rounded-[32px] bg-[#a8b29f] p-8 sm:p-12">
          <h2 className="display-section-title">A grounded path into Reiki.</h2>
          <p className="mt-5 max-w-[48rem] leading-7">Reiki Rising brings together Reiki foundations, self-practice, energy awareness and sharing Reiki with others. The group experience offers teaching, guided practice and live support as you develop confidence in your own relationship with Reiki.</p>
          <p className="mt-4 max-w-[48rem] leading-7">The next cohort&apos;s schedule and full program details will be shared when enrollment opens.</p>
        </section>
      <section className="mx-auto w-full max-w-[62rem] border-y border-[rgba(76,58,48,0.13)] py-12 sm:py-16">
        <div className="text-center">
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              From a Reiki Rising Student
            </span>
            <blockquote className="mx-auto max-w-[52rem] font-display text-[clamp(2rem,3.8vw,3.2rem)] font-light leading-[1.1] text-[#4c3a30]">
              &ldquo;My Reiki experience has been life changing. I look at life
              differently, appreciate Mother Nature more, listen to my
              intuition and take more time for myself. Reiki Rising meant
              stepping outside of my comfort zone and following the pull to
              learn Reiki. I am so happy I pushed myself to do this.&rdquo;
            </blockquote>
            <p className="mt-6 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Janice, Reiki Rising student
            </p>
        </div>
      </section>


        <section>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">Available Now</p>
          <h2 className="mt-4 display-section-title">Support for where you are today.</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {[
              { title: "The Embodied Healer", description: "A personalized Reiki Master mentorship for deeper healing, practice and teaching.", href: site.links.mentorship, cta: "Explore Embodied Healer" },
              { title: "Reiki Coaching", description: "Six-week and twelve-week private support for trained practitioners through The Healer's Emergence.", href: site.links.reikiMentorship, cta: "Explore Reiki Coaching" },
              { title: "Individual Sessions", description: "Receive personal healing support with sessions in Patchogue or remotely.", href: site.links.services, cta: "Explore Sessions" },
            ].map((path) => (
              <article key={path.title} className="rounded-[28px] bg-[#fffaf5] p-7">
                <h3 className="display-card-title">{path.title}</h3>
                <p className="mt-4 text-[var(--color-muted)]">{path.description}</p>
                <Link href={path.href} className="mt-6 inline-flex button-pill">{path.cta}</Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
