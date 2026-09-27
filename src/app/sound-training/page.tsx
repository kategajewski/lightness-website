import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Sound Practitioner Training | January 29–31, 2027",
  description: "Follow your calling into sound. Three days of sound practitioner training with Kate Gajewski and Raquel Vamos at Free Spirits Yoga in Rocky Point. Enrollment is open.",
  path: "/sound-training",
  image: "/homepage-images/moodysound.jpeg",
});

const explorations = [
  { title: "Understand the sound", description: "Explore foundational sound theory and history. Give language and context to what you feel, and deepen your understanding of the practice behind the experience." },
  { title: "Get your hands on the instruments", description: "Listen closely. Try things. Find your rhythm. Explore instrument care, setup, pacing and transitions with guidance and plenty of space to play." },
  { title: "Bring your practice into the world", description: "Practice holding space with intention, presence and care. Talk honestly about creating sound baths, supporting your participants and finding your own voice as a facilitator." },
];

export default function SoundTrainingPage() {
  return (
    <PageShell eyebrow="Enrollment Is Open" title="Sound Practitioner Training" description="January 29–31, 2027 • Free Spirits Yoga, Rocky Point, NY • With Kate Gajewski & Raquel Vamos">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <h2 className="display-section-title">Some of us don’t just hear sound. We feel it in our bones.</h2>
          <div className="mt-5 space-y-5 text-[1.03rem] leading-[1.8] text-[var(--color-muted)]">
            <p>The note that lingers long after the bowl goes quiet. The breath that finally softens. That feeling of coming back to yourself without needing to find the words.</p>
            <p>If sound has shifted something in your life, you may already know the feeling: the quiet pull to go deeper. To understand what you’re experiencing. To put your hands on the instruments and begin sharing this work in your own way.</p>
            <p>Raquel and I created this training for you.</p>
            <p>Join us for three days of deep listening, hands-on exploration and honest conversation about the art of holding a sound bath. A space to be curious, ask your questions and grow into a practice that feels like you.</p>
          </div>
          <Link href="#enroll" className="button-pill mt-7">Answer the Call</Link>
        </div>
        <div className="mx-auto w-full max-w-[25rem] overflow-hidden rounded-[32px] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img src="/homepage-images/moodysound.jpeg" alt="A warm, intimate space for sound practice" className="block h-auto w-full" />
        </div>
      </section>

      <section>
        <div className="mb-8 max-w-[43rem]">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">More Than Learning to Play</span>
          <h2 className="display-section-title mt-4">Deepen your listening. Develop your practice.</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {explorations.map((item) => <article key={item.title} className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7"><h3 className="display-card-title">{item.title}</h3><p className="mt-4 leading-[1.8] text-[var(--color-muted)]">{item.description}</p></article>)}
        </div>
      </section>

      <section className="grid gap-8 rounded-[30px] bg-[rgba(255,251,246,0.78)] p-8 sm:p-10 lg:grid-cols-2">
        <div>
          <h2 className="display-section-title">No gatekeeping. We share what we know.</h2>
          <p className="mt-5 leading-[1.8] text-[var(--color-muted)]">You’ll receive a training manual, foundational teaching, hands-on guidance and space to experiment. Bring your curiosity, your questions and the part of you that knows there is something here worth exploring.</p>
          <p className="mt-4 leading-[1.8] text-[var(--color-muted)]">For practitioners, yoga teachers, space holders and anyone feeling called to develop a sound bath practice. Whether sound is becoming part of the work you already do or calling you toward something new, there is room to discover your own expression.</p>
          <p className="mt-5 font-semibold">Resonance. Curiosity. Practice.</p>
        </div>
        <div>
          <h2 className="display-card-title">Your weekend with us</h2>
          <p className="mt-4 font-semibold">January 29–31, 2027</p>
          <p className="mt-2 text-[var(--color-muted)]">Free Spirits Yoga • Rocky Point, NY</p>
          <p className="mt-1 text-[var(--color-muted)]">648 NY-25A, Suite B, Rocky Point, NY 11778</p>
          <dl className="mt-6 space-y-4 text-[var(--color-muted)]">
            <div><dt className="font-semibold text-[var(--color-text)]">Friday, January 29</dt><dd>7:30–9:30 PM</dd></div>
            <div><dt className="font-semibold text-[var(--color-text)]">Saturday, January 30</dt><dd>11:30 AM–7:30 PM</dd></div>
            <div><dt className="font-semibold text-[var(--color-text)]">Sunday, January 31</dt><dd>11:30 AM–7:30 PM</dd></div>
          </dl>
          <p className="mt-5 text-sm text-[var(--color-muted)]">All times Eastern. Led by Kate Gajewski and Raquel Vamos.</p>
        </div>
      </section>

      <section id="enroll" className="scroll-mt-28 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 sm:p-10">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Reserve Your Place</span>
        <h2 className="display-section-title mt-4">If you’ve been feeling the call, this is your invitation.</h2>
        <p className="mt-4 max-w-[42rem] leading-[1.8] text-[var(--color-muted)]">Three days to listen more deeply, explore freely and begin bringing your sound practice to life. Both tuition options include the full training, your manual and hands-on guidance.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-[24px] border border-[rgba(76,58,48,0.12)] p-6 sm:p-8">
            <h3 className="display-card-title">Pay in full</h3>
            <p className="mt-4 text-3xl font-semibold">$1,344</p>
            <p className="mt-3 text-[var(--color-muted)]">One payment. Your place is reserved.</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Save $100.10 compared with the payment plan.</p>
            <Link href="/checkout/sound-training" className="button-pill mt-6">Reserve My Place</Link>
          </article>
          <article className="rounded-[24px] border border-[rgba(76,58,48,0.12)] p-6 sm:p-8">
            <h3 className="display-card-title">Six-payment plan</h3>
            <p className="mt-4 text-3xl font-semibold">$333 today</p>
            <p className="mt-3 text-[var(--color-muted)]">Then $222.22 monthly for five months, starting one month after registration.</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">$1,444.10 total. Six payments including your deposit. Billing ends automatically and does not renew.</p>
            <Link href="/checkout/sound-training" className="button-pill mt-6">Begin with My Deposit</Link>
          </article>
        </div>
        <p className="mt-6 text-sm text-[var(--color-muted)]">Register directly with The Lightness of Being. <Link href={site.links.contact} className="underline underline-offset-4">Have a question? Reach out to Kate.</Link></p>
      </section>
    </PageShell>
  );
}
