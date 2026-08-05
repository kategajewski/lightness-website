import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Healing & Wellness Gift Certificates",
  description: "Give a flexible gift certificate for Reiki, energy healing, sound healing, guidance, events, training, and other offerings from The Lightness of Being.",
  path: "/gift-certificate",
  image: "/homepage-images/gift-certificate-lantern.jpeg",
});

const giftIdeas = [
  "A Reiki or energy healing session",
  "A restorative sound healing experience",
  "A personalized guidance or coaching session",
  "Support during a life transition or stressful season",
  "A thoughtful gift when words do not feel like enough",
] as const;

const giftAmounts = [
  { label: "$50", optionKey: "gift-50" },
  { label: "$100", optionKey: "gift-100" },
  { label: "$150", optionKey: "gift-150" },
  { label: "$250", optionKey: "gift-250" },
  { label: "$500", optionKey: "gift-500" },
] as const;

export default function GiftCertificatePage() {
  return (
    <PageShell
      eyebrow="Gift Certificate"
      title="Give the gift of healing with warmth and intention."
      description="Choose a gift amount and offer someone a thoughtful path toward care, calm, and support."
    >
      <section className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Healing as a Gift
          </span>
          <h2 className="display-section-title">
            A beautiful way to offer someone care, calm, and support.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            Gift certificates offer a thoughtful way to support someone you
            love with space to rest, receive, feel inspired, and reconnect
            with themselves.
          </p>
          <ul className="mt-8 grid gap-3 text-[var(--color-muted)]">
            {giftIdeas.map((idea) => (
              <li key={idea} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{idea}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#gift-amounts"
              className="button-pill"
            >
              Choose Gift Amount
            </Link>
            <Link
              href={site.links.contact}
              className="button-pill"
            >
              Ask a Question
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,248,242,0.82)] p-4 shadow-[0_24px_80px_rgba(59,41,31,0.08)] max-md:min-h-[420px]">
          <div className="mx-auto max-w-[24rem]">
            <Image
              src="/homepage-images/gift-certificate-lantern.jpeg"
              alt="A warm lantern glow that reflects the calm and care of The Lightness of Being."
              width={1200}
              height={1500}
              className="h-auto w-full rounded-[26px] object-contain"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            How It Works
          </span>
          <h2 className="display-section-title">
            Choose the amount that feels most supportive.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Gift certificates can be used toward private healing sessions,
            personalized guidance, coaching support, and other offerings. If
            you are not sure which amount to choose, you are always welcome to
            reach out.
          </p>
        </div>
        <div
          id="gift-amounts"
          className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6"
        >
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Available Amounts
          </strong>
          <div className="mt-4 grid gap-3">
            {giftAmounts.map((amount) => (
              <form
                key={amount.optionKey}
                action="/api/checkout"
                method="post"
              >
                <input type="hidden" name="slug" value="gift-certificate" />
                <input type="hidden" name="optionKey" value={amount.optionKey} />
                <button type="submit" className="button-pill">
                  Choose {amount.label}
                </button>
              </form>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
