import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <main className="relative flex flex-col overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_center,_rgba(230,194,162,0.42),_rgba(230,194,162,0.16)_32%,_rgba(230,194,162,0.06)_48%,_transparent_72%)] blur-[6px]" />

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-10 pt-16 sm:px-6">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {eyebrow}
        </span>
        <h1 className="max-w-[12ch] font-display text-[clamp(3.2rem,7vw,5.4rem)] leading-[0.96] tracking-[-0.02em]">
          {title}
        </h1>
        <p className="mt-5 max-w-[42rem] text-[1.05rem] text-[var(--color-muted)]">
          {description}
        </p>
      </section>

      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-4 pb-16 sm:px-6">
        {children}
      </section>
    </main>
  );
}
