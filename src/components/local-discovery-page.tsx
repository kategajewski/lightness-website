import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { site } from "@/lib/site";

type Detail = { title: string; description: string };
type Faq = { question: string; answer: string };

export type LocalDiscoveryPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  serviceName: string;
  path: `/${string}`;
  image: string;
  imageAlt: string;
  introductionTitle: string;
  introduction: string[];
  details: readonly Detail[];
  goodToKnow: readonly string[];
  faqs: readonly Faq[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export function LocalDiscoveryPage(props: LocalDiscoveryPageProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${site.url}${props.path}#service`,
        name: props.serviceName,
        description: props.description,
        url: `${site.url}${props.path}`,
        image: `${site.url}${props.image}`,
        provider: { "@id": `${site.url}/#business` },
        areaServed: [
          { "@type": "City", name: "Patchogue" },
          { "@type": "AdministrativeArea", name: "Long Island" },
          { "@type": "State", name: "New York" },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}${props.path}#faq`,
        mainEntity: props.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <PageShell
      eyebrow={props.eyebrow}
      title={props.title}
      description={props.description}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Serving Patchogue & Long Island
          </span>
          <h2 className="display-section-title">{props.introductionTitle}</h2>
          {props.introduction.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-4 max-w-[42rem] text-[1.03rem] text-[var(--color-muted)]"
            >
              {paragraph}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={props.primaryCta.href} className="button-pill">
              {props.primaryCta.label}
            </Link>
            <Link href={props.secondaryCta.href} className="button-pill">
              {props.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.72)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
          <img
            src={props.image}
            alt={props.imageAlt}
            className="block aspect-[4/5] w-full object-cover object-center"
          />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {props.details.map((detail) => (
          <article
            key={detail.title}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <h2 className="display-card-title">{detail.title}</h2>
            <p className="mt-4 text-[var(--color-muted)]">{detail.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[0.9fr_1.1fr] sm:p-10">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            A Grounded, Personal Approach
          </span>
          <h2 className="display-section-title">What to know before you begin.</h2>
        </div>
        <ul className="grid gap-3 text-[var(--color-muted)]">
          {props.goodToKnow.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[rgba(93,81,72,0.8)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Frequently Asked Questions
        </span>
        <h2 className="display-section-title">A little more clarity.</h2>
        <div className="mt-8 grid gap-4">
          {props.faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[20px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.7)] p-5 open:bg-[rgba(255,248,242,0.9)]"
            >
              <summary className="cursor-pointer list-none pr-6 font-bold text-[var(--color-text)] marker:content-none">
                {faq.question}
              </summary>
              <p className="mt-3 max-w-[52rem] text-[var(--color-muted)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(246,229,214,0.9),rgba(238,226,218,0.78))] p-8 text-center shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <h2 className="display-section-title">Ready to explore what feels right for you?</h2>
        <p className="mx-auto mt-4 max-w-[40rem] text-[var(--color-muted)]">
          Connect with Kate to ask a question, choose the right offering, or take the next step.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={props.primaryCta.href} className="button-pill">
            {props.primaryCta.label}
          </Link>
          <Link href={site.links.contact} className="button-pill">
            Contact Kate
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
