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

function browser(path, cookie = "", { blockedStorage = false, keepCookie = false, configured = true } = {}) {
  let cookieValue = cookie;
  const cookieWrites = [];
  const effects = [];
  const timers = new Map();
  const listeners = new Map();
  const stored = new Map();
  const window = {
    location: { protocol: "https:" },
    setInterval: fn => { const key = timers.size + 1; timers.set(key, fn); return key; },
    clearInterval: key => timers.delete(key),
  };
  Object.defineProperty(window, "sessionStorage", { get: () => {
    if (blockedStorage) throw new Error("storage blocked");
    return { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) };
  } });
  const document = {
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
  };
  Object.defineProperty(document, "cookie", { get: () => cookieValue, set: value => {
    cookieWrites.push(value);
    if (!keepCookie) cookieValue = "";
  } });
  class Element {
    constructor(href) { this.href = href; }
    closest() { return this; }
    getAttribute() { return this.href; }
  }
  const url = new URL(path, "https://example.invalid");
  const jsx = (type, props) => ({ type, props });
  const component = load("../src/components/google-ads-sync.tsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "next/script": () => null,
    "next/navigation": { usePathname: () => url.pathname, useSearchParams: () => url.searchParams },
    react: { useEffect: fn => effects.push(fn) },
    "@/lib/google-tag": google,
    "@/lib/mentorship-lead-receipts": receipts,
  }, { window, document, Element, process: { env: configured ? { NEXT_PUBLIC_GOOGLE_ADS_ID: "AW-test", NEXT_PUBLIC_GOOGLE_ADS_CONTACT_CONVERSION_LABEL: "contact-label", NEXT_PUBLIC_GOOGLE_ADS_CALENDLY_CONVERSION_LABEL: "click-label" } : {} } });
  function render(node) {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(render);
    if (typeof node.type === "function") render(node.type(node.props));
    else render(node.props?.children);
  }
  render(component.GoogleAdsSync());
  const cleanups = effects.map(fn => fn()).filter(Boolean);
  const events = () => (window.dataLayer ?? []).map(item => Array.from(item)).filter(item => item[0] === "event");
  return { window, cookieWrites, events, setCookie: value => { cookieValue = value; }, tick: () => { for (const fn of timers.values()) fn(); }, click: href => listeners.get("click")?.({ target: new Element(href) }), cleanup: () => cleanups.forEach(fn => fn()) };
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
