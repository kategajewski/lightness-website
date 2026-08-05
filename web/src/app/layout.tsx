import type { Metadata } from "next";
import { Belleza, Cormorant_Garamond, Lato } from "next/font/google";
import { Suspense } from "react";
import { GoogleAdsSync } from "@/components/google-ads-sync";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import "./globals.css";

const belleza = Belleza({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lightness-brand",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-lightness-display",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lightness-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Holistic Healing in Patchogue, NY`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: `${site.name} | Holistic Healing in Patchogue, NY`,
    description: site.description,
    images: [{ url: "/homepage-images/about-pinkbowlsmile.jpeg", width: 1200, height: 630, alt: "Kate Gajewski at The Lightness of Being" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Holistic Healing in Patchogue, NY`,
    description: site.description,
    images: ["/homepage-images/about-pinkbowlsmile.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

const discoveryGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["HealthAndBeautyBusiness", "LocalBusiness"],
      "@id": `${site.url}/#business`,
      name: site.name,
      alternateName: site.subtitle,
      url: site.url,
      image: `${site.url}/homepage-images/about-pinkbowlsmile.jpeg`,
      description: site.description,
      founder: { "@id": `${site.url}/#kate-gajewski` },
      address: { "@type": "PostalAddress", streetAddress: "98 Medford Ave", addressLocality: site.contact.locality, addressRegion: site.contact.region, postalCode: site.contact.postalCode, addressCountry: site.contact.country },
      areaServed: [
        { "@type": "City", name: "Patchogue" },
        { "@type": "AdministrativeArea", name: "Long Island" },
        { "@type": "Country", name: "United States", description: "Remote offerings" },
      ],
      sameAs: [site.social.instagram],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Healing, education, gatherings, and sacred goods",
        itemListElement: [
          "Reiki and energy healing sessions", "Hypnotherapy and regression sessions", "Private sound healing",
          "Reiki training and mentorship", "Sound practitioner training", "Yoga, meditation, and community events",
          "Corporate wellness experiences", "Private ceremonies and blessings", "Monthly healing membership",
          "Custom rose-petal rosaries, malas, and prayer strands", "Gift certificates",
        ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
      },
    },
    {
      "@type": "Person",
      "@id": `${site.url}/#kate-gajewski`,
      name: "Kate Gajewski",
      url: `${site.url}/about`,
      image: `${site.url}/homepage-images/about-roses-kate-flipped.jpeg`,
      jobTitle: "Holistic practitioner, teacher, and mentor",
      worksFor: { "@id": `${site.url}/#business` },
      knowsAbout: ["Reiki", "Energy healing", "Sound healing", "Hypnotherapy", "Regression therapy", "Yoga", "Meditation", "Practitioner education"],
      sameAs: [site.social.instagram],
    },
    { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, description: site.description, publisher: { "@id": `${site.url}/#business` }, inLanguage: "en-US" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${belleza.variable} ${cormorant.variable} ${lato.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(discoveryGraph).replace(/</g, "\\u003c") }} />
        <Suspense fallback={null}>
          <GoogleAdsSync />
        </Suspense>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
