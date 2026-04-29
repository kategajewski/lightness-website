import Link from "next/link";
import { footerNavigation, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="px-4 pb-12 pt-4 sm:px-6">
      <div className="mx-auto w-full max-w-[1180px] rounded-[2rem] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.72)]">
        <div className="grid gap-8 px-8 py-10 text-[var(--color-muted)] md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <img
                src="/homepage-images/hand-logo.png"
                alt={`${site.name} logo`}
                className="h-10 w-10 rounded-full object-cover opacity-90"
              />
              <strong className="block text-[var(--color-text)]">
                {site.name}
              </strong>
            </div>
            <div>Private healing sessions in Patchogue, NY.</div>
          </div>

          <div className="grid gap-2">
            <strong className="mb-1 block text-[var(--color-text)]">
              Navigate
            </strong>
            {footerNavigation.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-2">
            <strong className="mb-1 block text-[var(--color-text)]">
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
