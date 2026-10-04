import Link from "next/link";
import type { Offer } from "@/lib/offers";

type OfferCardProps = {
  offer: Offer;
};

export function OfferCard({ offer }: OfferCardProps) {
  const isMembership = offer.slug === "monthly-membership";

  return (
    <article className="overflow-hidden rounded-[24px] border border-[var(--color-rose)] bg-[var(--color-ivory)] shadow-[0_24px_80px_rgba(47,37,32,0.08)]">
      <div
        className="min-h-[260px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(47,37,32,0.04), rgba(47,37,32,0.18)), url('${offer.image}')`,
        }}
      />
      <div className="grid gap-4 p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {offer.category}
          </span>
          <span className="rounded-full bg-[var(--color-sage)] px-3 py-1 text-[0.82rem] font-semibold text-[var(--color-text)]">
            {offer.priceLabel}
          </span>
        </div>
        <div>
          <h2 className="display-card-title">
            {offer.name}
          </h2>
          <p className="mt-3 text-[var(--color-muted)]">{offer.description}</p>
        </div>
        <p className="rounded-[18px] bg-[var(--color-peach)] px-4 py-4 text-[0.96rem] text-[var(--color-text)]">
          {offer.audience}
        </p>
        <ul className="grid gap-2 text-[0.96rem] text-[var(--color-muted)]">
          {offer.features.map((feature) => (
            <li key={feature} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-gold)]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {isMembership ? (
          <form action="/api/checkout" method="post">
            <input type="hidden" name="slug" value={offer.slug} />
            <button type="submit" className="button-pill">
              {offer.cta}
            </button>
          </form>
        ) : (
          <Link
            href={offer.href}
            className="button-pill"
          >
            {offer.cta}
          </Link>
        )}
      </div>
    </article>
  );
}
