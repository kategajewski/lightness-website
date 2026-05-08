import Link from "next/link";
import { footerNavigation, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="px-4 pb-5 pt-8 sm:px-6 sm:pt-10">
      <div className="mx-auto w-full max-w-[1180px] rounded-[2rem] border border-[rgba(76,58,48,0.14)] bg-[rgba(235,223,210,0.96)]">
        <div className="grid gap-4 px-5 py-4 text-[var(--color-muted)] sm:grid-cols-2 sm:items-start sm:gap-x-6 sm:gap-y-5 sm:px-6 sm:py-5 md:grid-cols-[1.05fr_0.8fr_0.9fr] md:px-7 md:py-6">
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/homepage-images/hand-logo.png"
                alt={`${site.name} logo`}
                className="h-9 w-9 rounded-full object-cover opacity-90"
              />
              <strong className="block text-[var(--color-text)]">
                {site.name}
              </strong>
            </div>
          </div>

          <div className="space-y-2">
            <strong className="block text-[var(--color-text)]">
              Navigate
            </strong>
            <div className="grid gap-1">
              {footerNavigation.map((item) => (
                <Link key={item.label} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <strong className="block text-[var(--color-text)]">
              Connect
            </strong>
            <div className="grid gap-1">
              <p className="max-w-[15rem] leading-relaxed">{site.contact.address}</p>
              <Link href={site.social.instagram}>Instagram</Link>
              <Link href={site.links.emailUpdates}>Email Updates</Link>
              <Link href={site.links.login}>Member Login</Link>
              <Link href={site.links.contact}>Email</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
