import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const policySections = [
  {
    title: "Information We Collect",
    body: [
      "We may collect personal information you provide directly to us, including your name, email address, phone number, billing details, and any information you submit through contact forms, booking requests, membership signups, or course enrollment.",
      "We may also collect information related to your use of the website, such as IP address, browser type, device information, pages viewed, and referring website information.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use your information to provide services, process purchases, manage memberships or course access, respond to inquiries, send administrative or service-related communications, and improve the functionality and experience of the website.",
      "If you opt into marketing communications, we may also use your information to send updates about offerings, classes, events, or other business news.",
    ],
  },
  {
    title: "Payments",
    body: [
      "Payments are processed by third-party payment providers such as Stripe. We do not store full payment card details on our own servers.",
      "If additional payment providers are added in the future, their privacy and security practices will also apply to payment-related transactions.",
    ],
  },
  {
    title: "Scheduling and Third-Party Services",
    body: [
      "We may use third-party services such as Calendly for appointment scheduling, Supabase for authentication and account management, Vercel for site hosting, and other service providers that support the operation of the website and member experience.",
      "These providers may process your data according to their own privacy policies when necessary to deliver their services.",
    ],
  },
  {
    title: "Cookies and Analytics",
    body: [
      "We may use cookies and similar technologies to support site functionality, remember user preferences, improve website performance, and better understand how visitors interact with the site.",
      "You may be able to control cookies through your browser settings, although disabling certain cookies may affect site functionality.",
    ],
  },
  {
    title: "Member Accounts and Protected Content",
    body: [
      "If you create an account, we use your information to authenticate you, manage access to purchased or included content, and maintain the security of the member area.",
      "Access to protected resources may be tied to your account status, purchase history, or membership standing.",
    ],
  },
  {
    title: "How We Share Information",
    body: [
      "We do not sell your personal information. We may share information with trusted service providers who help us operate the website, process payments, manage appointments, send communications, or provide technical infrastructure.",
      "We may also disclose information if required by law, to protect our rights, or in connection with a business transition.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "We retain personal information for as long as reasonably necessary to provide services, comply with legal obligations, resolve disputes, enforce agreements, and maintain business records.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You may contact us to request updates, corrections, or deletion of your personal information, subject to legal or contractual obligations that may require retention.",
      "You may also unsubscribe from promotional emails using the unsubscribe link included in those communications.",
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      "This website is not intended for children under 13, and we do not knowingly collect personal information from children under 13.",
    ],
  },
  {
    title: "Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated effective date.",
    ],
  },
  {
    title: "Contact",
    body: [
      `If you have questions about this Privacy Policy or how your information is handled, you may contact ${site.name} at ${site.contact.address}.`,
      "If you would like, we can later replace this section with a dedicated business email address once you confirm the one you want listed publicly.",
    ],
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <PageShell
      eyebrow="Privacy Policy"
      title="How we collect, use, and protect information."
      description="Effective date: March 22, 2026. This is a practical website privacy policy draft for The Lightness of Being and should be reviewed by legal counsel if you want formal legal advice for your business."
    >
      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <div className="grid gap-8">
          {policySections.map((section) => (
            <article key={section.title} className="grid gap-4">
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[0.98] tracking-[-0.02em]">
                {section.title}
              </h2>
              <div className="grid gap-3 text-[var(--color-muted)]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
