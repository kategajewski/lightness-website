import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-82px)] w-full max-w-[900px] flex-col justify-center px-4 py-16 text-center sm:px-6">
      <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        Checkout Complete
      </span>
      <h1 className="display-page-title">
        Your purchase is complete.
      </h1>
      <p className="mx-auto mt-5 max-w-[38rem] text-[1.04rem] text-[var(--color-muted)]">
        Thank you for registering. Please keep an eye on your email for your
        Stripe receipt and any event details.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/events" className="button-pill">
          Back to Events
        </Link>
        <Link href="/contact" className="button-pill">
          Ask a Question
        </Link>
      </div>
    </main>
  );
}
