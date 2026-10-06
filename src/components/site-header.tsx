"use client";

import Link from "next/link";
import { primaryNavigation, site } from "@/lib/site";

export function SiteHeader() {
  const headerNavigation = primaryNavigation;

  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(201,167,156,0.5)] bg-[rgba(255,250,245,0.96)] backdrop-blur-[16px]">
      <div className="mx-auto flex min-h-[82px] w-full max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-[75px] lg:px-[60px] xl:px-6">
        <Link href={site.links.home} className="flex min-w-0 items-center gap-3">
          <img
            src="/homepage-images/hand-logo.png"
            alt={`${site.name} logo`}
            className="h-11 w-11 rounded-full object-cover opacity-90"
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-brand text-[1.15rem] leading-none tracking-[0.02em] sm:text-[1.45rem] lg:text-[1.5rem] xl:text-[1.9rem]">
              {site.name}
            </span>
            <span className="truncate text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted)] sm:text-[0.68rem]">
              {site.subtitle}
            </span>
          </span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-4 text-[0.75rem] text-[var(--color-muted)] lg:flex xl:gap-5 xl:text-[0.95rem]">
          {headerNavigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="decoration-[#c9a79c] decoration-2 underline-offset-4 transition-colors hover:text-[var(--color-text)] hover:underline"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={site.links.login}
            className="decoration-[#c9a79c] decoration-2 underline-offset-4 transition-colors hover:text-[var(--color-text)] hover:underline"
          >
            Login
          </Link>
        </nav>
      </div>

      <div className="border-t border-[rgba(201,167,156,0.35)] px-4 py-2 lg:hidden">
        <nav className="mx-auto flex w-full max-w-[1180px] gap-1.5 overflow-x-auto pb-1 text-[0.88rem] text-[var(--color-text)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {headerNavigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="shrink-0 rounded-full border border-[rgba(201,167,156,0.6)] bg-[#fffaf5] px-3.5 py-2 font-medium transition-colors hover:bg-[#f1e4de]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={site.links.login}
            className="shrink-0 rounded-full border border-[rgba(201,167,156,0.6)] bg-[#fffaf5] px-3.5 py-2 font-medium transition-colors hover:bg-[#f1e4de]"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
