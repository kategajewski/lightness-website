import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { REIKI_RISING_AGREEMENT_VERSION } from "@/lib/reiki-rising-agreement";

export const metadata: Metadata = {
  title: "Reiki Rising Enrollment Agreement",
  description:
    "Enrollment, payment and participation terms for Reiki Rising Fall 2026.",
  robots: {
    index: false,
    follow: true,
  },
};

const sections = [
  {
    title: "1. Program Details",
    intro:
      "Reiki Rising is a 10-week Reiki 1 and Reiki 2 certification journey running from September 27 through December 5, 2026.",
    body: [
      "Live calls typically last 60 minutes with space to extend to 75 minutes when needed.",
    ],
    list: [
      "Ten prerecorded weekly modules released on Sundays",
      "Live support calls on Wednesdays at 7:00 PM Eastern Time",
      "Remote Reiki Level 1 and Level 2 placements",
      "Student portal access with materials and replays",
      "Telegram community support through December 5, 2026",
      "Virtual practice opportunities and integration support",
    ],
  },
  {
    title: "2. Certification Requirements",
    intro:
      "Enrollment does not guarantee certification. To receive a Reiki 1 and Reiki 2 certificate, the student must complete the requirements below.",
    body: [
      "One additional group make-up placement is included for each level if the student cannot attend the scheduled placement. A private placement may be scheduled during available office hours for an additional fee of $50 remotely or $75 in person.",
      "The certificate confirms completion of this educational program. It is not a government-issued professional license and does not guarantee employment, income or business results.",
    ],
    list: [
      "Receive the Level 1 and Level 2 placements live and remotely",
      "Complete the core weekly modules",
      "Practice self-Reiki at least five times",
      "Share remote Reiki at least two times",
      "Share Reiki in person with consent at least one time as independent practice outside the virtual classroom",
      "Submit a final reflection or practice log",
    ],
  },
  {
    title: "3. Tuition Options",
    body: [
      "The student agrees to the tuition option selected during checkout.",
      "Early Bird options available through August 31, 2026 are $888 paid in full or five monthly payments of $200 totaling $1,000.",
      "Regular enrollment options beginning September 1, 2026 are $1,111 paid in full or four monthly payments of $303 totaling $1,212.",
      "For payment plans, the first payment is charged at enrollment. The remaining payments are charged monthly through Stripe.",
      "Payment plans are fixed installment plans. They are not monthly memberships and do not automatically renew after the final payment.",
    ],
  },
  {
    title: "4. Payment Authorization",
    body: [
      "By choosing a payment plan, the student authorizes The Lightness of Being and Stripe to charge the selected payment method according to the disclosed schedule.",
      "The student agrees to maintain a valid payment method and promptly address any failed payment.",
      "Portal access may be temporarily paused if a payment remains unresolved. Pausing access does not cancel the remaining tuition balance.",
    ],
  },
  {
    title: "5. Refunds and Withdrawal",
    body: [
      "To qualify for a full refund, the request must be submitted within seven calendar days of purchase and received no later than September 20, 2026. Both conditions must be met.",
      "After September 20, 2026, tuition payments are non-refundable.",
      "A payment plan represents a commitment to the full tuition amount. Choosing to withdraw, stop attending or discontinue portal use does not automatically cancel the remaining payments.",
      "In a genuine hardship situation, Kate may choose to offer a course credit or transfer to a future cohort. Credits and transfers are considered individually and are not guaranteed.",
      "If The Lightness of Being cancels the entire training, the student may choose a refund of tuition paid or a transfer to a future cohort.",
      "Rescheduling an individual call, placement or lesson does not constitute cancellation of the full program. Reasonable notice and an alternative option will be provided when possible.",
    ],
  },
  {
    title: "6. Participation and Personal Responsibility",
    body: [
      "The student is responsible for participating within their physical, emotional and energetic comfort level.",
      "Students may pause or decline any optional exercise. Consent may be withdrawn at any time during guided practices, remote partner work or energetic exercises.",
      "Reiki Rising is held virtually. All placements, live group experiences and partner practices facilitated during the program are remote and hands-off.",
      "The student agrees to communicate questions, concerns or accessibility needs as early as possible so reasonable support can be considered.",
    ],
  },
  {
    title: "7. Wellness Disclaimer",
    body: [
      "Reiki Rising is an educational and spiritual wellness program.",
      "Reiki, energy work and the teachings provided in this program are not substitutes for medical care, mental health treatment or advice from a licensed professional.",
      "Students should continue receiving appropriate professional care and should consult a qualified provider regarding health concerns.",
      "No particular physical, emotional, spiritual or financial outcome is promised or guaranteed.",
    ],
  },
  {
    title: "8. Community Care and Confidentiality",
    body: [
      "Students agree to help maintain a respectful and supportive learning environment.",
      "Personal stories and experiences shared by other students should be treated as confidential and should not be repeated outside the program without permission.",
      "Students may not photograph, record or distribute another participant's personal sharing without clear consent.",
      "While all students are asked to respect confidentiality, The Lightness of Being cannot guarantee the conduct of every participant.",
      "Harassment, discrimination, repeated disruption or violation of another person's privacy may result in removal from community spaces or the program.",
    ],
  },
  {
    title: "9. Live Call Recordings",
    body: [
      "Some live calls may be recorded and shared within the private Reiki Rising student portal.",
      "A student's name, voice, image or chat participation may appear in a replay. Students should contact Kate before a call if they need a recording accommodation.",
      "Recordings are for enrolled students only and may not be shared outside the program.",
      "Permission to use a student's image, testimonial or story for public marketing is separate and optional. Declining promotional permission will not affect enrollment.",
    ],
  },
  {
    title: "10. Course Materials",
    body: [
      "All videos, recordings, written lessons, meditations, worksheets, graphics and training materials are owned by or licensed to The Lightness of Being.",
      "Students receive a personal and non-transferable right to use the materials for their own learning.",
      "Students may not copy, share, upload, reproduce, resell or teach directly from the protected materials without written permission.",
      "Login information and portal access may not be shared with another person.",
    ],
  },
  {
    title: "11. Technology and Third-Party Platforms",
    body: [
      "The program may use services such as Stripe, Telegram, email and the private student portal.",
      "The student is responsible for having reasonable internet access and a device capable of accessing the course.",
      "Third-party services have their own privacy practices and terms. Temporary technical interruptions will be addressed as reasonably as possible.",
    ],
  },
  {
    title: "12. Early Bird Bonus",
    body: [
      "Students who enroll by August 31, 2026 receive one complimentary 45-minute private Reiki support session with Kate.",
      "The session may be used during Reiki Rising and expires on December 12, 2026. The bonus has no cash value and is not transferable.",
    ],
  },
  {
    title: "13. Electronic Agreement",
    body: [
      "By checking the agreement box and entering their full name, the student confirms that they have read this agreement, understand the tuition and refund terms, authorize the selected payment option, understand the certification requirements and agree to participate respectfully and responsibly.",
      "Electronic acceptance has the same intended effect as a handwritten signature.",
    ],
  },
  {
    title: "14. Governing Law",
    body: [
      "This agreement is governed by the laws of the State of New York.",
      "Questions about the program, payments or this agreement may be submitted through the website contact form.",
    ],
  },
] as const;

