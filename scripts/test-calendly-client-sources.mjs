import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(name, imports = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = {
    exports: {},
    URL,
    URLSearchParams,
    AbortSignal,
    require(moduleName) {
      assert.ok(Object.hasOwn(imports, moduleName));
      return imports[moduleName];
    },
    ...globals,
  };
  vm.runInNewContext(source, context);
  return context.exports;
}

const clientSource = load("client-source");
const calendlyAttribution = load("calendly-attribution", { "./client-source": clientSource });
const api = "https://api.calendly.com";
const eventType = (slug, schedulingSlug = slug) => ({
  uri: `${api}/event_types/${slug}`,
  slug,
  scheduling_url: `https://calendly.com/thelightnessofbeing/${schedulingSlug}`,
});
const event = (id, slug, time, status = "active") => ({
  uri: `${api}/scheduled_events/${id}`,
  event_type: `${api}/event_types/${slug}`,
  start_time: time,
  status,
});
const invitee = (id, email, tracking, status = "active") => ({
  uri: `${api}/scheduled_events/mock/invitees/${id}`,
  status,
  email,
  name: "Example Client",
  tracking,
  questions_and_answers: [{ question: "Private question", answer: "Private answer" }],
});
const response = (body, status = 200) => new Response(JSON.stringify(body), { status });
const collection = (items, next = null) => response({ collection: items, pagination: { next_page_token: next } });

function fixture(handle, token = "fixture-token") {
  const requests = [];
  const lib = load("calendly-client-sources", {
    "server-only": {},
    "@/lib/client-source": clientSource,
    "@/lib/calendly-attribution": calendlyAttribution,
  }, {
    process: { env: { CALENDLY_CLIENT_SOURCES_TOKEN: token } },
    async fetch(url, options) {
      assert.equal(url.origin, api);
      assert.equal(options.method ?? "GET", "GET");
      assert.equal(options.headers.Authorization, `Bearer ${token}`);
      assert.equal(options.cache, "no-store");
      assert.equal(options.redirect, "error");
      assert.equal(url.searchParams.has("invitee_email"), false);
      assert.equal(url.searchParams.has("email"), false);
      requests.push(url);
      if (url.pathname === "/users/me") return response({ resource: { uri: `${api}/users/owner` } });
      return handle(url);
    },
  });
  return {
    requests,
    services: lib.clientSourceServices,
    async report(month) {
      return JSON.parse(JSON.stringify(await lib.getCalendlyClientSources(month)));
    },
  };
}

test("Eastern appointment boundaries, pagination and verified services produce aggregate-only counts", async () => {
  const returning = "return@example.invalid";
  const early = event("early", "restandreceiveenergy", "2026-11-01T04:00:00.000Z");
  const late = event("late", "sacredreset", "2026-12-01T04:59:59.999Z");
  const other = event("other", "mentorship", "2026-11-13T11:30:00Z");
  const anonymous = event("anonymous", "innerjourney", "2026-11-14T11:30:00Z");
  const earlier = event("earlier", "private-sound-healing", "2026-11-01T03:59:59.999Z");
  const paid = { utm_source: "google", utm_medium: "cpc" };
  const { requests, services, report } = fixture((url) => {
    const token = url.searchParams.get("page_token");
    if (url.pathname === "/event_types") {
      const types = services.map(({ slug }) => eventType(slug));
      return token ? collection(types.slice(3)) : collection(types.slice(0, 3), "event-types-next");
    }
    if (url.pathname === "/scheduled_events") {
      assert.equal(url.searchParams.get("status"), "active");
      if (!url.searchParams.has("min_start_time")) {
        assert.equal(url.searchParams.get("max_start_time"), "2026-11-01T04:00:00.000Z");
        return collection([earlier]);
      }
      assert.equal(url.searchParams.get("min_start_time"), "2026-11-01T03:59:59.999Z");
      assert.equal(url.searchParams.get("max_start_time"), "2026-12-01T05:00:00.000Z");
      return token ? collection([early, late, other, anonymous]) : collection([
        early,
        earlier,
        event("past-end", "mentorship", "2026-12-01T05:00:00.000Z"),
        event("canceled", "childrensreiki", "2026-11-13T11:30:00Z", "canceled"),
        event("unrelated", "unrelated-reiki", "2026-11-13T11:30:00Z"),
      ], "events-next");
    }
    assert.equal(url.searchParams.get("status"), "active");
    if (url.pathname === "/scheduled_events/early/invitees") {
      const active = invitee("1", "Return@Example.invalid ", paid);
      return token ? collection([active, invitee("2", "canceled@example.invalid", paid, "canceled")]) : collection([active], "invitees-next");
    }
    if (url.pathname === "/scheduled_events/late/invitees") return collection([invitee("3", returning, paid)]);
    if (url.pathname === "/scheduled_events/other/invitees") return collection([invitee("4", "new@example.invalid", { utm_medium: "referral" })]);
    if (url.pathname === "/scheduled_events/anonymous/invitees") return collection([invitee("5", null, null)]);
    if (url.pathname === "/scheduled_events/earlier/invitees") return collection([invitee("6", returning, null)]);
    assert.fail(`Unexpected request ${url.pathname}`);
  });
  const result = await report("2026-11");
  assert.equal(result.status, "ready");
  assert.equal(result.services.length, 6);
  assert.deepEqual(result.rows, [
    { source: "google_ads", service: "restandreceiveenergy", count: 1, firstRecorded: 0, returning: 1 },
    { source: "google_ads", service: "sacredreset", count: 1, firstRecorded: 0, returning: 1 },
    { source: "referral", service: "mentorship", count: 1, firstRecorded: 1, returning: 0 },
    { source: "unknown", service: "innerjourney", count: 1, firstRecorded: 0, returning: 0 },
  ]);
  assert.equal(requests.filter(({ pathname }) => pathname === "/scheduled_events/early/invitees").length, 2);
  assert.doesNotMatch(JSON.stringify(result), /example\.invalid|Example Client|Private answer|fixture-token/);
});

