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
  const directory = await mkdtemp(path.join(os.tmpdir(), "lightness-initiation-events-"));
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
await exec(await readFile(new URL("../supabase/migrations/202611250002_holiday_payment_initiations.sql", import.meta.url), "utf8"));
const cutoff = Date.parse("2026-12-16T05:00:00Z");
function input(overrides = {}) {
  return {
    campaign_id: "a-little-light-2026", checkout_session_id: `cs_test_${randomUUID()}`,
    payment_intent_id: `pi_${randomUUID()}`, stripe_livemode: false, purchase_amount_cents: 10000,
    currency: "usd", initiated_at: "2026-12-16T05:00:01Z", completed_event_id: `evt_${randomUUID()}`,
    event_type: "checkout.session.completed", holiday_launch_at: "2026-11-25T05:00:00Z", ...overrides,
  };
}
async function record(proof, client = db) {
  return (await client.query("select * from public.record_holiday_payment_initiation($1::jsonb)", [JSON.stringify(proof)])).rows[0];
}
async function receipts(proof) {
  return (await db.query("select * from public.holiday_payment_initiation_events where campaign_id=$1 and checkout_session_id=$2 order by initiated_at, completed_event_id", [proof.campaign_id, proof.checkout_session_id])).rows;
}
async function summary(proof) {
  return (await db.query("select * from public.holiday_payment_initiations where campaign_id=$1 and checkout_session_id=$2", [proof.campaign_id, proof.checkout_session_id])).rows[0];
}
const legacyInput = input();
const legacy = await record(legacyInput);
await exec(await readFile(new URL("../supabase/migrations/202611250003_holiday_payment_initiation_events.sql", import.meta.url), "utf8"));

test(`${native ? "native PostgreSQL" : "PGlite"}: migration seeds original 002 proof and recording time without changing its summary`, async () => {
  assert.deepEqual(await summary(legacyInput), legacy);
  const seeded = await receipts(legacyInput);
  assert.equal(seeded.length, 1);
  assert.deepEqual(seeded[0], legacy);
});

test("an earlier distinct signed event corrects a late-first summary across the campaign cutoff", async () => {
  const earlierInput = { ...legacyInput, completed_event_id: `evt_${randomUUID()}`, initiated_at: "2026-12-16T04:59:59Z" };
  assert.ok(legacy.initiated_at.getTime() >= cutoff);
  const earliest = await record(earlierInput);
  assert.ok(earliest.initiated_at.getTime() < cutoff);
  assert.equal(earliest.completed_event_id, earlierInput.completed_event_id);
  assert.equal(earliest.created_at.toISOString(), legacy.created_at.toISOString());
  const preserved = await receipts(legacyInput);
  assert.equal(preserved.length, 2);
  assert.ok(preserved.some((row) => row.completed_event_id === legacy.completed_event_id && row.initiated_at.getTime() === legacy.initiated_at.getTime()));
});

test("a later distinct duplicate appends evidence without moving the canonical timestamp forward", async () => {
  const proof = input({ initiated_at: "2026-12-16T04:59:59Z" });
  const initial = await record(proof);
  const late = { ...proof, completed_event_id: `evt_${randomUUID()}`, initiated_at: "2026-12-16T05:00:10Z" };
  const result = await record(late);
  assert.deepEqual(result, initial);
  assert.equal((await receipts(proof)).length, 2);
  const lateReplay = await record(late);
  assert.deepEqual(lateReplay, initial);
});

test("distinct IDs sharing the same signed second preserve the first summary and both receipts", async () => {
  const proof = input();
  const first = await record(proof);
  const sameInstant = await record({ ...proof, completed_event_id: `evt_${randomUUID()}` });
  assert.deepEqual(sameInstant, first);
  assert.equal((await receipts(proof)).length, 2);
});

test("reusing one event ID with another timestamp or financial payload is rejected", async () => {
  const proof = input();
  await record(proof);
  for (const changes of [
    { initiated_at: "2026-12-16T04:59:59Z" }, { payment_intent_id: "pi_changed" },
    { stripe_livemode: true }, { purchase_amount_cents: 15000 }, { currency: "eur" },
    { holiday_launch_at: "2026-11-26T05:00:00Z" }, { checkout_session_id: "cs_test_changed" },
    { campaign_id: "another-campaign" }, { event_type: "checkout.session.async_payment_succeeded" },
  ]) await assert.rejects(record({ ...proof, ...changes }));
  assert.equal((await receipts(proof)).length, 1);
  assert.equal((await summary(proof)).completed_event_id, proof.completed_event_id);
});

