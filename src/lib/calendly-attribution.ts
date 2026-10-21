const campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const clickIdKeys = ["gclid", "gbraid", "wbraid"] as const;
const campaignStorageKey = "lightness-platform:campaign-attribution";
type Campaign = Partial<Record<(typeof campaignKeys)[number], string>>;
type CampaignStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function campaignValues(values: Record<string, unknown>): Campaign {
  const campaign: Campaign = {};
  for (const key of campaignKeys) {
    const value = values[key];
    // Only bounded campaign metadata, never email addresses or control characters.
    if (typeof value === "string" && value.trim() && value.length <= 255 && !/[\p{Cc}@]/u.test(value)) {
      campaign[key] = value;
    }
  }
  return campaign;
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

export function createCalendlyAttribution() {
  let campaign: Campaign = {};
  let initialized = false;
  let hasCampaignContext = false;
  return {
    capture(searchParams: URLSearchParams, storage?: CampaignStorage) {
      const hasNewAttribution = [...campaignKeys, ...clickIdKeys].some((key) => searchParams.has(key));
      if (hasNewAttribution) {
        // Replace the campaign as a unit. A click-ID-only landing clears older UTMs.
        campaign = campaignValues(Object.fromEntries(campaignKeys.map((key) => [key, searchParams.get(key)])));
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
    decorate(href: string) {
      if (!isBusinessCalendlyUrl(href) || !hasCampaignContext) return href;
      const url = new URL(href);
      // Replace only UTMs; keep scheduling options, Google's linker and the fragment.
      for (const key of campaignKeys) url.searchParams.delete(key);
      for (const key of campaignKeys) {
        if (campaign[key]) url.searchParams.set(key, campaign[key]);
      }
      return url.toString();
    },
  };
}
