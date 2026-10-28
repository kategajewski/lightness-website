import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import { test } from "node:test";
import ts from "typescript";
import cookieTools from "next/dist/compiled/@edge-runtime/cookies/index.js";

function load(file, dependencies = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const context = { exports: {}, Date, URL, URLSearchParams, console: { error() {} }, ...globals, require(name) {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(source, context);
  return context.exports;
}
const receipts = load("../src/lib/mentorship-lead-receipts.ts");
const google = load("../src/lib/google-tag.ts");
const calendly = load("../src/lib/calendly-attribution.ts");
const id = "12345678-1234-4234-8234-123456789012";
const nextId = "87654321-4321-4321-8321-210987654321";
function receiptCookie(source = "mentorship_application", overrides = {}) {
  const form = receipts.mentorshipLeadForms.find(item => item.source === source);
  return `${form.cookieName}=${encodeURIComponent(JSON.stringify({ id, source, issuedAt: Date.now(), ...overrides }))}`;
}

for (const [file, action, source, path, required] of [
  ["../src/app/mentorship/actions.ts", "submitMentorshipApplication", "mentorship_application", "/mentorship-application", ["name", "email", "interest", "intentions"]],
  ["../src/app/reiki-mentorship/actions.ts", "submitHealersEmergenceInquiry", "healers_emergence_inquiry", "/reiki-mentorship/inquire", ["name", "email", "containerInterest", "reikiExperience", "supportAreas", "supportDetails", "businessStage", "desiredFeeling", "startTiming"]],
]) {
  function fixture(options = {}) {
    const calls = [];
    const cookies = [];
    const server = load("../src/lib/mentorship-lead-receipts-server.ts", {
      "server-only": {}, "node:crypto": crypto,
      "next/headers": { cookies: async () => ({ set: (...args) => { calls.push("receipt"); cookies.push(args); } }) },
      "@/lib/mentorship-lead-receipts": receipts,
    }, { process: { env: { NODE_ENV: "production" } } });
    const actions = load(file, {
      "next/navigation": { redirect: url => { throw Object.assign(new Error("redirect"), { url }); } },
      "@/lib/env": { integrations: { supabase: options.configured !== false, emailForwarding: Boolean(options.emailError) } },
      "@/lib/form-security": {
        getFormValue: (data, key) => String(data.get(key) ?? "").trim(),
        isLikelyAutomatedSubmission: () => Boolean(options.bot),
        hasValidTurnstileToken: async () => options.turnstile !== false,
      },
      "@/lib/supabase/admin": { createSupabaseAdminClient: () => ({ from: table => {
        assert.equal(table, "contact_inquiries");
        return { insert: async () => { calls.push("save"); return { error: options.storageError ? new Error("not saved") : null }; } };
      } }) },
      "@/lib/email": { sendInquiryForwardEmail: async () => { calls.push("mock_email"); throw new Error("mock delivery failure"); } },
      "@/lib/mentorship-lead-receipts-server": server,
    });
    const form = new FormData();
    for (const field of required) form.set(field, field === "email" ? "test@example.invalid" : "test-only");
    if (options.missing) form.delete(required[0]);
    return { calls, cookies, run: () => actions[action](form) };
  }
  test(`${source}: only persisted applications receive a scoped non-PII lead receipt`, async () => {
    for (const options of [{ bot: true }, { turnstile: false }, { missing: true }, { configured: false }, { storageError: true }]) {
      const f = fixture(options);
      await assert.rejects(f.run, error => error.url.startsWith(path));
      assert.equal(f.cookies.length, 0);
      assert.ok(!f.calls.includes("mock_email"));
      assert.deepEqual(f.calls, options.storageError ? ["save"] : []);
    }
    for (const emailError of [false, true]) {
      const f = fixture({ emailError });
      await assert.rejects(f.run, error => error.url.startsWith(`${path}?status=${emailError ? "error" : "success"}`));
      assert.deepEqual(f.calls, emailError ? ["save", "receipt", "mock_email"] : ["save", "receipt"]);
      const [name, value, settings] = f.cookies[0];
      const headers = new Headers();
      new cookieTools.ResponseCookies(headers).set(name, value, settings);
      const wireCookie = headers.get("set-cookie").split(";")[0];
      const parsed = receipts.readMentorshipLeadReceipt(wireCookie, path);
      assert.ok(parsed);
      assert.equal(parsed.receipt.source, source);
      assert.deepEqual(Object.keys(parsed.receipt).sort(), ["id", "issuedAt", "source"]);
      assert.equal(settings.path, path);
      assert.equal(settings.secure, true);
      assert.equal(settings.sameSite, "lax");
      assert.equal(settings.maxAge, 600);
      assert.ok(!value.includes("test"));
    }
  });
}

test("receipt validation rejects malformed, expired, future and wrong-form signals", () => {
  const path = "/mentorship-application";
  for (const cookie of ["", "lightness_mentorship_lead=%broken", receiptCookie("mentorship_application", { id: "not-a-uuid" }), receiptCookie("mentorship_application", { source: "contact_form" }), receiptCookie("mentorship_application", { issuedAt: Date.now() - 601_000 }), receiptCookie("mentorship_application", { issuedAt: Date.now() + 61_000 }), receiptCookie("mentorship_application", { issuedAt: "today" })]) {
    assert.equal(receipts.readMentorshipLeadReceipt(cookie, path), null);
  }
  assert.equal(receipts.readMentorshipLeadReceipt(receiptCookie(), "/reiki-mentorship/inquire"), null);
  assert.equal(receipts.readMentorshipLeadReceipt(receiptCookie(), "/contact"), null);
});

function browser(path, cookie = "", { blockedStorage = false, keepCookie = false, configured = true, ga4Id, links = [], referrer = "https://referrer.invalid" } = {}) {
  let cookieValue = cookie;
  const cookieWrites = [];
  const effects = [];
  const timers = new Map();
  const listeners = new Map();
  const stored = new Map();
  const observers = new Set();
  const scriptLoads = [];
  const documentNavigations = [];
  const window = {
    location: { protocol: "https:", origin: "https://example.invalid", assign: href => documentNavigations.push(href) },
    setInterval: fn => { const key = timers.size + 1; timers.set(key, fn); return key; },
    clearInterval: key => timers.delete(key),
  };
  Object.defineProperty(window, "sessionStorage", { get: () => {
    if (blockedStorage) throw new Error("storage blocked");
    return { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) };
  } });
  const document = {
    title: "Test page", referrer, body: {}, querySelectorAll: () => anchors,
    addEventListener: (name, fn, capture = false) => listeners.set(`${name}:${capture}`, fn),
    removeEventListener: (name, _fn, capture = false) => listeners.delete(`${name}:${capture}`),
  };
  Object.defineProperty(document, "cookie", { get: () => cookieValue, set: value => {
    cookieWrites.push(value);
    if (!keepCookie) cookieValue = "";
  } });
  class Element {
    constructor(href) { this.href = href; }
    closest() { return this; }
    getAttribute() { return this.href; }
    setAttribute(name, value) { assert.equal(name, "href"); this.href = value; }
    hasAttribute() { return false; }
  }
  const anchors = links.map(href => new Element(href));
  const url = new URL(path, "https://example.invalid");
  Object.defineProperties(window.location, { pathname: { get: () => url.pathname }, href: { get: () => url.href } });
  const jsx = (type, props) => ({ type, props });
  const component = load("../src/components/google-ads-sync.tsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "next/script": props => { scriptLoads.push(props.src); return null; },
    "next/navigation": { usePathname: () => url.pathname, useSearchParams: () => url.searchParams },
    react: { useEffect: fn => effects.push(fn) },
    "@/lib/google-tag": google,
    "@/lib/calendly-attribution": calendly,
    "@/lib/mentorship-lead-receipts": receipts,
  }, { window, document, Element, MutationObserver: class { constructor(fn) { this.fn = fn; } observe() { observers.add(this.fn); } disconnect() { observers.delete(this.fn); } }, process: { env: configured ? { NEXT_PUBLIC_GA_MEASUREMENT_ID: ga4Id, NEXT_PUBLIC_GOOGLE_ADS_ID: "AW-test", NEXT_PUBLIC_GOOGLE_ADS_CONTACT_CONVERSION_LABEL: "contact-label", NEXT_PUBLIC_GOOGLE_ADS_CALENDLY_CONVERSION_LABEL: "click-label" } : {} } });
  function render(node) {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(render);
    if (typeof node.type === "function") render(node.type(node.props));
    else render(node.props?.children);
  }
  render(component.GoogleAdsSync());
  let cleanups = effects.map(fn => fn()).filter(Boolean);
  const events = () => (window.dataLayer ?? []).map(item => Array.from(item)).filter(item => item[0] === "event");
  return { window, cookieWrites, events, anchors, scriptLoads, documentNavigations, stored,
    addLink: href => { anchors.push(new Element(href)); for (const fn of observers) fn(); },
    navigate: path => {
      cleanups.forEach(fn => fn());
      url.href = new URL(path, url).href;
      effects.length = 0;
      render(component.GoogleAdsSync());
      cleanups = effects.map(fn => fn()).filter(Boolean);
    },
    setCookie: value => { cookieValue = value; }, tick: () => { for (const fn of timers.values()) fn(); },
    click: (href, options = {}) => {
      let stopped = false;
      const event = { target: new Element(href), button: 0, defaultPrevented: false, ...options,
        preventDefault() { this.defaultPrevented = true; }, stopImmediatePropagation() { stopped = true; } };
      listeners.get("click:true")?.(event);
      if (!stopped) listeners.get("click:false")?.(event);
      return event;
    }, cleanup: () => cleanups.forEach(fn => fn()) };
}

