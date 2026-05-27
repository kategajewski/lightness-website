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
  title: site.name,
  description: site.description,
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
