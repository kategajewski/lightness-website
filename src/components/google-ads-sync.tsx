"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { createRoutePageViewTracker, createTrackingDeduper, initializeGoogleTag } from "@/lib/google-tag";
import { mentorshipLeadForms, readMentorshipLeadReceipt } from "@/lib/mentorship-lead-receipts";
import { createCalendlyAttribution, isBusinessCalendlyUrl } from "@/lib/calendly-attribution";

declare global {
  interface Window {
    dataLayer?: unknown[];
    lightnessGoogleTagInitialized?: boolean;
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
  if (typeof window === "undefined" || !googleTagId) return false;
  initializeGoogleTag(window, measurementIds)("event", eventName, params);
  return true;
}

function trackGoogleAdsConversion(label?: string, params: Record<string, unknown> = {}) {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId || !label) return false;
  return trackEvent("conversion", { send_to: `${adsId}/${label}`, ...params });
}

const dedupeTracking = createTrackingDeduper();
const trackRoutePageView = createRoutePageViewTracker();
const calendlyAttribution = createCalendlyAttribution();
function trackOnce(key: string, callback: () => boolean) {
  let storage: Storage | undefined;
  try { storage = window.sessionStorage; } catch { /* Storage may be unavailable. */ }
  return dedupeTracking(`lightness-platform:${key}`, callback, storage);
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

    const url = new URL(`${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`, window.location.origin);
    trackRoutePageView({
      target: window,
      measurementIds,
      ga4Id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      location: url.href,
      title: document.title,
      referrer: document.referrer,
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    let storage: Storage | undefined;
    try { storage = window.sessionStorage; } catch { /* Storage may be unavailable. */ }
    calendlyAttribution.capture(searchParams, storage);
    function decorateLinks() {
      for (const link of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
        const href = link.getAttribute("href") ?? "";
        const decorated = calendlyAttribution.decorate(href);
        if (decorated !== href) link.setAttribute("href", decorated);
      }
    }
    // Decorate before interaction, including keyboard, new-tab and context-menu use.
    decorateLinks();
    const observer = new MutationObserver(decorateLinks);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    return () => observer.disconnect();
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pathname === "/contact" && status === "success") {
      trackOnce("contact-form-success", () => {
        const queued = trackEvent("generate_lead", {
          lead_source: "contact_form",
        });
        trackGoogleAdsConversion(conversionLabels.contact);
        return queued;
      });
    }

    if (pathname === "/email-updates" && status === "success") {
      trackOnce("email-signup-success", () => {
        const queued = trackEvent("sign_up", {
          method: "email_updates",
        });
        trackGoogleAdsConversion(conversionLabels.emailSignup);
        return queued;
      });
    }

    if (pathname === "/checkout/success") {
      trackOnce(`checkout-success:${type ?? "offer"}:${eventSlug ?? slug ?? "unknown"}`, () => {
        const queued = trackEvent("purchase", {
          transaction_type: type ?? "offer",
          item_slug: eventSlug ?? slug,
        });
        trackGoogleAdsConversion(conversionLabels.checkoutSuccess);
        return queued;
      });
    }
  }, [eventSlug, pathname, slug, status, type]);

  useEffect(() => {
    if (!mentorshipLeadForms.some((form) => form.pathname === pathname)) return;
    function trackSavedLead() {
      const savedLead = readMentorshipLeadReceipt(document.cookie, pathname);
      if (savedLead && trackOnce(`mentorship-lead:${savedLead.receipt.id}`, () => {
        const queued = trackEvent("generate_lead", { lead_source: savedLead.receipt.source });
        trackGoogleAdsConversion(conversionLabels.contact, { transaction_id: savedLead.receipt.id });
        return queued;
      })) {
        document.cookie = `${savedLead.cookieName}=; Max-Age=0; Path=${savedLead.pathname}; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
      }
    }
    trackSavedLead();
    // A second saved application may redirect to the same URL, without changing route deps.
    const timer = window.setInterval(trackSavedLead, 1000);
    return () => window.clearInterval(timer);
  }, [pathname]);

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

      if (isBusinessCalendlyUrl(href)) {
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
  return (
    <>
      {googleTagId && <Script
        id="google-tag-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
        strategy="afterInteractive"
      />}
      <GoogleAdsEvents />
    </>
  );
}
