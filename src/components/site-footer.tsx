import Link from "next/link";
import { site } from "@/lib/site";

const footerLinks = [
  { label: "Gift Certificate", href: site.links.giftCertificate },
  { label: "Instagram", href: site.social.instagram },
  { label: "Email Updates", href: site.links.emailUpdates },
  { label: "Writing", href: site.links.writing },
  { label: "Send a Message", href: site.links.contact },
  { label: "Member Login", href: site.links.login },
] as const;

const legalLinks = [
  { label: "Privacy", href: site.links.privacyPolicy },
  { label: "Terms", href: site.links.terms },
  { label: "Refunds", href: site.links.refundPolicy },
] as const;

export function SiteFooter() {
  return (
    <footer className="px-4 pb-5 pt-7 sm:px-6 sm:pt-9">
      <div className="mx-auto w-full max-w-[1180px] rounded-[1.5rem] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,251,246,0.72)] px-5 py-6 text-[var(--color-muted)] sm:rounded-[2rem] sm:px-8 sm:py-7">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
            <div className="flex items-center gap-3">
              <img
                src="/homepage-images/hand-logo.png"
                alt={`${site.name} logo`}
                className="h-9 w-9 rounded-full object-cover opacity-90"
              />
              <div>
                <strong className="block text-[var(--color-text)]">
                  {site.name}
                </strong>
                <span className="block text-[0.86rem]">{site.subtitle}</span>
              </div>
            </div>
            <p className="max-w-[28rem] text-[0.9rem] leading-relaxed">
              Patchogue, NY and remote healing sessions.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[0.92rem] md:justify-end">
            {footerLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[rgba(76,58,48,0.08)] pt-4 text-[0.78rem] md:justify-between">
          <span>98 Medford Ave, Patchogue, NY 11772</span>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            {legalLinks.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
