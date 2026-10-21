export type GoogleTagTarget = {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  lightnessGoogleTagInitialized?: boolean;
};

// Queue commands before the external script is ready, using the standard gtag queue.
export function initializeGoogleTag(target: GoogleTagTarget, measurementIds: string[]) {
  if (!target.gtag) {
    target.dataLayer = target.dataLayer || [];
    target.gtag = function () {
      // Match the command queue documented by Google for gtag.js.
      // eslint-disable-next-line prefer-rest-params
      target.dataLayer?.push(arguments);
    };
  }
  if (!target.lightnessGoogleTagInitialized) {
    target.gtag("js", new Date());
    for (const id of measurementIds) target.gtag("config", id, { send_page_view: false });
    target.lightnessGoogleTagInitialized = true;
  }
  return target.gtag;
}

export function createTrackingDeduper() {
  const queued = new Set<string>();
  return (key: string, send: () => boolean, storage?: Pick<Storage, "getItem" | "setItem">) => {
    let alreadyQueued = queued.has(key);
    try { alreadyQueued ||= storage?.getItem(key) === "true"; } catch { /* Storage may be unavailable. */ }
    if (alreadyQueued) return true;
    if (!send()) return false;
    queued.add(key);
    try { storage?.setItem(key, "true"); } catch { /* Keep in-memory dedupe when storage is blocked. */ }
    return true;
  };
}


export function createRoutePageViewTracker() {
  let previousLocation: string | undefined;
  return ({ target, measurementIds, ga4Id, location, title, referrer }: {
    target: GoogleTagTarget;
    measurementIds: string[];
    ga4Id?: string;
    location: string;
    title: string;
    referrer: string;
  }) => {
    if (location === previousLocation) return false;
    const tag = initializeGoogleTag(target, measurementIds);
    const url = new URL(location);
    const page = { page_location: location, page_title: title, page_referrer: previousLocation ?? referrer };
    for (const id of measurementIds) {
      tag("config", id, { ...page, page_path: `${url.pathname}${url.search}`, send_page_view: false });
    }
    // Enhanced Measurement history-based pageviews must also be disabled in GA4.
    if (ga4Id) tag("event", "page_view", { ...page, send_to: ga4Id });
    previousLocation = location;
    return Boolean(ga4Id);
  };
}
