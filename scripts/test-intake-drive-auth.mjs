import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { test } from "node:test";

const require = createRequire(process.env.LIGHTNESS_TEST_PACKAGE_PATH || new URL("../package.json", import.meta.url));
const ts = require("typescript");
const targetEmail = "kategajewski@gmail.com";
const driveScope = "https://www.googleapis.com/auth/drive.file";
const cookieName = "lightness_intake_drive_oauth";
const callback = "https://bethelightness.com/api/client-intakes/drive/callback";
const privateAccessToken = "synthetic-access-token-do-not-log";
const privateRefreshToken = "synthetic-refresh-token-do-not-log";
const privateProviderPayload = "synthetic-private-provider-payload-do-not-log";
const owner = { id: "synthetic-owner-id", email: "owner@example.invalid" };
const envDefaults = {
  GOOGLE_DRIVE_CLIENT_ID: "synthetic-client.apps.googleusercontent.com",
  GOOGLE_DRIVE_CLIENT_SECRET: "synthetic-client-secret-do-not-log",
  INTAKE_ENCRYPTION_KEY: Buffer.alloc(32, 17).toString("base64"),
  VERCEL_ENV: "production",
  CRON_SECRET: "synthetic-cron-secret-".repeat(3),
};

function load(file, dependencies = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const context = {
    exports: {}, Buffer, URL, URLSearchParams, Request, Response, AbortSignal,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    console: new Proxy({}, { get() { return () => { throw new Error("Unexpected logging in authorization test"); }; } }),
    ...globals,
  };
  vm.runInNewContext(source, context, { filename: file });
  return context.exports;
}
function json(value, status = 200) { return new Response(JSON.stringify(value), { status }); }
function authHarness({ env = {}, fetch: responder, previous = null } = {}) {
  const environment = { ...envDefaults, ...env };
  const jar = new Map();
  const cookieWrites = [];
  const cookieDeletes = [];
  const calls = [];
  const writes = [];
  let now = Date.now();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const encryption = load("../src/lib/intake-crypto.ts", { "server-only": {}, "node:crypto": crypto }, { process: { env: environment } });
  const authModule = load("../src/lib/intake-drive-auth.ts", {
    "server-only": {}, "node:crypto": crypto,
    "next/headers": { async cookies() { return {
      get(name) { return jar.has(name) ? { value: jar.get(name) } : undefined; },
      set(name, value, options) { jar.set(name, value); cookieWrites.push({ name, value, options }); },
      delete(options) { jar.delete(options.name); cookieDeletes.push(options); },
    }; } },
    "@/lib/intake-crypto": encryption,
    "@/lib/intake-automation-store": {
      async readAutomationValue(key) { assert.equal(key, "config/drive"); return previous; },
      async writeAutomationValue(key, value) { assert.equal(key, "config/drive"); writes.push({ key, value }); },
    },
  }, {
    process: { env: environment }, Date: Clock,
    async fetch(url, init) {
      calls.push({ url, init });
      assert.equal(init.cache, "no-store");
      assert.equal(init.redirect, "error");
      assert.ok(init.signal instanceof AbortSignal);
      assert.equal(String(url).includes(privateAccessToken), false);
      assert.equal(String(url).includes(privateRefreshToken), false);
      if (responder) return responder(url, init, calls.length);
      if (url === "https://oauth2.googleapis.com/token") return json({ access_token: privateAccessToken, refresh_token: privateRefreshToken, scope: `openid email ${driveScope}` });
      assert.equal(url, "https://openidconnect.googleapis.com/v1/userinfo");
      return json({ email: targetEmail, email_verified: true });
    },
  });
  function stateRecord() {
    return encryption.decryptIntake(JSON.parse(Buffer.from(jar.get(cookieName), "base64url").toString("utf8")), "drive-oauth-state");
  }
  function setState(value) {
    jar.set(cookieName, Buffer.from(JSON.stringify(encryption.encryptIntake(value, "drive-oauth-state"))).toString("base64url"));
  }
  return {
    module: authModule, environment, jar, cookieWrites, cookieDeletes, calls, writes, encryption, stateRecord, setState,
    advance(ms) { now += ms; },
    async begin(userId = owner.id) { return new URL(await authModule.beginIntakeDriveAuthorization(userId)); },
    async complete(state, userId = owner.id, extras = {}) {
      const url = new URL(callback);
      url.search = new URLSearchParams({ state, code: "synthetic-private-code-do-not-log", ...extras }).toString();
      return authModule.completeIntakeDriveAuthorization(url, userId);
    },
  };
}

