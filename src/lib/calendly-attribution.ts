import {
  calendlyCampaignKeys as campaignKeys,
  classifyCalendlySource,
  clientSourceMarker,
  readClientSourceMarker,
  type ClientSource,
} from "./client-source";

const clickIdKeys = ["gclid", "gbraid", "wbraid"] as const;
const markerKeys = ["utm_content", "utm_term", "utm_campaign", "utm_medium", "utm_source"] as const;
const campaignStorageKey = "lightness-platform:campaign-attribution";
type Campaign = Partial<Record<(typeof campaignKeys)[number], string>>;
type CampaignStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function campaignValues(values: Record<string, unknown>): Campaign {
  const campaign: Campaign = {};
  for (const key of campaignKeys) {
    const value = values[key];
    // Only bounded campaign metadata, never email addresses or control characters.
    if (typeof value === "string" && value.trim() && value.length <= 255 && !/[\p{Cc}@]/u.test(value) &&
      !readClientSourceMarker(value)) {
      campaign[key] = value;
    }
  }
  return campaign;
}

function readCampaign(searchParams: URLSearchParams): Campaign {
  return campaignValues(Object.fromEntries(campaignKeys.map((key) => [key, searchParams.get(key)])));
}

export function isBusinessCalendlyUrl(href: string) {
  try {
    const url = new URL(href);
    return url.protocol === "https:" && url.host === "calendly.com" && !url.username && !url.password &&
      (url.pathname === "/thelightnessofbeing" || url.pathname.startsWith("/thelightnessofbeing/"));
  } catch {
    return false;
  }
}

export function withoutCalendlySourceMarker(href: string) {
  const url = new URL(href);
  let changed = false;
  for (const key of campaignKeys) {
    const values = url.searchParams.getAll(key);
    const retainedValues = values.filter((value) => !readClientSourceMarker(value));
    if (retainedValues.length === values.length) continue;
    url.searchParams.delete(key);
    for (const value of retainedValues) url.searchParams.append(key, value);
    changed = true;
  }
  return changed ? url.href : href;
}

export function matchesDecoratedCalendlyLink(href: string, decoratedHref: string) {
  if (href === decoratedHref) return true;
  const current = new URL(href);
  const decorated = new URL(decoratedHref);
  current.searchParams.delete("_gl");
  decorated.searchParams.delete("_gl");
  return current.href === decorated.href;
}

export function createCalendlyAttribution() {
  let campaign: Campaign = {};
  let initialized = false;
  let hasCampaignContext = false;
  return {
    capture(searchParams: URLSearchParams, storage?: CampaignStorage) {
      const hasNewAttribution = [...campaignKeys, ...clickIdKeys].some((key) => searchParams.has(key));
      if (hasNewAttribution) {
        // Replace the campaign as a unit. A click-ID-only landing clears older UTMs.
        campaign = readCampaign(searchParams);
        initialized = true;
        hasCampaignContext = true;
        try {
          if (Object.keys(campaign).length) storage?.setItem(campaignStorageKey, JSON.stringify(campaign));
          else storage?.removeItem(campaignStorageKey);
        } catch { /* Retain attribution in memory when browser storage is blocked. */ }
      } else if (!initialized) {
        initialized = true;
        try {
          const stored = JSON.parse(storage?.getItem(campaignStorageKey) ?? "null");
          if (stored && typeof stored === "object" && !Array.isArray(stored)) {
            campaign = campaignValues(stored);
            hasCampaignContext = Boolean(Object.keys(campaign).length);
          }
        } catch { /* Invalid or unavailable storage must not prevent navigation. */ }
      }
    },
    decorate(href: string, firstVisit?: ClientSource, originalHref?: string) {
      if (!isBusinessCalendlyUrl(href) || (!hasCampaignContext && !firstVisit)) return href;
      const url = new URL(href);
      const originalCampaign = originalHref ? readCampaign(new URL(originalHref).searchParams) : {};
      const outbound = { ...campaign, ...originalCampaign };
      // Direct first visits need a marker only if a subsequent site campaign could be mistaken for the source.
      const preserveUnknown = firstVisit === "unknown" && classifyCalendlySource(outbound) !== "unknown" &&
        classifyCalendlySource(originalCampaign) === "unknown";
      if (firstVisit && (firstVisit !== "unknown" || preserveUnknown)) {
        const availableKey = markerKeys.find((key) => !outbound[key]);
        if (availableKey) outbound[availableKey] = clientSourceMarker(firstVisit);
      }
      // Update campaign fields while preserving scheduling options, Google's linker and the fragment.
      let changed = false;
      for (const key of campaignKeys) {
        const value = outbound[key];
        const currentValues = url.searchParams.getAll(key);
        if (value ? currentValues.length === 1 && currentValues[0] === value : currentValues.length === 0) continue;
        if (value) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
        changed = true;
      }
      return changed ? url.href : href;
    },
  };
}
