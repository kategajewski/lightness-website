import Link from "next/link";
import type { Offer } from "@/lib/offers";

type OfferCardProps = {
  offer: Offer;
};

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
      <div
        className="min-h-[260px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(76,58,48,0.04), rgba(76,58,48,0.18)), url('${offer.image}')`,
        }}
      />
      <div className="grid gap-4 p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {offer.category}
          </span>
          <span className="rounded-full bg-[rgba(168,178,159,0.18)] px-3 py-1 text-[0.82rem] text-[var(--color-muted)]">
            {offer.priceLabel}
          </span>
        </div>
        <div>
          <h2 className="font-display text-[2.1rem] leading-[0.98] tracking-[-0.02em]">
            {offer.name}
          </h2>
          <p className="mt-3 text-[var(--color-muted)]">{offer.description}</p>
        </div>
        <p className="rounded-[18px] bg-[rgba(255,248,242,0.86)] px-4 py-4 text-[0.96rem] text-[var(--color-muted)]">
          {offer.audience}
        </p>
        <ul className="grid gap-2 text-[0.96rem] text-[var(--color-muted)]">
          {offer.features.map((feature) => (
            <li key={feature} className="flex gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(93,81,72,0.8)]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link
          href={offer.href}
          className="button-pill"
        >
          {offer.cta}
        </Link>
      </div>
    </article>
  );
}
