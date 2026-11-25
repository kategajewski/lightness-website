import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const require = createRequire(process.env.HOLIDAY_SQL_TEST_MODULE_ROOT
  ? path.join(process.env.HOLIDAY_SQL_TEST_MODULE_ROOT, "package.json") : import.meta.url);
const native = process.env.HOLIDAY_INITIATION_NATIVE === "1";
let clients;
let close;
if (native) {
  const { default: EmbeddedPostgres } = await import(require.resolve("embedded-postgres"));
  const listener = net.createServer();
  await new Promise((resolve, reject) => { listener.once("error", reject); listener.listen(0, "127.0.0.1", resolve); });
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const directory = await mkdtemp(path.join(os.tmpdir(), "lightness-initiation-contention-"));
  const pg = new EmbeddedPostgres({
    databaseDir: path.join(directory, "db"), port, user: "postgres",
    password: randomBytes(20).toString("hex"), persistent: false,
    postgresFlags: ["-c", "listen_addresses=127.0.0.1", "-c", `unix_socket_directories=${directory}`],
    onLog: () => {}, onError: () => {},
  });
  await pg.initialise();
  await pg.start();
  clients = await Promise.all(Array.from({ length: 8 }, async () => {
    const client = pg.getPgClient("postgres", "127.0.0.1");
    await client.connect();
    await client.query("set statement_timeout='10s'; set lock_timeout='8s'");
    return client;
  }));
  close = async () => {
    await Promise.all(clients.map((client) => client.end()));
    await pg.stop();
    await rm(directory, { recursive: true, force: true });
  };
} else {
  const { PGlite } = require("@electric-sql/pglite");
  const db = new PGlite();
  clients = Array(8).fill(db);
  close = () => db.close();
}

const db = clients[0];
const exec = native ? (sql) => db.query(sql) : (sql) => db.exec(sql);
await exec("create role anon; create role authenticated; create role service_role bypassrls;");
await exec("alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;");
await exec(await readFile(new URL("../supabase/migrations/202611250001_holiday_promotional_vouchers.sql", import.meta.url), "utf8"));
const baselineInput = {
  campaign_id: "a-little-light-2026", checkout_session_id: `cs_test_${randomUUID()}`,
  payment_intent_id: `pi_${randomUUID()}`, paid_certificate_code: "LIGHT-1234-567890",
  code: `HOLIDAY-${randomBytes(12).toString("hex").toUpperCase()}`,
  purchaser_email: "synthetic@example.test", purchaser_name: "Synthetic Purchaser",
  purchased_amount_cents: 10000, face_value_cents: 1500, stripe_livemode: false,
  issued_at: "2026-11-25T05:00:00Z", valid_from: "2027-01-01T05:00:00Z", expires_at: "2027-04-01T04:00:00Z",
};
const baseline = (await db.query("select * from public.issue_holiday_voucher($1::jsonb)", [JSON.stringify(baselineInput)])).rows[0];
await exec(await readFile(new URL("../supabase/migrations/202611250002_holiday_payment_initiations.sql", import.meta.url), "utf8"));

function input(overrides = {}) {
  return {
    campaign_id: "a-little-light-2026", checkout_session_id: `cs_test_${randomUUID()}`,
    payment_intent_id: `pi_${randomUUID()}`, stripe_livemode: false, purchase_amount_cents: 10000,
    currency: "usd", initiated_at: "2026-12-16T04:59:59Z", completed_event_id: `evt_${randomUUID()}`,
    event_type: "checkout.session.completed", holiday_launch_at: "2026-11-25T05:00:00Z", ...overrides,
  };
}
async function record(proof, client = db) {
  return (await client.query("select * from public.record_holiday_payment_initiation($1::jsonb)", [JSON.stringify(proof)])).rows[0];
}

test(`${native ? "native PostgreSQL" : "PGlite"}: additive migration preserves previously issued voucher state`, async () => {
  const after = (await db.query("select * from public.holiday_vouchers where id=$1", [baseline.id])).rows[0];
  assert.deepEqual(after, baseline);
  const outbox = (await db.query("select * from public.holiday_voucher_email_outbox where voucher_id=$1", [baseline.id])).rows;
  assert.equal(outbox.length, 1);
  assert.equal(outbox[0].delivery_amount_cents, 1500);
});

test("signed completed-event evidence records the event instant and returns one immutable proof", async () => {
  const proof = input();
  const first = await record(proof);
  const retry = await record(proof);
  assert.deepEqual(retry, first);
  assert.equal(first.initiated_at.toISOString(), "2026-12-16T04:59:59.000Z");
  assert.equal(first.completed_event_id, proof.completed_event_id);
  assert.equal(first.payment_intent_id, proof.payment_intent_id);
});