test("OAuth start uses encrypted, expiring user-bound state and PKCE with secure browser-only cookies", async () => {
  const h = authHarness();
  const authorization = await h.begin();
  assert.equal(authorization.origin + authorization.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
  assert.equal(authorization.searchParams.get("redirect_uri"), callback);
  assert.equal(authorization.searchParams.get("login_hint"), targetEmail);
  assert.equal(authorization.searchParams.get("scope"), `openid email ${driveScope}`);
  assert.equal(authorization.searchParams.get("access_type"), "offline");
  assert.equal(authorization.searchParams.get("prompt"), "consent");
  assert.equal(authorization.searchParams.get("code_challenge_method"), "S256");
  const saved = h.stateRecord();
  assert.equal(saved.userId, owner.id);
  assert.match(saved.state, /^[A-Za-z0-9_-]{43}$/);
  assert.match(saved.verifier, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(authorization.searchParams.get("state"), saved.state);
  assert.equal(authorization.searchParams.get("code_challenge"), crypto.createHash("sha256").update(saved.verifier).digest("base64url"));
  assert.ok(saved.expiresAt > Date.now() && saved.expiresAt <= Date.now() + 900_000);
  const cookie = h.cookieWrites[0];
  assert.equal(cookie.name, cookieName);
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.secure, true);
  assert.equal(cookie.options.sameSite, "lax");
  assert.equal(cookie.options.path, "/api/client-intakes/drive");
  assert.equal(cookie.options.maxAge, 900);
  const envelopeText = Buffer.from(cookie.value, "base64url").toString("utf8");
  for (const secret of [saved.verifier, saved.state, owner.id]) assert.equal(envelopeText.includes(secret), false);
  assert.equal(h.calls.length, 0);
});

test("successful callback verifies scope and exact Gmail identity before privately storing offline credentials", async () => {
  const h = authHarness();
  const authorization = await h.begin();
  const saved = h.stateRecord();
  await h.complete(authorization.searchParams.get("state"));
  assert.equal(h.calls.length, 2);
  const tokenCall = h.calls[0];
  assert.equal(tokenCall.url, "https://oauth2.googleapis.com/token");
  assert.equal(tokenCall.init.method, "POST");
  assert.equal(tokenCall.init.body.get("code_verifier"), saved.verifier);
  assert.equal(tokenCall.init.body.get("redirect_uri"), callback);
  assert.equal(tokenCall.init.body.get("grant_type"), "authorization_code");
  assert.equal(tokenCall.init.body.get("client_id"), envDefaults.GOOGLE_DRIVE_CLIENT_ID);
  assert.equal(h.calls[1].init.headers.Authorization, `Bearer ${privateAccessToken}`);
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].value.email, targetEmail);
  assert.equal(h.writes[0].value.refreshToken, privateRefreshToken);
  assert.equal(h.writes[0].value.clientId, envDefaults.GOOGLE_DRIVE_CLIENT_ID);
  assert.ok(Number.isFinite(Date.parse(h.writes[0].value.connectedAt)));
  assert.equal(h.jar.has(cookieName), false);
  assert.equal(h.cookieDeletes[0].path, "/api/client-intakes/drive");
  await assert.rejects(() => h.complete(saved.state));
  assert.equal(h.calls.length, 2, "A consumed callback cannot exchange its code again");
});

test("wrong state, wrong user, expired state and malformed PKCE fail before provider access and consume the cookie", async () => {
  for (const mutation of ["state", "user", "expired", "verifier", "expiry-type"]) {
    const h = authHarness();
    const authorization = await h.begin();
    let state = authorization.searchParams.get("state");
    let userId = owner.id;
    if (mutation === "state") state = "X".repeat(43);
    if (mutation === "user") userId = "another-user";
    if (mutation === "expired") h.advance(901_000);
    if (["verifier", "expiry-type"].includes(mutation)) {
      const saved = h.stateRecord();
      if (mutation === "verifier") saved.verifier = "short";
      else saved.expiresAt = "future";
      h.setState(saved);
    }
    await assert.rejects(() => h.complete(state, userId));
    assert.equal(h.calls.length, 0, mutation);
    assert.equal(h.writes.length, 0, mutation);
    assert.equal(h.jar.has(cookieName), false, mutation);
  }
});

