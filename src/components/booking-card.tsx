import Link from "next/link";
import { booking } from "@/lib/site";

export function BookingCard() {
  return (
    <div className="surface-rose rounded-[34px] border border-[var(--color-line)] p-8 shadow-[0_12px_36px_rgba(59,41,31,0.04)] sm:p-10">
      <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        Monthly Membership
      </span>
      <h2 className="display-section-title">
        Ongoing support with a steady monthly rhythm of care.
      </h2>
      <p className="mt-4 max-w-[42rem] text-[var(--color-muted)]">
        {booking.primaryDescription}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={booking.primaryHref} className="button-pill">
          {booking.primaryLabel}
        </Link>
        {booking.secondaryOptions.map((option) => (
          <Link
            key={option.label}
            href={option.href}
            target={option.href.startsWith("http") ? "_blank" : undefined}
            rel={option.href.startsWith("http") ? "noreferrer" : undefined}
            className="button-pill button-pill-secondary"
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
