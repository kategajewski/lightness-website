import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-82px)] w-full max-w-[900px] flex-col justify-center px-4 py-16 text-center sm:px-6">
      <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        Payment Complete
      </span>
      <h1 className="font-display text-[clamp(3rem,7vw,4.8rem)] leading-[0.96] tracking-[-0.02em]">
        You&apos;re in.
      </h1>
      <p className="mx-auto mt-5 max-w-[38rem] text-[1.04rem] text-[var(--color-muted)]">
        This confirmation page is ready for the live Stripe flow. Once your
        payment setup and member login are connected, we can route customers
        directly into their dashboard from here.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/account"
          className="button-pill"
        >
          Go to Member Area
        </Link>
        <Link
          href="/courses"
          className="button-pill"
        >
          Back to Catalog
        </Link>
      </div>
    </main>
  );
}