test("tampered or incorrectly bound encrypted cookies cannot authorize a provider exchange", async () => {
  for (const mutation of ["ciphertext", "binding", "oversized", "missing"]) {
    const h = authHarness();
    const authorization = await h.begin();
    if (mutation === "missing") h.jar.delete(cookieName);
    else if (mutation === "oversized") h.jar.set(cookieName, "x".repeat(8001));
    else {
      const envelope = JSON.parse(Buffer.from(h.jar.get(cookieName), "base64url").toString("utf8"));
      if (mutation === "binding") envelope.id = "different-storage-object";
      else envelope.ciphertext = Buffer.alloc(20, 2).toString("base64");
      h.jar.set(cookieName, Buffer.from(JSON.stringify(envelope)).toString("base64url"));
    }
    await assert.rejects(() => h.complete(authorization.searchParams.get("state")));
    assert.equal(h.calls.length, 0, mutation);
    assert.equal(h.writes.length, 0, mutation);
    assert.equal(h.jar.has(cookieName), false, mutation);
  }
});

test("provider denial or missing code never performs token exchange", async () => {
  for (const extras of [{ error: "access_denied" }, { code: "" }]) {
    const h = authHarness();
    const authorization = await h.begin();
    await assert.rejects(() => h.complete(authorization.searchParams.get("state"), owner.id, extras));
    assert.equal(h.calls.length, 0);
    assert.equal(h.writes.length, 0);
  }
});

test("wrong Gmail account and unverified or string-valued verification never save a connection", async () => {
  for (const profile of [{ email: "wrong@example.invalid", email_verified: true }, { email: targetEmail, email_verified: false }, { email: targetEmail, email_verified: "true" }, {}]) {
    const h = authHarness({ fetch(url) { return url.includes("/token") ? json({ access_token: privateAccessToken, refresh_token: privateRefreshToken, scope: driveScope }) : json(profile); } });
    const authorization = await h.begin();
    await assert.rejects(() => h.complete(authorization.searchParams.get("state")));
    assert.equal(h.calls.length, 2);
    assert.equal(h.writes.length, 0);
  }
});

test("missing Drive permission or access token fails before account access or connection persistence", async () => {
  for (const token of [{ access_token: privateAccessToken, scope: "openid email" }, { access_token: privateAccessToken }, { scope: driveScope }, { access_token: "", scope: driveScope }]) {
    const h = authHarness({ fetch() { return json(token); } });
    const authorization = await h.begin();
    await assert.rejects(() => h.complete(authorization.searchParams.get("state")));
    assert.equal(h.calls.length, 1);
    assert.equal(h.writes.length, 0);
  }
});

test("malformed token field types cannot become a stored refresh credential or bypass scope checks", async () => {
  for (const token of [
    { access_token: privateAccessToken, refresh_token: 12345, scope: driveScope },
    { access_token: privateAccessToken, refresh_token: [privateRefreshToken], scope: driveScope },
    { access_token: privateAccessToken, refresh_token: privateRefreshToken, scope: 12345 },
    { access_token: privateAccessToken, refresh_token: privateRefreshToken, scope: { granted: driveScope } },
    null,
  ]) {
    const h = authHarness({ fetch() { return json(token); } });
    const authorization = await h.begin();
    await assert.rejects(() => h.complete(authorization.searchParams.get("state")), error => error.message === "Google Drive authorization needs attention.");
    assert.equal(h.calls.length, 1);
    assert.equal(h.writes.length, 0);
  }
});

test("missing OAuth client setup refuses authorization start without cookie or provider activity", async () => {
  for (const env of [{ GOOGLE_DRIVE_CLIENT_ID: "" }, { GOOGLE_DRIVE_CLIENT_SECRET: "" }]) {
    const h = authHarness({ env });
    assert.equal(h.module.intakeDriveOAuthConfigured(), false);
    await assert.rejects(() => h.begin());
    assert.equal(h.calls.length, 0);
    assert.equal(h.cookieWrites.length, 0);
  }
});

