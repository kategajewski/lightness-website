import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, URL, URLSearchParams, require: name => dependencies[name] };
  vm.runInNewContext(source, context);
  return context.exports;
}
const clientSource = load("../src/lib/client-source.ts");
const { classifyCalendlySource, createFirstVisitAttribution } = clientSource;
const { createCalendlyAttribution, isBusinessCalendlyUrl, withoutCalendlySourceMarker } =
  load("../src/lib/calendly-attribution.ts", { "./client-source": clientSource });
const booking = "https://calendly.com/thelightnessofbeing/restandreceiveenergy";
function storage(value) {
  let current = value ?? null;
  return { getItem: () => current, setItem: (_key, value) => { current = value; }, removeItem: () => { current = null; }, value: () => current };
}

test("only the five supported campaign fields cross to Calendly; linker and scheduling options survive", () => {
  const tracker = createCalendlyAttribution();
  const saved = storage();
  tracker.capture(new URLSearchParams({ utm_source: "google", utm_medium: "cpc", utm_campaign: "reiki", utm_content: "ad-12", utm_term: "reiki near me", gclid: "actual-click", _gl: "incoming-linker", email: "private@example.invalid", name: "Private Person", token: "private-token", session_id: "private-session" }), saved);
  assert.deepEqual(Object.keys(JSON.parse(saved.value())).sort(), ["utm_campaign", "utm_content", "utm_medium", "utm_source", "utm_term"]);
  const destination = new URL(tracker.decorate(`${booking}?hide_gdpr_banner=1&_gl=1*actual-google-linker#details`));
  assert.equal(destination.searchParams.get("utm_source"), "google");
  assert.equal(destination.searchParams.get("utm_term"), "reiki near me");
  assert.equal(destination.searchParams.get("_gl"), "1*actual-google-linker");
  assert.equal(destination.searchParams.get("hide_gdpr_banner"), "1");
  assert.equal(destination.hash, "#details");
  for (const key of ["gclid", "gbraid", "wbraid", "email", "name", "token", "session_id"]) assert.equal(destination.searchParams.has(key), false);
  assert.ok(!saved.value().includes("private"));
});

test("only exact secure Calendly business URLs can be decorated", () => {
  const tracker = createCalendlyAttribution();
  tracker.capture(new URLSearchParams("utm_source=partner"));
  for (const href of ["http://calendly.com/thelightnessofbeing", "https://calendly.com.evil.invalid/thelightnessofbeing", "https://evil.invalid/?next=https://calendly.com/thelightnessofbeing", "https://user@calendly.com/thelightnessofbeing", "https://calendly.com:8443/thelightnessofbeing", "https://calendly.com/thelightnessofbeing-imposter", "https://calendly.com/another-business", "/calendly.com/thelightnessofbeing", "javascript:alert(1)"]) {
    assert.equal(isBusinessCalendlyUrl(href), false);
    assert.equal(tracker.decorate(href), href);
  }
  for (const href of ["https://calendly.com/thelightnessofbeing", "https://calendly.com/thelightnessofbeing/", booking]) {
    assert.equal(isBusinessCalendlyUrl(href), true);
    assert.equal(new URL(tracker.decorate(href)).searchParams.get("utm_source"), "partner");
  }
});

test("internal navigation and a reloaded tracker retain the same tab campaign, without fabricated defaults", () => {
  const saved = storage();
  const tracker = createCalendlyAttribution();
  tracker.capture(new URLSearchParams("utm_source=newsletter&utm_campaign=october"), saved);
  tracker.capture(new URLSearchParams("view=reiki"), saved);
  assert.equal(new URL(tracker.decorate(booking)).searchParams.get("utm_campaign"), "october");
  const reloaded = createCalendlyAttribution();
  reloaded.capture(new URLSearchParams(), saved);
  assert.equal(new URL(reloaded.decorate(booking)).searchParams.get("utm_source"), "newsletter");
  const organic = createCalendlyAttribution();
  organic.capture(new URLSearchParams("view=reiki"));
  assert.equal(organic.decorate(booking), booking);
});