for (const form of receipts.mentorshipLeadForms) {
  test(`${form.source}: a saved lead queues once before gtag.js loads, including email-error redirects`, () => {
    const b = browser(`${form.pathname}?status=error`, receiptCookie(form.source));
    assert.equal(typeof b.window.gtag, "function");
    assert.equal(b.events().length, 2);
    assert.equal(b.events()[0][1], "generate_lead");
    assert.equal(b.events()[0][2].lead_source, form.source);
    assert.equal(b.events()[1][1], "conversion");
    assert.equal(b.events()[1][2].send_to, "AW-test/contact-label");
    assert.equal(b.events()[1][2].transaction_id, id);
    assert.match(b.cookieWrites[0], /Max-Age=0/);
    b.setCookie(receiptCookie(form.source));
    b.tick();
    assert.equal(b.events().length, 2);
    b.setCookie(receiptCookie(form.source, { id: nextId }));
    b.tick();
    assert.equal(b.events().length, 4, "a separately saved application at the same URL must count");
    b.cleanup();
  });
  test(`${form.source}: success URLs alone produce no lead`, () => {
    const b = browser(`${form.pathname}?status=success`);
    assert.equal(b.events().length, 0);
    b.tick();
    assert.equal(b.events().length, 0);
    b.cleanup();
  });
}