test("proof retries reject changes to payment, mode, amount, currency, event, timestamp or launch", async () => {
  const proof = input();
  await record(proof);
  for (const change of [
    { payment_intent_id: "pi_changed" }, { stripe_livemode: true }, { purchase_amount_cents: 25000 },
    { currency: "eur" }, { completed_event_id: `evt_${randomUUID()}` },
    { initiated_at: "2026-12-16T05:00:00Z" }, { holiday_launch_at: "2026-11-26T05:00:00Z" },
  ]) {
    await assert.rejects(record({ ...proof, ...change }));
  }
  const unchanged = (await db.query("select * from public.holiday_payment_initiations where campaign_id=$1 and checkout_session_id=$2", [proof.campaign_id, proof.checkout_session_id])).rows[0];
  assert.equal(unchanged.purchase_amount_cents, 10000);
  assert.equal(unchanged.initiated_at.toISOString(), "2026-12-16T04:59:59.000Z");
});

test("post-deadline and pre-launch evidence persists without imposing campaign eligibility policy", async () => {
  const late = await record(input({ initiated_at: "2026-12-16T05:00:00Z" }));
  assert.equal(late.initiated_at.toISOString(), "2026-12-16T05:00:00.000Z");
  const early = await record(input({ initiated_at: "2026-11-24T05:00:00Z" }));
  assert.equal(early.initiated_at.toISOString(), "2026-11-24T05:00:00.000Z");
  const noLaunch = await record(input({ holiday_launch_at: null }));
  assert.equal(noLaunch.holiday_launch_at, null);
});

test("opening checkout, async events and malformed order evidence cannot be recorded as initiation", async () => {
  await assert.rejects(record(input({ event_type: "checkout.session.created" })), /signed checkout/);
  await assert.rejects(record(input({ event_type: "checkout.session.async_payment_succeeded" })), /signed checkout/);
  await assert.rejects(record(input({ event_type: null })), /signed checkout/);
  await assert.rejects(record(input({ payment_intent_id: null })));
  await assert.rejects(record(input({ purchase_amount_cents: 0 })));
  await assert.rejects(record(input({ currency: "eur" })));
});

test("completed-event and payment-intent uniqueness prevent proof reuse across sessions", async () => {
  const proof = input();
  await record(proof);
  await assert.rejects(record(input({ completed_event_id: proof.completed_event_id })));
  await assert.rejects(record(input({ payment_intent_id: proof.payment_intent_id })));
});

test("earlier or later replacement timestamps cannot alter the first signed proof", async () => {
  const late = input({ initiated_at: "2026-12-16T05:00:01Z" });
  await record(late);
  await assert.rejects(record({ ...late, initiated_at: "2026-12-16T04:59:59Z" }), /does not match/);
  const stored = (await db.query("select * from public.holiday_payment_initiations where campaign_id=$1 and checkout_session_id=$2", [late.campaign_id, late.checkout_session_id])).rows[0];
  assert.equal(stored.initiated_at.toISOString(), "2026-12-16T05:00:01.000Z");
});

test("table and RPC privileges survive Supabase-style broad default grants", async () => {
  const proof = input();
  for (const role of ["anon", "authenticated"]) {
    await exec(`set role ${role}`);
    try {
      await assert.rejects(db.query("select * from public.holiday_payment_initiations"), /permission denied/);
      await assert.rejects(record(proof), /permission denied/);
    } finally { await exec("reset role"); }
  }
  await exec("set role service_role");
  try {
    await record(proof);
    const rows = (await db.query("select * from public.holiday_payment_initiations where checkout_session_id=$1", [proof.checkout_session_id])).rows;
    assert.equal(rows.length, 1);
    await assert.rejects(db.query("update public.holiday_payment_initiations set purchase_amount_cents=1 where checkout_session_id=$1", [proof.checkout_session_id]), /permission denied/);
    await assert.rejects(db.query("delete from public.holiday_payment_initiations where checkout_session_id=$1", [proof.checkout_session_id]), /permission denied/);
  } finally { await exec("reset role"); }
  await assert.rejects(db.query("update public.holiday_payment_initiations set purchase_amount_cents=1 where checkout_session_id=$1", [proof.checkout_session_id]), /immutable/);
  await assert.rejects(db.query("delete from public.holiday_payment_initiations where checkout_session_id=$1", [proof.checkout_session_id]), /immutable/);
});

test(`${native ? "eight independent connections" : "duplicate requests"} converge on one initiation proof`, async () => {
  const proof = input();
  const results = await Promise.all(clients.map((client) => record(proof, client)));
  assert.ok(results.every((row) => row.completed_event_id === proof.completed_event_id));
  assert.ok(results.every((row) => row.created_at.toISOString() === results[0].created_at.toISOString()));
  const rows = (await db.query("select * from public.holiday_payment_initiations where campaign_id=$1 and checkout_session_id=$2", [proof.campaign_id, proof.checkout_session_id])).rows;
  assert.equal(rows.length, 1);
});

test(`${native ? "contending connections" : "conflicting callbacks"} cannot overwrite a transaction amount`, async () => {
  const proof = input();
  const results = await Promise.allSettled([
    record(proof, clients[0]), record({ ...proof, purchase_amount_cents: 25000 }, clients[1]),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  const rows = (await db.query("select * from public.holiday_payment_initiations where campaign_id=$1 and checkout_session_id=$2", [proof.campaign_id, proof.checkout_session_id])).rows;
  assert.equal(rows.length, 1);
  assert.ok([10000, 25000].includes(rows[0].purchase_amount_cents));
});

test.after(close);