export default function ReikiRisingEnrollmentAgreementPage() {
  return (
    <PageShell
      eyebrow="Enrollment Agreement"
      title="Reiki Rising Fall 2026"
      description={`Agreement version ${REIKI_RISING_AGREEMENT_VERSION}. Please read these enrollment, payment and participation terms before completing checkout.`}
    >
      <section className="mx-auto w-full max-w-[56rem] rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <p className="text-[1.02rem] leading-relaxed text-[var(--color-muted)]">
          This Enrollment Agreement is between the individual enrolling in
          Reiki Rising Fall 2026 and The Lightness of Being, which is operated
          by Kate Gajewski. By accepting electronically, the student confirms
          that they have reviewed and accepted the following terms.
        </p>

        <div className="mt-9 grid gap-9">
          {sections.map((section) => (
            <article key={section.title} className="grid gap-4">
              <h2 className="font-display text-[clamp(1.65rem,3vw,2.3rem)] leading-tight text-[var(--color-text)]">
                {section.title}
              </h2>
              {"intro" in section ? (
                <p className="leading-relaxed text-[var(--color-muted)]">
                  {section.intro}
                </p>
              ) : null}
              {"list" in section ? (
                <ul className="grid gap-2 pl-5 text-[var(--color-muted)]">
                  {section.list.map((item) => (
                    <li key={item} className="list-disc pl-1">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="grid gap-3 leading-relaxed text-[var(--color-muted)]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[22px] bg-[rgba(255,248,242,0.9)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Ready to enroll?
          </strong>
          <p className="mt-2 text-[var(--color-muted)]">
            Return to checkout to select your tuition option and accept this
            agreement electronically.
          </p>
          <Link href="/checkout/reiki-rising" className="button-pill mt-5">
            Return to Reiki Rising Checkout
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