test("a partial history preserves source counts and known returning appointments", async () => {
  const first = event("first", "restandreceiveenergy", "2026-03-10T12:00:00Z");
  const second = event("second", "restandreceiveenergy", "2026-03-11T12:00:00Z");
  const confirmed = event("confirmed", "childrensreiki", "2026-03-12T12:00:00Z");
  const old = event("old", "mentorship", "2026-02-26T12:00:00Z");
  const interrupted = event("interrupted", "mentorship", "2026-02-23T12:00:00Z");
  const { services, report } = fixture((url) => {
    if (url.pathname === "/event_types") return collection(services.map(({ slug }) => eventType(slug)));
    if (url.pathname === "/scheduled_events") {
      if (!url.searchParams.has("min_start_time")) return collection([old, interrupted]);
      assert.equal(url.searchParams.get("min_start_time"), "2026-03-01T04:59:59.999Z");
      assert.equal(url.searchParams.get("max_start_time"), "2026-04-01T04:00:00.000Z");
      return collection([first, second, confirmed]);
    }
    if (url.pathname === "/scheduled_events/interrupted/invitees") return response({}, 429);
    const hasKnownHistory = ["/scheduled_events/confirmed/invitees", "/scheduled_events/old/invitees"].includes(url.pathname);
    return collection([invitee("1", hasKnownHistory ? "known@example.invalid" : "maybe@example.invalid", null)]);
  });
  const result = await report("2026-03");
  assert.equal(result.status, "ready");
  assert.deepEqual(result.rows, [
    { source: "unknown", service: "restandreceiveenergy", count: 2, firstRecorded: 0, returning: 1 },
    { source: "unknown", service: "childrensreiki", count: 1, firstRecorded: 0, returning: 1 },
  ]);
});

test("missing setup and unverified service mappings do not produce zero-booking reports", async () => {
  const missing = fixture(() => assert.fail("A token is required"), "");
  assert.deepEqual(await missing.report("2026-11"), { status: "unconfigured" });
  assert.equal(missing.requests.length, 0);

  const unverified = fixture((url) => {
    assert.equal(url.pathname, "/event_types");
    return collection(unverified.services.map(({ slug }) => eventType(slug, slug === "mentorship" ? "different-appointment" : slug)));
  });
  assert.deepEqual(await unverified.report("2026-11"), { status: "unavailable" });
  assert.equal(unverified.requests.length, 2);
  assert.deepEqual(await unverified.report("2026-13"), { status: "unavailable" });
  assert.equal(unverified.requests.length, 2);
});
