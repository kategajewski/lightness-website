"use client";

import Link from "next/link";
import { primaryNavigation, site } from "@/lib/site";

export function SiteHeader() {
  const headerNavigation = primaryNavigation;

  return (
    <header className="relative z-20 border-b border-[rgba(76,58,48,0.08)] bg-[rgba(249,244,238,0.96)] backdrop-blur-[16px] sm:sticky sm:top-0">
      <div className="mx-auto flex min-h-[64px] w-full max-w-[1180px] items-center justify-between gap-3 px-4 sm:min-h-[82px] sm:gap-4 sm:px-6">
        <Link href={site.links.home} className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <img
            src="/homepage-images/hand-logo.png"
            alt={`${site.name} logo`}
            className="h-9 w-9 rounded-full object-cover opacity-90 sm:h-11 sm:w-11"
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-display text-[1.08rem] leading-none tracking-[0.02em] sm:text-[1.45rem] lg:text-[1.9rem]">
              {site.name}
            </span>
            <span className="truncate text-[0.52rem] uppercase tracking-[0.16em] text-[var(--color-muted)] sm:text-[0.68rem] sm:tracking-[0.18em]">
              {site.subtitle}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-[0.95rem] text-[var(--color-muted)] xl:flex">
          {headerNavigation.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href={site.links.login}>Login</Link>
        </nav>
      </div>

      <div className="border-t border-[rgba(76,58,48,0.06)] px-4 py-1.5 xl:hidden">
        <nav className="mx-auto flex w-full max-w-[1180px] gap-1.5 overflow-x-auto pb-0.5 text-[0.8rem] text-[var(--color-text)] [scrollbar-width:none] [-ms-overflow-style:none] sm:text-[0.88rem] [&::-webkit-scrollbar]:hidden">
          {headerNavigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="shrink-0 rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,251,246,0.96)] px-3 py-1.5 font-medium shadow-[0_8px_20px_rgba(59,41,31,0.05)] sm:px-3.5 sm:py-2"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={site.links.login}
            className="shrink-0 rounded-full border border-[rgba(76,58,48,0.12)] bg-[rgba(255,251,246,0.96)] px-3 py-1.5 font-medium shadow-[0_8px_20px_rgba(59,41,31,0.05)] sm:px-3.5 sm:py-2"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
