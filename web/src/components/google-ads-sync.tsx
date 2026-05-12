"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const googleTagId =
  process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ||
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

const measurementIds = [
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
].filter((id): id is string => Boolean(id));

const conversionLabels = {
  contact: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONTACT_CONVERSION_LABEL,
  emailSignup: process.env.NEXT_PUBLIC_GOOGLE_ADS_EMAIL_SIGNUP_CONVERSION_LABEL,
  calendlyClick: process.env.NEXT_PUBLIC_GOOGLE_ADS_CALENDLY_CONVERSION_LABEL,
  checkoutSuccess: process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL,
};

function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, params);
}

function trackGoogleAdsConversion(label?: string, params: Record<string, unknown> = {}) {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  if (!adsId || !label || typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: `${adsId}/${label}`,
    ...params,
  });
}

function trackOnce(key: string, callback: () => void) {
  const storageKey = `lightness-platform:${key}`;

  if (sessionStorage.getItem(storageKey)) {
    return;
  }

  sessionStorage.setItem(storageKey, "true");
  callback();
}

function GoogleAdsEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");
  const eventSlug = searchParams.get("eventSlug");

  useEffect(() => {
    if (!googleTagId) {
      return;
    }

    const url = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;

    for (const id of measurementIds) {
      window.gtag?.("config", id, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pathname === "/contact" && status === "success") {
      trackOnce("contact-form-success", () => {
        trackEvent("generate_lead", {
          lead_source: "contact_form",
        });
        trackGoogleAdsConversion(conversionLabels.contact);
      });
    }

    if (pathname === "/email-updates" && status === "success") {
      trackOnce("email-signup-success", () => {
        trackEvent("sign_up", {
          method: "email_updates",
        });
        trackGoogleAdsConversion(conversionLabels.emailSignup);
      });
    }

    if (pathname === "/checkout/success") {
      trackOnce(`checkout-success:${type ?? "offer"}:${eventSlug ?? slug ?? "unknown"}`, () => {
        trackEvent("purchase", {
          transaction_type: type ?? "offer",
          item_slug: eventSlug ?? slug,
        });
        trackGoogleAdsConversion(conversionLabels.checkoutSuccess);
      });
    }
  }, [eventSlug, pathname, slug, status, type]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a");
      const href = link?.getAttribute("href") ?? "";

      if (!href) {
        return;
      }

      if (href.includes("calendly.com/thelightnessofbeing")) {
        trackEvent("book_appointment_click", {
          link_url: href,
        });
        trackGoogleAdsConversion(conversionLabels.calendlyClick);
      }

      if (href.startsWith("mailto:")) {
        trackEvent("email_click", {
          link_url: href,
        });
      }

      if (href.startsWith("tel:")) {
        trackEvent("phone_click", {
          link_url: href,
        });
      }
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}

export function GoogleAdsSync() {
  if (!googleTagId) {
    return null;
  }

  return (
    <>
      <Script
        id="google-tag-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${measurementIds
            .map((id) => `gtag('config', '${id}', { send_page_view: false });`)
            .join("\n")}
        `}
      </Script>
      <GoogleAdsEvents />
    </>
  );
}
