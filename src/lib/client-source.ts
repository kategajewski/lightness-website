export const clientSourceLabels = {
  instagram_kate: "Instagram (Kate Gajewski bio)",
  instagram_lightness: "Instagram (The Lightness of Being bio)",
  instagram: "Instagram (account unknown)",
  google_business_profile: "Google Business Profile",
  google_ads: "Google Ads",
  organic_google: "Organic Google",
  referral: "Other website",
  unknown: "Unknown",
} as const;

export type ClientSource = keyof typeof clientSourceLabels;
export const calendlyCampaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const markerPrefix = "lightness_first_visit_";
const firstVisitStorageKey = "lightness-platform:client-source";
const firstVisitLifetimeMs = 30 * 24 * 60 * 60 * 1000;
type SourceStorage = Pick<Storage, "getItem" | "setItem">;
type FirstVisit = { source: ClientSource; expiresAt: number };

function isClientSource(value: unknown): value is ClientSource {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(clientSourceLabels, value);
}

export function clientSourceMarker(source: ClientSource) {
  return `${markerPrefix}${source}`;
}

export function readClientSourceMarker(value: unknown) {
  if (typeof value !== "string" || !value.startsWith(markerPrefix)) return undefined;
  const source = value.slice(markerPrefix.length);
  return isClientSource(source) ? source : undefined;
}

function normalizeTag(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";
}

function trackedSource(tracking: Record<string, unknown>): ClientSource | undefined {
  const source = normalizeTag(tracking.utm_source);
  const medium = normalizeTag(tracking.utm_medium);
  const campaign = normalizeTag(tracking.utm_campaign);
  if (typeof tracking.gclid === "string" && tracking.gclid.trim()) return "google_ads";
  if (source === "google" && medium === "cpc") return "google_ads";

  if (["instagram", "ig", "iamkategajewski", "thelightnessofbeing"].includes(source)) {
    if (source === "iamkategajewski" || campaign === "iamkategajewski") return "instagram_kate";
    if (source === "thelightnessofbeing" || campaign === "thelightnessofbeing") return "instagram_lightness";
    return "instagram";
  }

  const businessProfileTags = ["gbp", "google_business_profile", "google_my_business", "google_maps", "gmb"];
  if (businessProfileTags.includes(source) || (source === "google" && businessProfileTags.includes(campaign))) {
    return "google_business_profile";
  }
  if (source === "google" && medium === "organic") return "organic_google";
  if (medium === "referral") return "referral";
  return undefined;
}

export function classifyCalendlySource(tracking: Record<string, unknown> | null | undefined): ClientSource {
  if (!tracking) return "unknown";
  for (const key of calendlyCampaignKeys) {
    const source = readClientSourceMarker(tracking[key]);
    if (source) return source;
  }
  return trackedSource(tracking) ?? "unknown";
}

function isSameSiteHost(host: string, currentHost: string) {
  const siteHost = /(?:^|\.)bethelightness\.com$/;
  return host === currentHost || (siteHost.test(host) && siteHost.test(currentHost));
}

function classifyReferrer(referrer: string, currentOrigin: string): ClientSource {
  try {
    const url = new URL(referrer);
    const { hostname, pathname, protocol } = url;
    if (protocol !== "https:" && protocol !== "http:") return "unknown";
    if (isSameSiteHost(hostname, new URL(currentOrigin).hostname)) return "unknown";
    if (hostname === "instagram.com" || hostname.endsWith(".instagram.com")) return "instagram";
    const isGoogle = /^(?:(?:www|images|search|maps)\.)?google\.(?:com|[a-z]{2}|(?:co|com)\.[a-z]{2})$/.test(hostname);
    if (hostname === "maps.app.goo.gl" || hostname === "g.page" ||
      (isGoogle && (hostname.startsWith("maps.") || /^\/maps(?:\/|$)/.test(pathname)))) {
      return "google_business_profile";
    }
    return isGoogle ? "organic_google" : "referral";
  } catch {
    return "unknown";
  }
}

export function createFirstVisitAttribution() {
  let firstVisit: FirstVisit | undefined;
  return (searchParams: URLSearchParams, referrer: string, currentOrigin: string, storage?: SourceStorage, now = Date.now()) => {
    if (firstVisit && firstVisit.expiresAt > now) return firstVisit.source;

    try {
      const stored = JSON.parse(storage?.getItem(firstVisitStorageKey) ?? "null");
      if (isClientSource(stored?.source) && Number.isFinite(stored.expiresAt) &&
        stored.expiresAt > now && stored.expiresAt <= now + firstVisitLifetimeMs) {
        firstVisit = { source: stored.source, expiresAt: stored.expiresAt };
        return firstVisit.source;
      }
    } catch { /* Attribution can still be retained in memory. */ }

    const tracking = Object.fromEntries([...calendlyCampaignKeys, "gclid"].map((key) => [key, searchParams.get(key)]));
    const source = trackedSource(tracking) ?? classifyReferrer(referrer, currentOrigin);
    firstVisit = { source, expiresAt: now + firstVisitLifetimeMs };
    try {
      storage?.setItem(firstVisitStorageKey, JSON.stringify(firstVisit));
    } catch { /* Attribution can still be retained in memory. */ }
    return source;
  };
}
