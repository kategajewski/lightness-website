import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import {
  appointmentGuides,
  appointmentStudio,
  getAppointmentGuide,
} from "@/lib/appointment-guides";

type AppointmentGuidePageProps = {
  params: Promise<{ service: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return appointmentGuides.map((guide) => ({ service: guide.slug }));
}

export async function generateMetadata({
  params,
}: AppointmentGuidePageProps): Promise<Metadata> {
  const { service } = await params;
  const guide = getAppointmentGuide(service);

  return {
    title: guide ? `${guide.service} Appointment Preparation` : "Appointment Preparation",
    description: guide
      ? `Read Kate’s preparation and appointment details for your ${guide.service} session.`
      : "Prepare for your session with The Lightness of Being.",
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

const emphasizedPhrases = [
  "no earlier than 5 minutes before your appointment",
  "24 hours’ notice",
  "back side of the Wekerle Insurance Agency building",
  "30-minute conversation by phone or Google Meet",
];

function GuideText({ text }: { text: string }) {
  const phrase = emphasizedPhrases.find((value) => text.includes(value));
  if (!phrase) return <>{text}</>;

  const start = text.indexOf(phrase);
  return (
    <>
      {text.slice(0, start)}
      <strong className="font-semibold text-[var(--color-text)]">{phrase}</strong>
      {text.slice(start + phrase.length)}
    </>
  );
}

function StudioDirections() {
  return (
    <div className="mt-5 grid gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-5 sm:p-6">
      <address className="not-italic text-[var(--color-text)]">
        <span className="font-semibold">{appointmentStudio.name}</span>
        <br />
        {appointmentStudio.street}
        <br />
        {appointmentStudio.city}
      </address>
      <p>
        <GuideText text={appointmentStudio.directions} />
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <a
          href={appointmentStudio.googleMaps}
          className="inline-flex min-h-11 items-center font-semibold text-[var(--color-text)] underline underline-offset-4"
        >
          Open Google Maps
        </a>
        <a
          href={appointmentStudio.appleMaps}
          className="inline-flex min-h-11 items-center font-semibold text-[var(--color-text)] underline underline-offset-4"
        >
          Open Apple Maps
        </a>
      </div>
    </div>
  );
}

export default async function AppointmentGuidePage({
  params,
}: AppointmentGuidePageProps) {
  const { service } = await params;
  const guide = getAppointmentGuide(service);
  if (!guide) notFound();

  return (
    <PageShell eyebrow={guide.service} title={guide.title}>
      <article className="mx-auto w-full max-w-[48rem] rounded-[28px] border border-[var(--color-line)] bg-[var(--color-ivory)] px-5 py-7 shadow-[0_20px_70px_rgba(59,41,31,0.06)] sm:px-10 sm:py-10">
        <div className="grid gap-4 text-base leading-[1.8] text-[var(--color-muted)] sm:text-[1.05rem]">
          {guide.introduction.map((paragraph) => (
            <p key={paragraph}>
              <GuideText text={paragraph} />
            </p>
          ))}
        </div>

        <nav
          aria-label="On this page"
          className="my-7 flex flex-wrap gap-2 border-y border-[var(--color-line)] py-4"
        >
          {guide.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-2 text-sm font-medium text-[var(--color-text)] underline-offset-4 hover:underline"
            >
              {section.title}
            </a>
          ))}
        </nav>

        <div className="grid gap-9 sm:gap-10">
          {guide.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className="scroll-mt-44 lg:scroll-mt-28"
            >
              <h2
                id={`${section.id}-heading`}
                className="font-display mb-4 text-[1.75rem] leading-tight text-[var(--color-text)] sm:text-[2rem]"
              >
                {section.title}
              </h2>
              <div className="grid gap-4 text-base leading-[1.8] text-[var(--color-muted)] sm:text-[1.05rem]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>
                    <GuideText text={paragraph} />
                  </p>
                ))}
                {section.intake ? (
                  <div className="pt-1">
                    <a
                      href={section.intake.href}
                      className="button-pill max-w-full text-center"
                    >
                      {section.intake.label}
                    </a>
                  </div>
                ) : null}
                {section.studioDirections ? <StudioDirections /> : null}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-9 grid gap-4 border-t border-[var(--color-line)] pt-7 text-base leading-[1.8] text-[var(--color-muted)] sm:text-[1.05rem]">
          <p>{guide.closing}</p>
          <p>
            With love,
            <br />
            <span className="font-display text-[1.75rem] text-[var(--color-text)]">Kate</span>
          </p>
        </div>
      </article>
    </PageShell>
  );
}
