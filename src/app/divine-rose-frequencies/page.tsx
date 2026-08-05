import Link from "next/link";
import { submitContactInquiry } from "@/app/contact/actions";
import { FormSecurityFields } from "@/components/form-security-fields";
import { PageShell } from "@/components/page-shell";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { createPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Custom Rose-Petal Rosaries, Malas & Prayer Beads",
  description: "Commission handcrafted sacred rosaries, 108-bead malas, and custom prayer strands made from real rose petals by Kate Gajewski.",
  path: "/divine-rose-frequencies",
  image: "/divine-rose-frequency/divine-rose-frequency-flyer.png",
});

const strandOptions = [
  "Catholic-style rosary",
  "108-bead mala",
  "Custom prayer strand",
  "I am not sure yet",
] as const;

const petalOptions = [
  "I have rose petals to provide",
  "I would like Kate to source the petals",
  "I am not sure yet",
] as const;

const deliveryOptions = [
  "Local pickup",
  "Shipping",
  "I am not sure yet",
] as const;

type GalleryItem = {
  image: string;
  title: string;
  description: string;
  size?: "cover" | "contain";
  position?: string;
};

const galleryItems: readonly GalleryItem[] = [
  {
    image: "/divine-rose-frequency/black-pink-rosary-red-satin.jpeg",
    title: "Catholic-style rose-petal rosary",
    description: "Rose-petal beads with silver accents, rose detail, and a devotional crucifix.",
  },
  {
    image: "/divine-rose-frequency/green-catholic-rosary-satin.jpeg",
    title: "Green accent Catholic rosary",
    description: "A devotional rosary with rose-petal beads, green stone accents, and a classic crucifix.",
  },
  {
    image: "/divine-rose-frequency/gold-marian-rosary-full.jpeg",
    title: "Catholic Rosary with Rose Quartz & Rose accents",
    description: "A full Catholic-style rosary with rose-petal beads, pale stone accents, and gold sacred details.",
    size: "contain",
  },
  {
    image: "/divine-rose-frequency/rose-quartz-mala-pink-tassel.jpeg",
    title: "Rose quartz mala",
    description: "Hand-rolled rose-petal beads paired with rose quartz and a soft pink tassel.",
  },
  {
    image: "/divine-rose-frequency/emerald-rose-mala.jpeg",
    title: "Malachite & Rose Mala",
    description: "A malachite mala with hand-rolled rose-petal beads and a deep green tassel.",
  },
  {
    image: "/divine-rose-frequency/amethyst-catholic-rosary.jpeg",
    title: "Amethyst & Rose Mala with Cross",
    description: "A devotional mala pairing amethyst with rose-petal beads and an ornate cross.",
  },
  {
    image: "/divine-rose-frequency/red-tassel-mala-display.jpeg",
    title: "Garnet & Rose Mala with Red Tassel",
    description: "A garnet and rose-petal bead mala finished with a deep red tassel.",
  },
  {
    image: "/divine-rose-frequency/blue-gold-ankh-prayer-strand.jpeg",
    title: "Lapis Lazuli, Onyx & Tigers Eye with Ankh Mala",
    description: "A lapis lazuli, onyx, tiger's eye, and rose-petal bead mala with gold details and an ankh charm.",
  },
  {
    image: "/divine-rose-frequency/gold-tassel-wood-rose-mala.jpeg",
    title: "Sandalwood & Rose Mala",
    description: "A sandalwood and rose-petal bead mala finished with a gold tassel for grounded devotion.",
  },
  {
    image: "/divine-rose-frequency/rose-rosary-white-display.jpeg",
    title: "Rose Quartz Catholic Rosary with Rose Details",
    description: "A Catholic-style rosary with rose quartz, rose-petal beads, and silver rose details.",
  },
  {
    image: "/divine-rose-frequency/silver-marian-rosary-full.jpeg",
    title: "Catholic Rosary with Gold Accent",
    description: "A Catholic-style rosary with rose-petal beads, pale accents, gold details, and a Marian centerpiece.",
    size: "contain",
  },
  {
    image: "/divine-rose-frequency/gold-marian-rosary-detail.jpeg",
    title: "Catholic Rosary with Silver Accent",
    description: "A Catholic-style rosary with rose-petal beads, pale stone accents, silver spacing, and crucifix detail.",
  },
  {
    image: "/divine-rose-frequency/blush-tassel-outdoor-hand.jpeg",
    title: "Matted Rose Quartz & Rose Mala",
    description: "A matted rose quartz and rose-petal bead mala with a soft blush tassel.",
  },
  {
    image: "/divine-rose-frequency/pink-tassel-hand-detail.jpeg",
    title: "Rose quartz hand detail",
    description: "A closer look at faceted rose quartz, rose-petal beads, and soft pink silk.",
  },
  {
    image: "/divine-rose-frequency/red-tassel-hand-detail.jpeg",
    title: "Red tassel hand detail",
    description: "A tactile view of the rose-petal bead texture with deep red silk.",
  },
  {
    image: "/divine-rose-frequency/rose-bouquet-kate.jpeg",
    title: "From rose to strand",
    description: "The roses that begin the process, before they are transformed into rose clay.",
    position: "left 18%",
  },
] as const;

type DivineRoseFrequenciesPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function DivineRoseFrequenciesPage({
  searchParams,
}: DivineRoseFrequenciesPageProps) {
  const params = await searchParams;
  const status = params?.status;
  const message = params?.message;

  return (
    <PageShell
      eyebrow="Divine Rose Frequency"
      title="Divine Rose Frequency"
      description="Handmade rosaries, malas, and sacred adornments made from real rose petals, created with intention and worn with devotion."
    >
      <section className="overflow-hidden rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] shadow-[0_24px_80px_rgba(59,41,31,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex min-h-[24rem] items-center justify-center bg-[linear-gradient(135deg,rgba(255,252,248,0.94),rgba(249,228,219,0.72))] p-8">
            <div
              aria-label="Divine Rose Frequency handmade rosaries and sacred adornments mark"
              className="aspect-square w-full max-w-[18rem] bg-[url('/divine-rose-frequency/divine-rose-frequency-mark.png')] bg-contain bg-center bg-no-repeat"
              role="img"
            />
          </div>
          <div className="p-8 sm:p-10 lg:p-12">
            <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Handmade With Intention
            </span>
            <h2 className="display-section-title">
              Worn with devotion, made bead by bead.
            </h2>
            <div className="mt-5 grid gap-4 text-[var(--color-muted)]">
              <p>
                Prayer beads have been used across cultures for thousands of years as
                tools for meditation, mantra, and heartfelt connection. While often
                associated with Catholicism, their origins trace back to ancient
                Eastern traditions, where moving bead by bead became a sacred rhythm
                of presence and peace.
              </p>
              <p>
                These rosaries begin with real rose petals, gently transformed into
                rose clay and hand-rolled into beads. Each strand carries the essence
                of the flower: love, remembrance, and spiritual blooming.
              </p>
              <p>
                Every piece is handcrafted with care and can be customized in the
                style that speaks to you, from a Catholic-style rosary to a 108-bead
                mala or a design entirely your own.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Catholic-Style Rosaries",
            description:
              "A traditional devotional strand created with rose-petal beads, optional crucifix, centerpiece, and personal color or metal accents.",
          },
          {
            title: "108-Bead Malas",
            description:
              "A meditation strand for mantra, breathwork, prayer, or daily practice, crafted with the same rose clay and sacred intention.",
          },
          {
            title: "Custom Sacred Strands",
            description:
              "A fully personal design for remembrance, ceremony, spiritual support, gifting, or a meaningful life transition.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(180deg,rgba(255,252,248,0.88),rgba(250,243,236,0.92))] p-7 shadow-[0_24px_80px_rgba(59,41,31,0.08)]"
          >
            <div className="mb-5 h-12 w-12 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fefaf4,rgba(255,255,255,0.12)),linear-gradient(135deg,rgba(168,178,159,0.72),rgba(201,159,146,0.76))]" />
            <h3 className="display-card-title">{item.title}</h3>
            <p className="mt-3 text-[var(--color-muted)]">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-6 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-8">
        <div className="mb-7 max-w-[44rem]">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Sacred Adornments
          </span>
          <h2 className="display-section-title">
            Each strand carries its own texture, color, and intention.
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">
            Designs can include rose-petal beads, crystal or wooden accents,
            tassels, crucifixes, rose centerpieces, and other meaningful details.
          </p>
        </div>

        <div className="-mx-6 overflow-x-auto px-6 pb-3 [scrollbar-width:thin] sm:-mx-8 sm:px-8">
          <div className="flex snap-x snap-mandatory gap-4">
          {galleryItems.map((item) => (
            <article
              key={item.image}
              className="group flex w-[min(82vw,23rem)] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,252,248,0.86)] shadow-[0_18px_44px_rgba(59,41,31,0.06)]"
            >
              <div
                aria-label={item.title}
                className="h-[18rem] bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-[1.02]"
                role="img"
                style={{
                  backgroundImage: `url('${item.image}')`,
                  backgroundPosition: item.position ?? "center",
                  backgroundSize: item.size ?? "cover",
                }}
              />
              <div className="flex min-h-[12rem] flex-1 flex-col p-5">
                <h3 className="display-card-title text-[1.35rem]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.95rem] text-[var(--color-muted)]">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="min-w-0 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[rgba(255,251,246,0.82)] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10">
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Custom Order
          </span>
          <h2 className="display-section-title">
            Create your own sacred strand.
          </h2>
          <div className="mt-5 grid gap-4 text-[var(--color-muted)]">
            <p>
              Share the rose petals, intention, style, and details you are
              imagining. Kate will review your answers and follow up personally
              with next steps, timing, and any details needed before crafting.
            </p>
            <p>
              Your finished strand becomes a personal talisman, created to
              reflect your intention and support your spiritual path.
            </p>
          </div>
          <Link
            href={site.links.contact}
            className="mt-7 inline-block font-bold text-[#5d5148]"
          >
            Ask a general question instead
          </Link>
        </div>

        <form
          action={submitContactInquiry}
          className="min-w-0 rounded-[30px] border border-[rgba(76,58,48,0.08)] bg-[linear-gradient(135deg,rgba(248,242,235,0.9),rgba(239,229,217,0.86))] p-8 shadow-[0_24px_80px_rgba(59,41,31,0.08)] sm:p-10"
        >
          <span className="mb-4 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Custom Order Form
          </span>

          <FormSecurityFields />
          <input type="hidden" name="inquiryType" value="rose-frequency" />
          <input
            type="hidden"
            name="redirectTo"
            value={site.links.divineRoseFrequencies}
          />

          {status === "success" ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(124,163,130,0.22)] bg-[rgba(168,178,159,0.22)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              Your custom order request was sent successfully.
            </p>
          ) : null}

          {status === "error" ? (
            <p className="mt-6 rounded-[18px] border border-[rgba(160,95,88,0.18)] bg-[rgba(201,167,156,0.18)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              {message ?? "There was a problem submitting the form."}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                  Preferred style
                </span>
                <select
                  name="orderStyle"
                  className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
                >
                  {strandOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                  Rose petals
                </span>
                <select
                  name="rosePetalSource"
                  className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
                >
                  {petalOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Rose story or occasion
              </span>
              <textarea
                name="rosePetalDetails"
                rows={3}
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Intention or devotion
              </span>
              <textarea
                name="intention"
                rows={3}
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Colors, metals, cross, centerpiece, or accent preferences
              </span>
              <input
                type="text"
                name="preferredColors"
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>

            <div className="rounded-[18px] border border-[rgba(168,178,159,0.22)] bg-[rgba(255,251,246,0.72)] px-4 py-3 text-[0.95rem] text-[var(--color-text)]">
              Prices vary depending on the custom design and gemstone requests.
              Malas and Catholic-style rosaries generally range between $150-$200.
              <br />
              <br />
              Pieces typically take 2-3 weeks to create. Orders may take longer
              if you would like to use your own rose petals, since Kate will
              need to receive and prepare them before the bead-making process
              begins.
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                  Quantity
                </span>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  defaultValue="1"
                  className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                  Delivery preference
                </span>
                <select
                  name="deliveryPreference"
                  className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
                >
                  {deliveryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                  Shipping address
                </span>
                <input
                  type="text"
                  name="shippingAddress"
                  className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-[0.92rem] font-medium text-[var(--color-text)]">
                Anything else Kate should know?
              </span>
              <textarea
                name="message"
                required
                rows={5}
                className="rounded-[16px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,252,248,0.94)] px-4 py-3 text-[1rem] text-[var(--color-text)] outline-none"
              />
            </label>
          </div>

          <TurnstileWidget action="contact_inquiry" />

          <button type="submit" className="button-pill mt-6">
            Send Custom Order Request
          </button>
        </form>
      </section>
    </PageShell>
  );
}