test("missing offline token only reuses an existing connection for the same configured client and Gmail", async () => {
  const existing = { email: targetEmail, refreshToken: privateRefreshToken, clientId: envDefaults.GOOGLE_DRIVE_CLIENT_ID, connectedAt: "2026-10-31T00:00:00Z" };
  for (const previous of [existing, null, { ...existing, email: "wrong@example.invalid" }, { ...existing, clientId: "different-client" }]) {
    const h = authHarness({ previous, fetch(url) { return url.includes("/token") ? json({ access_token: privateAccessToken, scope: driveScope }) : json({ email: targetEmail, email_verified: true }); } });
    const authorization = await h.begin();
    if (previous === existing) {
      await h.complete(authorization.searchParams.get("state"));
      assert.equal(h.writes[0].value.refreshToken, privateRefreshToken);
    } else {
      await assert.rejects(() => h.complete(authorization.searchParams.get("state")));
      assert.equal(h.writes.length, 0);
    }
  }
});

test("access-token refresh validates configured account and never puts refresh credentials in URLs", async () => {
  const connection = { email: targetEmail, refreshToken: privateRefreshToken, clientId: envDefaults.GOOGLE_DRIVE_CLIENT_ID, connectedAt: "2026-10-31T00:00:00Z" };
  const h = authHarness();
  assert.equal(await h.module.getIntakeDriveAccessToken(connection), privateAccessToken);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].init.body.get("grant_type"), "refresh_token");
  assert.equal(h.calls[0].init.body.get("refresh_token"), privateRefreshToken);
  for (const invalid of [{ ...connection, email: "wrong@example.invalid" }, { ...connection, clientId: "different-client" }]) await assert.rejects(() => h.module.getIntakeDriveAccessToken(invalid));
  assert.equal(h.calls.length, 1);
});

test("provider failures expose generic errors without token, authorization code or raw response leakage", async () => {
  for (const failure of ["http", "network", "bad-json", "userinfo-http"]) {
    const h = authHarness({ fetch(url) {
      if (failure === "network") throw new Error(`${privateProviderPayload} ${privateAccessToken}`);
      if (failure === "bad-json") return new Response(`${privateProviderPayload} ${privateAccessToken}`);
      if (failure === "http") return json({ detail: `${privateProviderPayload} ${privateAccessToken}` }, 503);
      return url.includes("/token") ? json({ access_token: privateAccessToken, refresh_token: privateRefreshToken, scope: driveScope }) : json({ error: privateProviderPayload }, 503);
    } });
    const authorization = await h.begin();
    await assert.rejects(() => h.complete(authorization.searchParams.get("state")), error => {
      const visible = `${error.message} ${JSON.stringify(error)}`;
      for (const secret of [privateAccessToken, privateRefreshToken, privateProviderPayload, "synthetic-private-code-do-not-log", envDefaults.GOOGLE_DRIVE_CLIENT_SECRET]) assert.equal(visible.includes(secret), false, failure);
      return true;
    });
    assert.equal(h.writes.length, 0);
  }
});

class MockNextResponse extends Response {
  static redirect(url, options = 307) {
    const init = typeof options === "number" ? { status: options } : options;
    return new MockNextResponse(null, { ...init, headers: { ...init.headers, Location: String(url) } });
  }
  static json(value, options) { return new MockNextResponse(JSON.stringify(value), { ...options, headers: { "Content-Type": "application/json", ...options?.headers } }); }
}
function routeHarness(kind, { user = owner, env = {}, providerThrows = false, processThrows = false } = {}) {
  const events = [];
  const scheduled = [];
  const logs = [];
  const environment = { ...envDefaults, ...env };
  const routeModule = load(`../src/app/api/client-intakes/${kind}/route.ts`, {
    "node:crypto": crypto,
    "next/server": { NextResponse: MockNextResponse, after(callback) { scheduled.push(callback); } },
    "@/lib/member-access": { async getCurrentUserWithAccess() { events.push("auth"); return { user }; } },
    "@/lib/site": { isAdminEmail(email) { events.push("admin"); return email === owner.email; } },
    "@/lib/intake-drive-auth": {
      async beginIntakeDriveAuthorization(userId) { events.push(["begin", userId]); if (providerThrows) throw new Error(privateProviderPayload); return "https://accounts.google.com/o/oauth2/v2/auth?state=synthetic-state"; },
      async completeIntakeDriveAuthorization(url, userId) { events.push(["complete", userId, url.searchParams.get("code")]); if (providerThrows) throw new Error(`${privateProviderPayload} ${privateAccessToken}`); },
    },
    "@/lib/intake-automations": { async processPendingIntakeAutomations() { events.push("process"); if (processThrows) throw new Error(privateProviderPayload); return { processed: 2, completed: 1 }; } },
  }, { process: { env: environment }, console: { error(...values) { logs.push(values); } } });
  function request(method, { origin = "https://bethelightness.com", authorization, query = "" } = {}) {
    return new Request(`https://bethelightness.com/api/client-intakes/${kind}${query}`, { method, headers: { ...(origin === null ? {} : { Origin: origin }), ...(authorization ? { Authorization: authorization } : {}) } });
  }
  return { module: routeModule, events, scheduled, logs, environment, request };
}

