import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Writing on Reiki, Healing & Embodiment by Kate Gajewski",
  description:
    "Read Kate Gajewski's essays on Reiki, healing, embodiment, practitioner life, spiritual growth, and the honest realities of transformation.",
  path: "/writing",
  image: "/homepage-images/about-pinkbowlsmile.jpeg",
});

export const revalidate = 3600;

type Article = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  image?: string;
};

const publicationUrl = "https://thelightnessofbeing.substack.com";
const feedUrl = `${publicationUrl}/feed`;

const fallbackArticles: Article[] = [
  {
    title: "Traditional Reiki vs Holy Fire® Reiki: Why I Believe This Evolution Changes Everything",
    description:
      "A personal story about energy, Source, and why Holy Fire® Reiki is transforming the healing world.",
    url: `${publicationUrl}/p/traditional-reiki-vs-holy-fire-reiki`,
    publishedAt: "2026-03-09T21:17:06.000Z",
  },
  {
    title: "From Warrior to Queen",
    description:
      "The shift from fighting for my place to knowing it is already mine—and growing into safety after years of survival mode.",
    url: `${publicationUrl}/p/from-warrior-to-queen`,
    publishedAt: "2026-02-26T18:32:59.000Z",
  },
  {
    title: "Reiki Was My Gateway",
    description: "Everything I have now began with a session I almost did not book.",
    url: `${publicationUrl}/p/reiki-was-my-gateway`,
    publishedAt: "2026-02-18T20:03:33.000Z",
  },
  {
    title: "The Honest Realities of This Path",
    description: "Field notes from a healer who is also very much human.",
    url: `${publicationUrl}/p/the-honest-realities-of-this-path`,
    publishedAt: "2026-02-11T20:25:06.000Z",
  },
];

function decodeXml(value: string) {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

function readTag(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1].trim()) : "";
}

function parseFeed(xml: string): Article[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .map((match) => {
      const item = match[1];
      const enclosure = item.match(/<enclosure[^>]+url="([^"]+)"/i);

      return {
        title: readTag(item, "title"),
        description: readTag(item, "description").replace(/<[^>]*>/g, ""),
        url: readTag(item, "link"),
        publishedAt: new Date(readTag(item, "pubDate")).toISOString(),
        image: enclosure ? decodeXml(enclosure[1]) : undefined,
      };
    })
    .filter((article) => article.title && article.url && article.publishedAt);
}

async function getArticles() {
  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": `${site.name} website feed reader` },
    });

    if (!response.ok) return fallbackArticles;

    const articles = parseFeed(await response.text());
    return articles.length ? articles : fallbackArticles;
  } catch {
    return fallbackArticles;
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(date));
}

export default async function WritingPage() {
  const articles = await getArticles();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/writing#collection`,
    name: "Writing by Kate Gajewski",
    description:
      "Essays on Reiki, healing, embodiment, spiritual growth, and practitioner life.",
    url: `${site.url}/writing`,
    author: { "@id": `${site.url}/#kate-gajewski` },
    hasPart: articles.map((article) => ({
      "@type": "Article",
      headline: article.title,
      description: article.description,
      datePublished: article.publishedAt,
      url: article.url,
      author: { "@id": `${site.url}/#kate-gajewski` },
    })),
  };

  return (
    <PageShell
      eyebrow="Writing by Kate"
      title="Honest reflections from inside healing, practice, and becoming."
      description="Essays on Reiki, embodiment, spiritual growth, practitioner life, and the deeply human realities of transformation—published through Kate's Substack."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <section className="grid gap-7 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.78)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] lg:grid-cols-[1.15fr_0.85fr] lg:items-center sm:p-10">
        <div>
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            The Lightness of Being on Substack
          </span>
          <h2 className="display-section-title">Writing that makes room for the real story.</h2>
          <p className="mt-5 max-w-[42rem] text-[1.03rem] text-[var(--color-muted)]">
            Kate writes at the intersection of healing, embodiment, truth, and the lived experience of holding space. Some pieces are teachings, some are personal reflections, and some are field notes from a practitioner who is still fully human.
          </p>
        </div>
        <div className="rounded-[24px] bg-[rgba(255,248,242,0.86)] p-6">
          <strong className="block text-[1.05rem] text-[var(--color-text)]">
            Receive new essays by email
          </strong>
          <p className="mt-3 text-[var(--color-muted)]">
            Subscribe free on Substack and each new piece will arrive directly in your inbox.
          </p>
          <Link href={`${publicationUrl}/subscribe`} className="button-pill mt-5 inline-flex">
            Subscribe to Kate&apos;s Writing
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {articles.map((article, index) => (
          <article
            key={article.url}
            className="flex h-full flex-col overflow-hidden rounded-[26px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            {article.image ? (
              <img
                src={article.image}
                alt=""
                className="aspect-[16/9] w-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            ) : null}
            <div className="flex flex-1 flex-col p-7">
              <time
                dateTime={article.publishedAt}
                className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]"
              >
                {formatDate(article.publishedAt)}
              </time>
              <h2 className="mt-3 display-card-title">{article.title}</h2>
              <p className="mt-4 flex-1 text-[var(--color-muted)]">{article.description}</p>
              <Link href={article.url} className="mt-6 font-bold text-[#5d5148]">
                Read on Substack →
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(246,229,214,0.9),rgba(238,226,218,0.78))] p-8 text-center shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
        <h2 className="display-section-title">Let the writing meet you where you are.</h2>
        <p className="mx-auto mt-4 max-w-[40rem] text-[var(--color-muted)]">
          Explore every essay, subscribe for new reflections, or return to the website to learn more about Kate&apos;s healing work.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={publicationUrl} className="button-pill">Visit the Full Publication</Link>
          <Link href={site.links.services} className="button-pill">Explore Healing Sessions</Link>
        </div>
      </section>
    </PageShell>
  );
}