test("distinct event IDs cannot change a session's financial binding or launch", async () => {
  const proof = input();
  const first = await record(proof);
  for (const changes of [
    { payment_intent_id: "pi_changed" }, { stripe_livemode: true }, { purchase_amount_cents: 25000 },
    { currency: "eur" }, { holiday_launch_at: "2026-11-26T05:00:00Z" },
  ]) await assert.rejects(record({ ...proof, ...changes, completed_event_id: `evt_${randomUUID()}`, initiated_at: "2026-12-16T04:59:00Z" }));
  assert.deepEqual(await summary(proof), first);
  assert.equal((await receipts(proof)).length, 1);
});

test("an original event remains bound to its session after the canonical pointer changes", async () => {
  const proof = input();
  await record(proof);
  await record({ ...proof, completed_event_id: `evt_${randomUUID()}`, initiated_at: "2026-12-16T04:59:59Z" });
  const reused = input({ completed_event_id: proof.completed_event_id });
  await assert.rejects(record(reused), /receipt retry/);
  assert.equal(await summary(reused), undefined);
});

test("raw receipts are append-only and a summary can move only to preserved earlier evidence", async () => {
  const proof = input();
  const first = await record(proof);
  await assert.rejects(db.query("update public.holiday_payment_initiation_events set initiated_at='2026-12-15T00:00:00Z' where completed_event_id=$1", [proof.completed_event_id]), /append-only/);
  await assert.rejects(db.query("delete from public.holiday_payment_initiation_events where completed_event_id=$1", [proof.completed_event_id]), /append-only/);
  await assert.rejects(db.query("update public.holiday_payment_initiations set initiated_at='2026-12-15T00:00:00Z' where completed_event_id=$1", [proof.completed_event_id]), /preserved signed receipt/);
  await assert.rejects(db.query("update public.holiday_payment_initiations set purchase_amount_cents=25000 where completed_event_id=$1", [proof.completed_event_id]), /financial bindings/);
  const earlier = { ...proof, completed_event_id: `evt_${randomUUID()}`, initiated_at: "2026-12-16T04:59:59Z" };
  await record(earlier);
  await assert.rejects(db.query("update public.holiday_payment_initiations set initiated_at=$1,completed_event_id=$2 where campaign_id=$3 and checkout_session_id=$4", [first.initiated_at, first.completed_event_id, proof.campaign_id, proof.checkout_session_id]), /only to earlier/);
});

test("receipt and summary permissions remain restricted under broad Supabase defaults", async () => {
  for (const role of ["anon", "authenticated"]) {
    await exec(`set role ${role}`);
    try {
      await assert.rejects(db.query("select * from public.holiday_payment_initiation_events"), /permission denied/);
      await assert.rejects(record(input()), /permission denied/);
    } finally { await exec("reset role"); }
  }
  await exec("set role service_role");
  try {
    const proof = input();
    await record(proof);
    const rows = await receipts(proof);
    assert.equal(rows.length, 1);
    await assert.rejects(db.query("delete from public.holiday_payment_initiation_events where completed_event_id=$1", [proof.completed_event_id]), /permission denied/);
    await assert.rejects(db.query("update public.holiday_payment_initiation_events set purchase_amount_cents=25000 where completed_event_id=$1", [proof.completed_event_id]), /permission denied/);
    await assert.rejects(db.query("update public.holiday_payment_initiations set purchase_amount_cents=25000 where completed_event_id=$1", [proof.completed_event_id]), /permission denied/);
  } finally { await exec("reset role"); }
});

test(`${native ? "eight independent connections" : "duplicate callbacks"} retain one receipt for one event ID`, async () => {
  const proof = input();
  await Promise.all(clients.map((client) => record(proof, client)));
  assert.equal((await receipts(proof)).length, 1);
});

test(`${native ? "concurrent distinct events" : "out-of-order distinct events"} converge on the earliest signed time across the cutoff`, async () => {
  const proof = input({ initiated_at: "2026-12-16T05:00:10Z" });
  await record(proof);
  const all = clients.map((client, index) => {
    const signed = { ...proof, completed_event_id: `evt_${randomUUID()}`,
      initiated_at: new Date(cutoff + (index - 4) * 1000).toISOString() };
    return record(signed, client);
  });
  await Promise.all(all);
  const final = await summary(proof);
  assert.equal(final.initiated_at.getTime(), cutoff - 4000);
  assert.ok(final.initiated_at.getTime() < cutoff);
  assert.equal((await receipts(proof)).length, 9);
  assert.deepEqual(await record(proof), final);
});

test.after(close);