test("connect POST rejects unauthenticated and non-admin users before OAuth access", async () => {
  for (const user of [null, { id: "visitor", email: "visitor@example.invalid" }]) {
    const h = routeHarness("drive/connect", { user });
    assert.equal((await h.module.POST(h.request("POST"))).status, 403);
    assert.equal(h.events.filter(event => Array.isArray(event)).length, 0);
    assert.equal(h.scheduled.length, 0);
  }
});

test("connect POST refuses foreign or absent origins and preview deployments before any auth or provider access", async () => {
  for (const options of [{ origin: "https://wrong.example.invalid" }, { origin: null }, { preview: true }]) {
    const h = routeHarness("drive/connect", { env: options.preview ? { VERCEL_ENV: "preview" } : {} });
    assert.equal((await h.module.POST(h.request("POST", options))).status, 403);
    assert.equal(h.events.length, 0);
  }
});

test("authorized connect uses the signed-in user ID and a fixed safe failure redirect", async () => {
  for (const providerThrows of [false, true]) {
    const h = routeHarness("drive/connect", { providerThrows });
    const response = await h.module.POST(h.request("POST"));
    assert.equal(response.status, 303);
    assert.deepEqual(h.events, ["auth", "admin", ["begin", owner.id]]);
    assert.equal(response.headers.get("location"), providerThrows ? "https://bethelightness.com/client-intakes/automation?status=setup-needed" : "https://accounts.google.com/o/oauth2/v2/auth?state=synthetic-state");
    assert.equal(response.headers.get("location").includes(privateProviderPayload), false);
  }
});

test("callback GET rejects unauthenticated, non-admin and preview callers before provider work", async () => {
  for (const options of [{ user: null }, { user: { id: "visitor", email: "visitor@example.invalid" } }, { env: { VERCEL_ENV: "preview" } }]) {
    const h = routeHarness("drive/callback", options);
    const response = await h.module.GET(h.request("GET", { query: "?code=private-code&state=private-state" }));
    assert.equal(response.status, 403);
    assert.equal(h.events.filter(event => Array.isArray(event)).length, 0);
    assert.equal(h.scheduled.length, 0);
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  }
});

test("callback completion schedules processing only after verified connection and never reflects provider details", async () => {
  for (const providerThrows of [false, true]) {
    const h = routeHarness("drive/callback", { providerThrows });
    const response = await h.module.GET(h.request("GET", { query: "?code=private-code&state=private-state" }));
    assert.equal(response.status, 303);
    assert.deepEqual(h.events, ["auth", "admin", ["complete", owner.id, "private-code"]]);
    assert.equal(response.headers.get("location"), `https://bethelightness.com/client-intakes/automation?status=${providerThrows ? "connection-failed" : "connected"}`);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    assert.equal(h.scheduled.length, providerThrows ? 0 : 1);
    assert.equal(h.logs.length, 0);
    assert.equal((await response.text()).includes(privateAccessToken), false);
  }
});

test("scheduled callback processing logs only a generic retry message on failure", async () => {
  const h = routeHarness("drive/callback", { processThrows: true });
  await h.module.GET(h.request("GET", { query: "?code=private-code&state=private-state" }));
  await h.scheduled[0]();
  assert.deepEqual(h.logs, [["Intake automation processing will be retried."]]);
});

