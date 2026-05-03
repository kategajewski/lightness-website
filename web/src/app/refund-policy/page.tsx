import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

const refundSections = [
  {
    title: "General Policy",
    body: [
      "Because offerings may include scheduled services, live events, trainings, memberships, and digital materials, refund eligibility may vary by purchase type.",
      "All refund requests are reviewed in good faith and in alignment with the nature of the offering purchased.",
    ],
  },
  {
    title: "Private Sessions",
    body: [
      "Private healing sessions may be rescheduled with advance notice, subject to availability.",
      "Missed appointments or late cancellations may be non-refundable unless otherwise stated at the time of booking.",
    ],
  },
  {
    title: "Memberships",
    body: [
      "Membership charges are generally non-refundable once a billing period has begun, unless otherwise required by law.",
      "If you cancel a membership, access may continue through the end of the current billing period unless otherwise stated.",
    ],
  },
  {
    title: "Trainings, Workshops, and Events",
    body: [
      "Live trainings, workshops, ceremonies, and events may involve reserved space, preparation, or limited-capacity attendance. Because of this, refunds may be limited or unavailable after a certain point.",
      "If an event is canceled by the business, attendees may be offered a refund, transfer, credit, or rescheduled option depending on the circumstances.",
    ],
  },
  {
    title: "Digital Content and Downloads",
    body: [
      "If a purchase includes immediate access to digital materials, downloads, recordings, or protected content, refunds may be limited once access has been granted.",
    ],
  },
  {
    title: "Gift Certificates",
    body: [
      "Gift certificate purchases are generally non-refundable unless required by law or unless the purchase cannot be fulfilled.",
    ],
  },
  {
    title: "Requesting a Refund",
    body: [
      "If you believe a refund, transfer, or credit should be considered, please contact the business with your name, purchase details, and reason for the request.",
      "Requests are reviewed individually and any exception remains at the discretion of the business unless otherwise required by law.",
    ],
  },
  {
    title: "Chargebacks and Payment Disputes",
    body: [
      "If you have a concern about a charge, please reach out first before initiating a chargeback or payment dispute so we have an opportunity to resolve the issue directly.",
    ],
  },
  {
    title: "Changes to This Policy",
    body: [
      "This Refund Policy may be updated from time to time. Updated versions will be posted on this page with the current effective date.",
    ],
  },
  {
    title: "Contact",
    body: [
      `For refund or cancellation questions, you may contact ${site.name} at ${site.contact.address}.`,
      "If you want, we can later replace this with your exact public support email and more specific cancellation windows.",
    ],
  },
] as const;

export default function RefundPolicyPage() {
  return (
    <PageShell
      eyebrow="Refund Policy"
      title="How refunds, cancellations, and credits are handled."
      description="Effective date: March 24, 2026. This is a practical working draft for The Lightness of Being and should be reviewed and customized to reflect your exact business policies before launch."
    >
      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <div className="grid gap-8">
          {refundSections.map((section) => (
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
