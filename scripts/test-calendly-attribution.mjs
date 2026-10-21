import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

const source = ts.transpileModule(fs.readFileSync(new URL("../src/lib/calendly-attribution.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = { exports: {}, URL, URLSearchParams };
vm.runInNewContext(source, context);
const { createCalendlyAttribution, isBusinessCalendlyUrl } = context.exports;
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
