import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const soothingSundayDates = [
  {
    title: "Sunday, May 17, 2026",
    details:
      "Lindenhurst Village Square Gazebo · Outdoors weather permitting, otherwise indoors at Island Kava, Lindenhurst",
    priceLabel: "$45",
    eventSlug: "soothing-sunday-may-17-2026",
  },
  {
    title: "Sunday, June 14, 2026",
    details:
      "Lindenhurst Village Square Gazebo · Outdoors weather permitting, otherwise indoors at Island Kava, Lindenhurst",
    priceLabel: "$45",
    eventSlug: "soothing-sunday-june-14-2026",
  },
] as const;

const soothingSundayFeatures = [
  "A gentle yoga, sound bath, and kava experience",
  "Held monthly at Island Kava in Lindenhurst",
  "Designed to help you reset, soften, and begin the week in a more grounded way",
  "A welcoming community experience whether you come alone or with a friend",
] as const;

type SoothingSundayPageProps = {
  searchParams: Promise<{
    checkoutError?: string;
  }>;
};

const checkoutErrorMessages: Record<string, string> = {
  stripe_not_configured:
    "Stripe is not configured on this deployment yet.",
  publishable_key_missing:
    "The Stripe publishable key is missing on this deployment.",
  secret_key_invalid:
    "The Stripe secret key format looks invalid on this deployment.",
  publishable_key_invalid:
    "The Stripe publishable key format looks invalid on this deployment.",
  stripe_session_failed:
    "Stripe could not create the checkout session from this deployment.",
  session_url_missing:
    "Stripe returned no checkout URL for this purchase.",
  unexpected_error:
    "An unexpected checkout error happened on this deployment.",
};

export default async function SoothingSundayPage({
  searchParams,
}: SoothingSundayPageProps) {
  const { checkoutError } = await searchParams;
  const checkoutErrorMessage = checkoutError
    ? checkoutErrorMessages[checkoutError] ??
      "The checkout could not be opened from this deployment."
    : null;

  return (
    <PageShell
      eyebrow="Soothing Sunday"
      title="A monthly Island Kava gathering for rest, ritual, and a softer start to the week."
      description="Soothing Sunday blends gentle movement, sound healing, and kava in a community setting designed to help you slow down, reconnect, and reset."
    >
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Monthly Event Series
          </span>
          <h2 className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-[0.96] tracking-[-0.02em]">
            Gentle yoga, sound bath, and kava in a warm community space.
          </h2>
          <p className="mt-5 max-w-[38rem] text-[1.03rem] text-[var(--color-muted)]">
            Soothing Sunday is a recurring Island Kava gathering created to
            help you exhale before the week begins. It brings together gentle
            movement, restorative sound, and the grounding ritual of kava in a
            way that feels both nourishing and easy to arrive to.
          </p>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            These gatherings are intentionally simple and accessible. You will
            be guided through gentle stretching, supported into rest with sound,
            and invited to linger in the atmosphere of community and care.
          </p>
          <ul className="mt-8 grid gap-3 text-[var(--color-muted)]">
            {soothingSundayFeatures.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {checkoutErrorMessage ? (
            <div className="mt-6 rounded-[20px] border border-[rgba(130,75,56,0.16)] bg-[rgba(255,243,236,0.94)] p-5 text-[0.98rem] text-[#6d4e40]">
              {checkoutErrorMessage}
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#soothing-sunday-dates" className="button-pill">
              Purchase Tickets
            </a>
            <Link href={site.links.events} className="button-pill">
              Back to Events
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <div className="mx-auto w-full max-w-[20rem]">
            <img
              src="/homepage-images/events-island-kava-sound.jpeg"
              alt="Soothing Sunday sound bath setup at Island Kava"
              className="block h-auto w-full rounded-[32px] object-contain object-center"
            />
          </div>
        </div>
      </section>

      <section id="soothing-sunday-dates" className="grid gap-5 md:grid-cols-2">
        {soothingSundayDates.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <h3 className="font-display text-[2rem] leading-[0.98] tracking-[-0.02em]">
              {item.title}
            </h3>
            <p className="mt-4 text-[var(--color-muted)]">{item.details}</p>
            <p className="mt-4 font-semibold text-[var(--color-text)]">
              Investment: {item.priceLabel}
            </p>
            <form action="/api/checkout/event" method="post" className="mt-6">
              <input type="hidden" name="eventSlug" value={item.eventSlug} />
              <button type="submit" className="button-pill">
                Purchase Ticket
              </button>
            </form>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1fr_0.95fr]">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            What to expect
          </span>
          <h2 className="font-display text-[clamp(2.3rem,5vw,3.5rem)] leading-[0.98] tracking-[-0.02em]">
            A simple, grounding ritual to carry you into the week ahead.
          </h2>
          <p className="mt-4 max-w-[38rem] text-[var(--color-muted)]">
            Soothing Sunday is meant to feel approachable and restorative. You
            do not need experience with yoga, kava, or sound healing to come.
            Just arrive as you are and let the experience meet you there.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Good to know
          </strong>
          <ul className="mt-4 grid gap-3 text-[var(--color-muted)]">
            <li>This event happens monthly</li>
            <li>May and June are planned for the Lindenhurst Village Square gazebo</li>
            <li>If weather shifts, the gathering will move indoors to Island Kava</li>
            <li>Island Kava creates a casual, welcoming atmosphere for the gathering</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