test("a new campaign replaces previous campaign fields rather than mixing sources", () => {
  const tracker = createCalendlyAttribution();
  const saved = storage();
  tracker.capture(new URLSearchParams("utm_source=newsletter&utm_medium=email&utm_campaign=old"), saved);
  const oldDecoratedLink = tracker.decorate(booking);
  tracker.capture(new URLSearchParams("utm_campaign=new-partner-campaign"), saved);
  const destination = new URL(tracker.decorate(oldDecoratedLink));
  assert.equal(destination.searchParams.get("utm_campaign"), "new-partner-campaign");
  assert.equal(destination.searchParams.has("utm_source"), false);
  assert.equal(destination.searchParams.has("utm_medium"), false);
  assert.deepEqual(Object.keys(JSON.parse(saved.value())), ["utm_campaign"]);
});

test("a new paid click without UTMs clears stale campaign data without storing or forwarding click IDs", () => {
  for (const clickKey of ["gclid", "gbraid", "wbraid"]) {
    const saved = storage();
    const tracker = createCalendlyAttribution();
    tracker.capture(new URLSearchParams("utm_source=old-newsletter&utm_campaign=old"), saved);
    const oldLink = tracker.decorate(`${booking}?_gl=existing-linker`);
    tracker.capture(new URLSearchParams(`${clickKey}=new-real-paid-click`), saved);
    tracker.capture(new URLSearchParams(), saved);
    const destination = new URL(tracker.decorate(oldLink));
    assert.equal(destination.searchParams.has("utm_source"), false);
    assert.equal(destination.searchParams.has("utm_campaign"), false);
    assert.equal(destination.searchParams.has(clickKey), false);
    assert.equal(destination.searchParams.get("_gl"), "existing-linker");
    assert.equal(saved.value(), null);
  }
});

test("campaign validation rejects oversized, email-like and control-character values", () => {
  const tracker = createCalendlyAttribution();
  const saved = storage();
  tracker.capture(new URLSearchParams({ utm_source: "s".repeat(255), utm_medium: "m".repeat(256), utm_campaign: "private@example.invalid", utm_content: "line\nbreak", utm_term: "   " }), saved);
  const destination = new URL(tracker.decorate(booking));
  assert.equal(destination.searchParams.get("utm_source").length, 255);
  for (const key of ["utm_medium", "utm_campaign", "utm_content", "utm_term"]) assert.equal(destination.searchParams.has(key), false);
  assert.deepEqual(Object.keys(JSON.parse(saved.value())), ["utm_source"]);
});

test("blocked or malformed storage cannot break navigation or restore a cleared stale campaign", () => {
  const tracker = createCalendlyAttribution();
  const unavailable = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  tracker.capture(new URLSearchParams("utm_source=partner"), unavailable);
  tracker.capture(new URLSearchParams(), unavailable);
  assert.equal(new URL(tracker.decorate(booking)).searchParams.get("utm_source"), "partner");
  tracker.capture(new URLSearchParams("gclid=real-click"), unavailable);
  tracker.capture(new URLSearchParams(), unavailable);
  assert.equal(new URL(tracker.decorate(booking)).searchParams.has("utm_source"), false);
  const malformed = createCalendlyAttribution();
  malformed.capture(new URLSearchParams(), storage("not json"));
  assert.equal(malformed.decorate(booking), booking);
  const unsafeStored = createCalendlyAttribution();
  unsafeStored.capture(new URLSearchParams(), storage(JSON.stringify({ utm_source: "valid", email: "private@example.invalid", utm_term: "private@example.invalid" })));
  const destination = new URL(unsafeStored.decorate(booking));
  assert.equal(destination.searchParams.get("utm_source"), "valid");
  assert.equal(destination.searchParams.has("utm_term"), false);
  assert.equal(destination.searchParams.has("email"), false);
});

test("first visit source distinguishes tagged bios, GBP, ads, organic search and referrals", () => {
  for (const [query, referrer, expected] of [
    ["utm_source=instagram&utm_medium=bio&utm_campaign=iamkategajewski", "", "instagram_kate"],
    ["utm_source=instagram&utm_medium=bio&utm_campaign=thelightnessofbeing", "", "instagram_lightness"],
    ["", "https://l.instagram.com/", "instagram"],
    ["utm_source=google&utm_medium=organic&utm_campaign=gbp", "https://www.google.com/", "google_business_profile"],
    ["", "https://maps.app.goo.gl/private-token", "google_business_profile"],
    ["gclid=paid-click", "https://www.google.com/", "google_ads"],
    ["utm_source=google&utm_medium=cpc", "", "google_ads"],
    ["", "https://www.google.co.uk/", "organic_google"],
    ["", "https://docs.google.com/document/", "referral"],
    ["", "https://google.com.example.invalid/?private=1", "referral"],
    ["utm_source=partner&utm_medium=referral", "", "referral"],
    ["", "https://www.bethelightness.com/services", "unknown"],
    ["utm_content=lightness_first_visit_google_ads", "", "unknown"],
    ["", "", "unknown"],
  ]) {
    const firstVisit = createFirstVisitAttribution();
    const saved = storage();
    assert.equal(firstVisit(new URLSearchParams(query), referrer, "https://bethelightness.com", saved, 1000), expected);
    assert.deepEqual(JSON.parse(saved.value()), { source: expected, expiresAt: 1000 + 30 * 24 * 60 * 60 * 1000 });
  }
});

