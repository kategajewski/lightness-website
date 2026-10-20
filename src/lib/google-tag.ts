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