test("process GET requires the exact sufficiently long cron bearer secret before any processing", async () => {
  for (const options of [{}, { authorization: "Bearer wrong" }, { authorization: `Bearer ${envDefaults.CRON_SECRET.slice(1)}` }, { authorization: `bearer ${envDefaults.CRON_SECRET}` }, { short: true, authorization: "Bearer short" }]) {
    const h = routeHarness("process", { env: options.short ? { CRON_SECRET: "short" } : {} });
    const response = await h.module.GET(h.request("GET", options));
    assert.equal(response.status, 403);
    assert.equal(h.events.length, 0);
  }
  const h = routeHarness("process");
  const response = await h.module.GET(h.request("GET", { authorization: `Bearer ${envDefaults.CRON_SECRET}` }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { processed: 2, completed: 1 });
  assert.deepEqual(h.events, ["process"]);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});

test("process POST requires canonical origin and admin identity before scheduling delivery", async () => {
  for (const options of [{ origin: null }, { origin: "https://wrong.example.invalid" }, { user: null }, { user: { id: "visitor", email: "visitor@example.invalid" } }]) {
    const h = routeHarness("process", options);
    assert.equal((await h.module.POST(h.request("POST", options))).status, 403);
    assert.equal(h.scheduled.length, 0);
    assert.equal(h.events.includes("process"), false);
  }
  const h = routeHarness("process", { processThrows: true });
  const response = await h.module.POST(h.request("POST"));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://bethelightness.com/client-intakes/automation?status=retry-started");
  assert.equal(h.events.includes("process"), false, "Processing starts after the response");
  await h.scheduled[0]();
  assert.deepEqual(h.logs, [["Intake automation processing will be retried."]]);
});

test("process endpoints reject preview and development deployments before cron, auth or processing", async () => {
  for (const VERCEL_ENV of ["preview", "development", ""]) {
    const h = routeHarness("process", { env: { VERCEL_ENV } });
    const get = await h.module.GET(h.request("GET", { authorization: `Bearer ${envDefaults.CRON_SECRET}` }));
    const post = await h.module.POST(h.request("POST"));
    assert.equal(get.status, 403);
    assert.equal(post.status, 403);
    assert.equal(h.events.length, 0);
    assert.equal(h.scheduled.length, 0);
  }
});

test("private automation page authorizes before reading connection or queue details and keeps tokens out of rendered output", async () => {
  for (const user of [null, { email: "visitor@example.invalid" }, owner]) {
    const accesses = [];
    const Page = load("../src/app/client-intakes/automation/page.tsx", {
      "react/jsx-runtime": { jsx(type, props) { return { type: typeof type === "string" ? type : "component", props }; }, jsxs(type, props) { return { type: typeof type === "string" ? type : "component", props }; } },
      "next/link": { default() {} }, "@/components/page-shell": { PageShell() {} },
      "next/navigation": { redirect(url) { throw new Error(`REDIRECT:${url}`); } },
      "@/lib/member-access": { async getCurrentUserWithAccess() { accesses.push("auth"); return { user }; } },
      "@/lib/site": { isAdminEmail(email) { return email === owner.email; } },
      "@/lib/intake-drive-auth": {
        async getIntakeDriveConnection() { accesses.push("connection"); return { email: targetEmail, refreshToken: privateRefreshToken }; },
        intakeDriveOAuthConfigured() { return true; },
      },
      "@/lib/intake-automations": { intakeAutomationsEnabled() { return true; } },
      "@/lib/intake-mailchimp": { intakeMailchimpConfigured() { return true; } },
      "@/lib/intake-automation-store": { async pendingAutomationJobs() { accesses.push("queue"); return ["one-job"]; } },
    }).default;
    if (user !== owner) {
      await assert.rejects(() => Page({ searchParams: Promise.resolve({ status: privateProviderPayload }) }), error => error.message.startsWith("REDIRECT:"));
      assert.deepEqual(accesses, ["auth"]);
    } else {
      const tree = await Page({ searchParams: Promise.resolve({ status: privateProviderPayload }) });
      const rendered = JSON.stringify(tree);
      assert.deepEqual(accesses, ["auth", "connection", "queue"]);
      for (const secret of [privateRefreshToken, privateAccessToken, privateProviderPayload]) assert.equal(rendered.includes(secret), false);
      assert.ok(rendered.includes("Connected: kategajewski@gmail.com"));
    }
  }
});