test("first visit survives reloads and campaign changes for 30 days from capture", () => {
  const origin = "https://bethelightness.com";
  const saved = storage();
  const started = 1000;
  const expires = started + 30 * 24 * 60 * 60 * 1000;
  const capture = createFirstVisitAttribution();
  const laterCampaign = new URLSearchParams("gclid=paid-click");
  assert.equal(capture(new URLSearchParams(), "", origin, saved, started), "unknown");
  assert.equal(capture(laterCampaign, "", origin, saved, expires - 1), "unknown");
  const reloaded = createFirstVisitAttribution();
  assert.equal(reloaded(laterCampaign, "", origin, saved, expires - 1), "unknown");
  assert.equal(reloaded(laterCampaign, "", origin, saved, expires), "google_ads");
});

test("booking URLs preserve explicit UTMs and strip only the first-visit marker from custom analytics", () => {
  const tracker = createCalendlyAttribution();
  tracker.capture(new URLSearchParams("utm_source=google&utm_medium=cpc&utm_content=paid-ad&gclid=paid-click"));
  const original = `${booking}?utm_campaign=custom&_gl=1*linker#details`;
  const decorated = tracker.decorate(original, "instagram_kate", original);
  const destination = new URL(decorated);
  assert.equal(destination.searchParams.get("utm_campaign"), "custom");
  assert.equal(destination.searchParams.get("utm_content"), "paid-ad");
  assert.equal(destination.searchParams.get("utm_term"), "lightness_first_visit_instagram_kate");
  assert.equal(destination.searchParams.has("gclid"), false);
  assert.equal(classifyCalendlySource(Object.fromEntries(destination.searchParams)), "instagram_kate");
  const clickEventUrl = new URL(withoutCalendlySourceMarker(decorated));
  assert.equal(clickEventUrl.searchParams.get("utm_content"), "paid-ad");
  assert.equal(clickEventUrl.searchParams.get("utm_source"), "google");
  assert.equal(clickEventUrl.searchParams.get("_gl"), "1*linker");
  assert.equal(clickEventUrl.searchParams.has("utm_term"), false);
  assert.equal(clickEventUrl.hash, "#details");
});

test("a full campaign keeps all five explicit fields; original link evidence works for direct visits", () => {
  const tracker = createCalendlyAttribution();
  const campaign = "utm_source=google&utm_medium=cpc&utm_content=ad&utm_campaign=spring&utm_term=reiki";
  tracker.capture(new URLSearchParams(campaign));
  const decorated = tracker.decorate(booking, "organic_google");
  assert.deepEqual(Object.fromEntries(new URL(decorated).searchParams), Object.fromEntries(new URLSearchParams(campaign)));
  assert.equal(classifyCalendlySource(Object.fromEntries(new URL(decorated).searchParams)), "google_ads");
  const direct = createCalendlyAttribution();
  direct.capture(new URLSearchParams());
  const tagged = `${booking}?utm_source=google&utm_medium=organic&utm_campaign=gbp`;
  assert.equal(direct.decorate(tagged, "unknown", tagged), tagged);
  assert.equal(classifyCalendlySource(Object.fromEntries(new URL(tagged).searchParams)), "google_business_profile");
  assert.equal(direct.decorate(booking, "unknown", booking), booking);
  direct.capture(new URLSearchParams("utm_source=google&utm_medium=cpc"));
  const later = new URL(direct.decorate(booking, "unknown", booking));
  assert.equal(classifyCalendlySource(Object.fromEntries(later.searchParams)), "unknown");
  assert.equal(later.searchParams.get("utm_medium"), "cpc");
});
