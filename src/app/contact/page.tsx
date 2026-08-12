import Link from "next/link";
import { submitContactInquiry } from "@/app/contact/actions";
import { FormSecurityFields } from "@/components/form-security-fields";
import { PageShell } from "@/components/page-shell";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { site } from "@/lib/site";

const inquiryOptions = [
  { value: "general", label: "General inquiry" },
  { value: "healing", label: "Healing sessions" },
  { value: "events", label: "Events or ceremonies" },
  { value: "training", label: "Training or mentorship" },
  { value: "corporate", label: "Corporate wellness" },
] as const;

type ContactPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
    inquiryType?: string;
    subject?: string;
    draft?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const status = params?.status;
  const message = params?.message;
  const inquiryType = params?.inquiryType ?? "general";
  const subject = params?.subject;
  const draft = params?.draft;
  const isTrainingWaitlist = inquiryType === "training" && Boolean(subject);
  const isSoundTrainingWaitlist =
    isTrainingWaitlist && subject === "Sound Practitioner Training Waitlist";
  const isPrivateEventInquiry =
    inquiryType === "events" &&
    subject === "Private Event or Ceremony Inquiry";
  const isUpcomingEventInquiry =
    inquiryType === "events" &&
    Boolean(subject) &&
    subject !== "Private Event or Ceremony Inquiry";
  const isCorporateInquiry =
    inquiryType === "corporate" && Boolean(subject);

  const initialMessage = [subject, draft].filter(Boolean).join("\n\n");

  return (
    <PageShell
      eyebrow="Contact"
      title={
        isTrainingWaitlist
          ? isSoundTrainingWaitlist
            ? "Join the Sound Practitioner Training waitlist."
            : "Join the Reiki Rising waitlist."
          : isPrivateEventInquiry
            ? "Inquire about a private event or ceremony."
            : isUpcomingEventInquiry
              ? "Ask about an upcoming event."
              : isCorporateInquiry
                ? "Inquire about corporate wellness."
            : "Have questions? Reach out and start the conversation."
      }
      description={
        isTrainingWaitlist
          ? isSoundTrainingWaitlist
            ? "Share your details below to receive the schedule and enrollment information for January 29 through 31, 2027."
            : "Share your details below and Kate will reach out when the next Reiki Rising cohort opens."
          : isPrivateEventInquiry
            ? "Share what you are envisioning and Kate will follow up about creating a personalized ceremony, blessing, or private gathering."
            : isUpcomingEventInquiry
              ? "Use the form below to ask about an upcoming event, gathering, or registration detail."
              : isCorporateInquiry
                ? "Share a little about your team, workplace, or event and Kate will follow up about a tailored wellness offering."
            : "Whether you want to ask about sessions, training, events, or corporate wellness, this is the place to begin."
      }
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[34px] border border-[rgba(76,58,48,0.08)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
            <div className="mx-auto w-full max-w-[20rem]">
              <img
                src={
                  isSoundTrainingWaitlist
                    ? "/homepage-images/services-lightnesssound.jpeg"
                    : "/homepage-images/contact-page-magicbed.jpeg"
                }
                alt={
                  isSoundTrainingWaitlist
                    ? "Kate facilitating a sound healing experience with crystal singing bowls"
                    : "A warm and welcoming healing space"
                }
                className="block h-auto w-full rounded-[34px] object-contain object-center"
              />
            </div>
          </div>

          <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Contact Details
            </span>
            <h2 className="display-section-title">
              Choose the path that fits best.
            </h2>
            <div className="mt-6 grid gap-5 text-[var(--color-muted)]">
              <div>
                <strong className="mb-1 block text-[var(--color-text)]">
                  In-Person Sessions
                </strong>
                <div>{site.contact.address}</div>
              </div>
              <div>
                <strong className="mb-1 block text-[var(--color-text)]">
                  Book a Session
                </strong>
                <Link href={site.links.calendly} className="font-bold text-[#5d5148]">
                  Open Calendly
                </Link>
              </div>
              <div>
                <strong className="mb-1 block text-[var(--color-text)]">
                  General Contact
                </strong>
                <Link href="mailto:kate@bethelightness.com" className="font-bold text-[#5d5148]">
                  kate@bethelightness.com
                </Link>
              </div>
              <div>
                <strong className="mb-1 block text-[var(--color-text)]">
                  Instagram
                </strong>
                <Link href={site.social.instagram} className="font-bold text-[#5d5148]">
                  @thelightness0fbeing
                </Link>
              </div>
            </div>
          </div>
        </div>

        <form
          action={submitContactInquiry}
          className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.9),rgba(239,229,217,0.86))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10"
        >
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Contact Form
          </span>

          <FormSecurityFields />

          {status === "success" ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(124,163,130,0.22)] bg-[rgba(168,178,159,0.22)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              Your message was sent successfully.
            </p>
          ) : null}

          {status === "error" ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(160,95,88,0.18)] bg-[rgba(201,167,156,0.18)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              {message ?? "There was a problem submitting the form."}
            </p>
          ) : null}

          {isTrainingWaitlist ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(168,178,159,0.22)] bg-[rgba(255,251,246,0.72)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              {isSoundTrainingWaitlist
                ? "This will add you to the Sound Practitioner Training waitlist. No payment is required."
                : "This inquiry will be sent as a training request for the next Reiki Rising cohort."}
            </p>
          ) : null}

          {isPrivateEventInquiry ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(168,178,159,0.22)] bg-[rgba(255,251,246,0.72)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              This inquiry will be sent as an events and ceremonies request so Kate can respond more personally.
            </p>
          ) : null}

          {isUpcomingEventInquiry ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(168,178,159,0.22)] bg-[rgba(255,251,246,0.72)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              This inquiry will be sent as an upcoming events request so Kate can reply with the right details.
            </p>
          ) : null}

          {isCorporateInquiry ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(168,178,159,0.22)] bg-[rgba(255,251,246,0.72)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              This inquiry will be sent as a corporate wellness request so Kate can respond with a more tailored proposal.
            </p>
          ) : null}

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Name
              </span>
              <input
                type="text"
                name="name"
                required
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                  Phone
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                What are you reaching out about?
              </span>
              <select
                name="inquiryType"
                defaultValue={inquiryType}
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              >
                {inquiryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Message
              </span>
              <textarea
                name="message"
                required
                defaultValue={initialMessage}
                rows={6}
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>
          </div>

          <TurnstileWidget action="contact_inquiry" />

          <button
            type="submit"
            className="button-pill mt-6"
          >
            {isTrainingWaitlist ? "Join the Waitlist" : "Send Message"}
          </button>
        </form>

        <div className="rounded-[34px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10 lg:col-span-2">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Email Updates
          </span>
          <h2 className="display-section-title">
            Choose what you want to hear about.
          </h2>
          <p className="mt-4 max-w-[42rem] text-[var(--color-muted)]">
            Join the email list for events, yoga classes, Reiki trainings, sound
            healing, private ceremonies and membership updates. You can choose
            the topics that feel relevant to you.
          </p>
          <Link href={site.links.emailUpdates} className="button-pill mt-6">
            Join Email Updates
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
