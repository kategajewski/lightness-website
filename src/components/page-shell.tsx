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

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-8 pt-14 sm:px-6 sm:pb-10 sm:pt-16">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {eyebrow}
        </span>
        <div className="mx-auto max-w-[68rem] text-center">
          <h1 className="mx-auto max-w-[22ch] display-page-title">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-[42rem] text-[1.05rem] text-[var(--color-muted)]">
            {description}
          </p>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 pb-14 sm:gap-8 sm:px-6 sm:pb-16">
        {children}
      </section>
    </main>
  );
}
