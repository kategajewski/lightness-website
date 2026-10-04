import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import { test } from "node:test";
import ts from "typescript";

function load(file, dependencies, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, URL, Response, Date, ...globals, require(name) {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(source, context);
  return context.exports;
}

const testEnv = { BUNNY_STREAM_EMBED_TOKEN_KEY: "test-only-signing-key" };
const videos = load("../src/lib/reiki-rising-videos.ts", { "server-only": {}, "node:crypto": crypto }, { process: { env: testEnv } });
const member = load("../src/lib/member-access.ts", {
  react: { cache: (fn) => fn },
  "@/lib/site": { isAdminEmail: (email) => email === "admin@example.com" },
  "@/lib/supabase/server": {},
});
const modules = videos.reikiRisingModules;

test("all ten releases are Sunday midnight New York, including DST", () => {
  assert.equal(modules.length, 10);
  for (const [index, module] of modules.entries()) {
    const date = new Date(module.releaseAt);
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    assert.equal(values.weekday, "Sunday");
    assert.equal(values.hour, "00");
    assert.equal(values.minute, "00");
    assert.equal(date.getUTCHours(), index <= 5 ? 4 : 5);
    assert.equal(videos.isModuleReleased(module, date.getTime() - 1), false);
    assert.equal(videos.isModuleReleased(module, date.getTime()), true);
    assert.equal(videos.isModuleReleased(module, Date.parse("2027-01-01")), true);
    assert.equal(videos.isModuleReleased(module, NaN), false);
  }
});

test("the four Module 1 lessons stay ordered and later modules have no invented recordings", () => {
  assert.equal(modules[0].lessons.map(l => l.slug).join(","), "what-is-reiki,holy-fire-reiki,science-behind-reiki,history-of-reiki");
  assert.equal(new Set(modules[0].lessons.map(l => l.videoId)).size, 4);
  assert.ok(modules.slice(2).every(m => m.lessons.length === 0));
  assert.equal(videos.findReikiLesson("__proto__"), null);
  assert.equal(videos.findReikiLesson("../../private"), null);
});

test("Module 2 has eleven distinct lessons in teaching order with valid playback metadata", () => {
  assert.equal(modules[1].lessons.map(l => l.title).join(","), "Intro to Energy Anatomy,Chakras,Root Chakra,Sacral Chakra,Solar Plexus Chakra,Heart Chakra,Throat Chakra,Third Eye Chakra,Crown Chakra,Meridians,Aura");
  const lessons = [...modules, ...videos.reikiRisingReplays].flatMap(m => m.lessons);
  assert.equal(new Set(lessons.map(l => l.slug)).size, lessons.length);
  assert.equal(new Set(lessons.map(l => l.videoId)).size, lessons.length);
  for (const lesson of modules[1].lessons) {
    assert.match(lesson.videoId, /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/);
    assert.match(lesson.duration, /^\d+:[0-5]\d$/);
    assert.equal(videos.findReikiLesson(lesson.slug).module.date, "October 4, 2026");
  }
});

test("tokens use the Bunny SHA256 contract, expire in two hours and never contain the secret", () => {
  const now = Date.parse("2026-09-27T04:00:00Z");
  const id = modules[0].lessons[0].videoId;
  const url = new URL(videos.createReikiPlaybackUrl(id, now));
  const expires = Math.floor(now / 1000) + 7200;
  assert.equal(url.origin, "https://player.mediadelivery.net");
  assert.equal(url.pathname, `/embed/762439/${id}`);
  assert.equal(url.searchParams.get("expires"), String(expires));
  assert.equal(url.searchParams.get("token"), crypto.createHash("sha256").update(`test-only-signing-key${id}${expires}`).digest("hex"));
  assert.ok(!url.toString().includes(testEnv.BUNNY_STREAM_EMBED_TOKEN_KEY));
});

function endpoint({ email = "student@example.com", cohort = "reiki-rising-fall-2026", status = "active", now = "2026-09-27T04:00:00Z", preview = false, slug = "what-is-reiki", configured = true } = {}) {
  const clock = Date.parse(now);
  const route = load("../src/app/library/reiki-rising-fall-2026/videos/[lesson]/route.ts", {
    "@/lib/member-access": {
      canAccessReikiRisingFall2026: member.canAccessReikiRisingFall2026,
      getCurrentUserWithAccess: async () => ({ user: email ? { email } : null, accessRows: [{ offer_slug: cohort, access_status: status }] }),
    },
    "@/lib/site": { isAdminEmail: email => email === "admin@example.com" },
    "@/lib/reiki-rising-videos": { ...videos, isModuleReleased: m => videos.isModuleReleased(m, clock), createReikiPlaybackUrl: id => configured ? videos.createReikiPlaybackUrl(id, clock) : null },
  });
  return route.GET(new Request(`https://bethelightness.com/library/reiki-rising-fall-2026/videos/${slug}${preview ? "?preview=1" : ""}`), { params: Promise.resolve({ lesson: slug }) });
}

test("unauthenticated, wrong cohort and inactive students cannot obtain tokens even with preview", async () => {
  for (const [overrides, status] of [[{ email: "" }, 401], [{ cohort: "reiki-rising-spring-2026" }, 403], [{ status: "inactive" }, 403]]) {
    const response = await endpoint({ ...overrides, preview: true });
    assert.equal(response.status, status);
    assert.ok(!(await response.json()).url);
    assert.match(response.headers.get("cache-control"), /private, no-store/);
  }
});

test("students stay locked until the exact boundary; admin previews do not unlock students", async () => {
  const before = "2026-09-27T03:59:59.999Z";
  assert.equal((await endpoint({ now: before })).status, 403);
  assert.equal((await endpoint({ now: before, preview: true })).status, 403);
  assert.equal((await endpoint({ now: before, preview: true, email: "admin@example.com" })).status, 200);
  assert.equal((await endpoint({ now: before, email: "admin@example.com" })).status, 403);
  for (const lesson of modules[0].lessons) {
    const response = await endpoint({ slug: lesson.slug });
    assert.equal(response.status, 200);
    assert.ok((await response.json()).url.includes(lesson.videoId));
    assert.equal(response.headers.get("vary"), "Cookie");
  }
});

test("every Module 2 lesson unlocks at October 4 midnight Eastern and remains cohort protected", async () => {
  const before = "2026-10-04T03:59:59.999Z";
  const now = "2026-10-04T04:00:00Z";
  assert.equal(modules[1].releaseAt, "2026-10-04T00:00:00-04:00");
  for (const { slug, videoId } of modules[1].lessons) {
    for (const preview of [false, true]) {
      const locked = await endpoint({ slug, now: before, preview });
      assert.equal(locked.status, 403);
      assert.ok(!(await locked.json()).url);
    }
    assert.equal((await endpoint({ slug, now: before, email: "admin@example.com", preview: true })).status, 200);
    const response = await endpoint({ slug, now });
    assert.equal(response.status, 200);
    assert.equal(new URL((await response.json()).url).pathname, `/embed/762439/${videoId}`);
    assert.match(response.headers.get("cache-control"), /private, no-store/);
    assert.equal(response.headers.get("vary"), "Cookie");
    for (const [overrides, status] of [[{ email: "" }, 401], [{ cohort: "reiki-rising-spring-2026" }, 403], [{ status: "inactive" }, 403]]) {
      const blocked = await endpoint({ slug, now, preview: true, ...overrides });
      assert.equal(blocked.status, status);
      assert.ok(!(await blocked.json()).url);
    }
    const unavailable = await endpoint({ slug, now, configured: false });
    assert.equal(unavailable.status, 503);
    assert.ok(!(await unavailable.json()).url);
  }
});

test("missing lesson or signing configuration fails closed", async () => {
  assert.equal((await endpoint({ slug: "__proto__" })).status, 404);
  const response = await endpoint({ configured: false });
  assert.equal(response.status, 503);
  assert.ok(!(await response.json()).url);
  const missing = load("../src/lib/reiki-rising-videos.ts", { "server-only": {}, "node:crypto": crypto }, { process: { env: {} } });
  assert.equal(missing.createReikiPlaybackUrl("any"), null);
});

test("September 30 replay is available only to active Fall 2026 students after release", async () => {
  const slug = "live-call-2026-09-30";
  const now = "2026-10-03T00:00:00Z";
  const response = await endpoint({ slug, now });
  assert.equal(response.status, 200);
  assert.ok((await response.json()).url.includes("5c5fa972-1d82-48e5-9ec1-2aa69818ff89"));
  for (const [overrides, status] of [[{ email: "" }, 401], [{ cohort: "reiki-rising-spring-2026" }, 403], [{ status: "inactive" }, 403], [{ now: "2026-10-01T00:00:00Z" }, 403]]) {
    const blocked = await endpoint({ slug, now, ...overrides });
    assert.equal(blocked.status, status);
    assert.ok(!(await blocked.json()).url);
  }
});
