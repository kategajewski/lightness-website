import Link from "next/link";
import { footerNavigation, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="px-4 pb-5 pt-5 sm:px-6 sm:pb-12 sm:pt-4">
      <div className="mx-auto w-full max-w-[1180px] rounded-[1.35rem] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.72)] sm:rounded-[2rem]">
        <div className="grid grid-cols-2 gap-x-5 gap-y-5 px-4 py-5 text-[0.82rem] leading-relaxed text-[var(--color-muted)] sm:px-8 sm:py-10 sm:text-base md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 sm:mb-3 sm:gap-3">
              <img
                src="/homepage-images/hand-logo.png"
                alt={`${site.name} logo`}
                className="h-7 w-7 rounded-full object-cover opacity-90 sm:h-10 sm:w-10"
              />
              <strong className="block text-[0.95rem] text-[var(--color-text)] sm:text-base">
                {site.name}
              </strong>
            </div>
          </div>

          <div className="grid gap-1.5 sm:gap-2">
            <strong className="mb-0.5 block text-[var(--color-text)] sm:mb-1">
              Navigate
            </strong>
            {footerNavigation.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-1.5 sm:gap-2">
            <strong className="mb-0.5 block text-[var(--color-text)] sm:mb-1">
              Connect
            </strong>
            <div>{site.contact.address}</div>
            <Link href={site.social.instagram}>Instagram</Link>
            <Link href={site.links.login}>Member Login</Link>
            <Link href={site.links.contact}>Email</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
