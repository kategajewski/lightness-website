import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-82px)] w-full max-w-[900px] flex-col justify-center px-4 py-16 text-center sm:px-6">
      <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        Checkout Paused
      </span>
      <h1 className="font-display text-[clamp(3rem,7vw,4.8rem)] leading-[0.96] tracking-[-0.02em]">
        No worries.
      </h1>
      <p className="mx-auto mt-5 max-w-[38rem] text-[1.04rem] text-[var(--color-muted)]">
        This page is ready to catch canceled or abandoned checkout sessions. It
        gives you a calmer re-entry point instead of dropping people out of the
        flow.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/courses"
          className="button-pill"
        >
          Return to Catalog
        </Link>
        <Link
          href="/contact"
          className="button-pill"
        >
          Ask a Question
        </Link>
      </div>
    </main>
  );
}