test("blocked storage and cookie removal do not break queueing or duplicate the saved lead", () => {
  const b = browser("/mentorship-application?status=success", receiptCookie(), { blockedStorage: true, keepCookie: true });
  assert.equal(b.events().length, 2);
  b.tick(); b.tick();
  assert.equal(b.events().length, 2);
  b.cleanup();
});

test("an unconfigured tag leaves the receipt available and a failed send never reserves its dedupe key", () => {
  const b = browser("/mentorship-application?status=success", receiptCookie(), { configured: false });
  assert.equal(b.events().length, 0);
  assert.equal(b.cookieWrites.length, 0);
  const once = google.createTrackingDeduper();
  assert.equal(once("lead", () => false), false);
  let calls = 0;
  assert.equal(once("lead", () => { calls++; return true; }), true);
  assert.equal(once("lead", () => { calls++; return true; }), true);
  assert.equal(calls, 1);
});

test("Calendly clicks remain click events and never emit application or completed-booking events", () => {
  const b = browser("/services");
  b.click("https://calendly.com/thelightnessofbeing/restandreceiveenergy");
  assert.equal(b.events().length, 2);
  assert.equal(b.events()[0][1], "book_appointment_click");
  assert.equal(b.events()[1][2].send_to, "AW-test/click-label");
  assert.ok(b.events().every(item => !["generate_lead", "book_appointment", "appointment_scheduled", "purchase"].includes(item[1])));
  b.cleanup();
});


test("real component decorates initial and later Calendly anchors across Next navigation without changing linker values", () => {
  const href = "https://calendly.com/thelightnessofbeing/restandreceiveenergy?hide_event_type_details=1&_gl=1*real-linker#details";
  const b = browser("/reiki-healing-long-island?utm_source=newsletter&utm_campaign=autumn&email=private@example.invalid&gclid=real-click", "", { links: [href] });
  let link = new URL(b.anchors[0].href);
  assert.equal(link.searchParams.get("utm_source"), "newsletter");
  assert.equal(link.searchParams.get("_gl"), "1*real-linker");
  assert.equal(link.searchParams.get("hide_event_type_details"), "1");
  assert.equal(link.hash, "#details");
  assert.equal(link.searchParams.has("email"), false);
  assert.equal(link.searchParams.has("gclid"), false);
  b.navigate("/services");
  b.addLink("https://calendly.com/thelightnessofbeing/sacredreset");
  assert.equal(new URL(b.anchors[1].href).searchParams.get("utm_campaign"), "autumn");
  b.navigate("/services?gclid=new-paid-click");
  link = new URL(b.anchors[0].href);
  assert.equal(link.searchParams.has("utm_source"), false);
  assert.equal(link.searchParams.get("_gl"), "1*real-linker");
  b.cleanup();
});

