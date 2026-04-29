"use client";

import Link from "next/link";
import { useState } from "react";
import { primaryNavigation, site } from "@/lib/site";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerNavigation = primaryNavigation;

  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(76,58,48,0.08)] bg-[rgba(249,244,238,0.72)] backdrop-blur-[16px]">
      <div className="mx-auto flex min-h-[82px] w-full max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={site.links.home}
          className="flex min-w-0 items-center gap-3"
          onClick={() => setIsMenuOpen(false)}
        >
          <img
            src="/homepage-images/hand-logo.png"
            alt={`${site.name} logo`}
            className="h-11 w-11 rounded-full object-cover opacity-90"
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-display text-[1.15rem] leading-none tracking-[0.02em] sm:text-[1.45rem] lg:text-[1.9rem]">
              {site.name}
            </span>
            <span className="truncate text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted)] sm:text-[0.68rem]">
              {site.subtitle}
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-[0.95rem] text-[var(--color-muted)]">
          <div className="hidden items-center gap-5 xl:flex">
            {headerNavigation.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <Link href={site.links.login} className="hidden xl:inline-flex">
            Login
          </Link>
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((value) => !value)}
            className="inline-flex items-center justify-center rounded-full border-2 border-[#4a3d36] bg-[#fffaf5] px-5 py-4 text-[0.98rem] font-semibold text-[#4a3d36] shadow-[0_12px_28px_rgba(69,57,51,0.08)] transition-colors duration-200 hover:bg-[#f7efe6] xl:hidden"
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </nav>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.94)] px-4 pb-5 pt-3 shadow-[0_18px_42px_rgba(59,41,31,0.08)] xl:hidden">
          <div className="mx-auto grid w-full max-w-[1180px] gap-2">
            {headerNavigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-[18px] px-4 py-3 text-[1rem] text-[var(--color-text)] transition hover:bg-[rgba(243,234,224,0.9)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={site.links.login}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-[18px] px-4 py-3 text-[1rem] text-[var(--color-text)] transition hover:bg-[rgba(243,234,224,0.9)]"
            >
              Login
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
