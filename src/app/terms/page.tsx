import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const termsSections = [
  {
    title: "Acceptance of Terms",
    body: [
      `By accessing or using the ${site.name} website, services, courses, memberships, booking links, or protected member areas, you agree to be bound by these Terms of Use.`,
      "If you do not agree to these terms, please do not use the website or related services.",
    ],
  },
  {
    title: "Services and Educational Content",
    body: [
      "This website may include information about healing services, memberships, courses, classes, events, and educational materials.",
      "All content is provided for informational, educational, or business purposes and is subject to change without notice.",
    ],
  },
  {
    title: "No Medical, Mental Health, or Legal Advice",
    body: [
      "The services, teachings, content, and materials offered through this website are not a substitute for medical care, mental health treatment, legal advice, or other licensed professional services.",
      "You are responsible for seeking appropriate professional care when needed.",
    ],
  },
  {
    title: "Bookings, Purchases, and Payments",
    body: [
      "Appointments, courses, memberships, events, and other offerings may be booked or purchased through third-party platforms such as Calendly and Stripe.",
      "By making a purchase, you agree to provide accurate billing and account information and to pay all applicable charges associated with your order.",
    ],
  },
  {
    title: "Refunds and Cancellations",
    body: [
      "Refund, cancellation, transfer, and rescheduling terms may vary depending on the service, course, membership, or event purchased.",
      "Please review the dedicated Refund Policy page for additional details about how refund requests, cancellations, event transfers, and membership billing questions are handled.",
    ],
  },
  {
    title: "Member Accounts",
    body: [
      "If you create a member account, you are responsible for maintaining the confidentiality of your login information and for all activity that occurs under your account.",
      "We reserve the right to suspend or terminate access if account misuse, unauthorized sharing, fraud, or violation of these terms is suspected.",
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "All website content, branding, text, designs, graphics, course materials, downloads, audio, video, and related materials are owned by or licensed to The Lightness of Being unless otherwise stated.",
      "You may not reproduce, distribute, modify, share, resell, or create derivative works from protected content without prior written permission.",
    ],
  },
  {
    title: "Permitted Use",
    body: [
      "You agree to use this website only for lawful purposes and in a way that does not infringe on the rights of others, interfere with the operation of the site, or misuse any protected content or member-only materials.",
    ],
  },
  {
    title: "Third-Party Links and Services",
    body: [
      "This website may include links to third-party services, websites, or tools. We are not responsible for the content, availability, policies, or practices of those third parties.",
    ],
  },
  {
    title: "Disclaimers",
    body: [
      "The website and its content are provided on an 'as is' and 'as available' basis without warranties of any kind, whether express or implied.",
      "We do not guarantee uninterrupted access, error-free operation, or specific business, emotional, or personal outcomes from use of the site or services.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, The Lightness of Being shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from your use of the website, services, bookings, purchases, or member content.",
    ],
  },
  {
    title: "Changes to These Terms",
    body: [
      "We may update these Terms of Use from time to time. Continued use of the website after changes are posted constitutes acceptance of the updated terms.",
    ],
  },
  {
    title: "Contact",
    body: [
      `If you have questions about these terms, you may contact ${site.name} at ${site.contact.address}.`,
      "If you would like, we can later replace this section with your preferred public business email address.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms"
      title="The terms that govern use of this website and its services."
      description="Effective date: March 22, 2026. This is a practical working draft for The Lightness of Being and should be reviewed by legal counsel if you want formal legal advice."
    >
      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <div className="grid gap-8">
          {termsSections.map((section) => (
            <article key={section.title} className="grid gap-4">
              <h2 className="display-section-title">
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