test("real component queues one GA4-only pageview per initial, query and Next route transition", () => {
  const b = browser("/services", "", { ga4Id: "G-TEST123456" });
  const views = () => b.events().filter(item => item[1] === "page_view");
  assert.equal(views().length, 1);
  assert.equal(views()[0][2].page_location, "https://example.invalid/services");
  assert.equal(views()[0][2].page_referrer, "https://referrer.invalid");
  b.navigate("/services");
  assert.equal(views().length, 1, "duplicate effect/render must not double-count the route");
  b.navigate("/services?view=reiki");
  b.navigate("/contact");
  b.navigate("/services");
  assert.equal(views().length, 4, "returning to a previously visited route is a new view");
  assert.equal(views()[1][2].page_referrer, "https://example.invalid/services");
  assert.equal(views()[3][2].page_referrer, "https://example.invalid/contact");
  assert.ok(views().every(item => item[2].send_to === "G-TEST123456"));
  assert.ok(b.events().every(item => item[1] === "page_view"));
  const configs = b.window.dataLayer.map(item => Array.from(item)).filter(item => item[0] === "config");
  assert.ok(configs.every(item => item[2].send_page_view === false));
  b.cleanup();
});

test("campaign handoff works with blocked storage and without a Google tag", () => {
  const b = browser("/services?utm_source=partner&utm_medium=referral", "", { blockedStorage: true, configured: false, links: ["https://calendly.com/thelightnessofbeing/restandreceiveenergy"] });
  b.navigate("/contact");
  b.addLink("https://calendly.com/thelightnessofbeing");
  assert.equal(new URL(b.anchors[1].href).searchParams.get("utm_source"), "partner");
  assert.equal(b.events().length, 0);
  b.cleanup();
});


test("private intake routes and descendants load no Google script, queue no events and capture no attribution", () => {
  for (const path of ["/client-intake", "/client-intake/complete", "/client-intakes", "/client-intakes/123", "/api/client-intake", "/api/client-intakes/123"]) {
    const b = browser(`${path}?token=private-token&utm_source=private`, "", { ga4Id: "G-TEST123456", links: ["https://calendly.com/thelightnessofbeing"] });
    assert.equal(b.scriptLoads.length, 0);
    assert.equal(b.window.dataLayer, undefined);
    assert.equal(b.stored.size, 0);
    assert.equal(new URL(b.anchors[0].href).searchParams.has("utm_source"), false);
    b.click("https://calendly.com/thelightnessofbeing");
    b.click("mailto:test@example.invalid");
    b.tick();
    assert.equal(b.events().length, 0);
    b.cleanup();
  }
});

test("entering an intake from a tracked page uses a fresh document before Next can change the private URL", () => {
  const b = browser("/account", "", { ga4Id: "G-TEST123456" });
  const before = b.events().length;
  const click = b.click("/client-intakes?token=private-token");
  assert.equal(click.defaultPrevented, true);
  assert.deepEqual(b.documentNavigations, ["https://example.invalid/client-intakes?token=private-token"]);
  assert.equal(b.window.location.pathname, "/account");
  assert.equal(b.events().length, before);
  b.navigate("/client-intakes");
  b.click("https://calendly.com/thelightnessofbeing");
  b.click("mailto:test@example.invalid");
  b.addLink("https://calendly.com/thelightnessofbeing/sacredreset");
  b.tick();
  assert.equal(b.events().length, before, "tracking handlers must be removed for private route renders");
  b.cleanup();
});

test("intake route matching honors path boundaries and preserves ordinary or modified navigation", () => {
  const b = browser("/services", "", { ga4Id: "G-TEST123456" });
  for (const href of ["/client-intake-information", "/client-intakes-guide", "https://another.invalid/client-intake"]) {
    assert.equal(b.click(href).defaultPrevented, false);
  }
  assert.equal(b.click("/client-intake", { metaKey: true }).defaultPrevented, false);
  assert.equal(b.documentNavigations.length, 0);
  b.cleanup();
});

test("a private intake URL is omitted from the referrer of a later public pageview", () => {
  const b = browser("/services", "", { ga4Id: "G-TEST123456", referrer: "https://example.invalid/client-intake?token=private-token" });
  const view = b.events().find(item => item[1] === "page_view");
  assert.equal(view[2].page_referrer, "");
  assert.ok(!JSON.stringify(b.window.dataLayer).includes("private-token"));
  b.cleanup();
});
