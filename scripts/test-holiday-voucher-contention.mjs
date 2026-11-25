import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";

// Temporary native PostgreSQL test dependencies can be installed outside the app.
const require = createRequire(process.env.HOLIDAY_SQL_TEST_MODULE_ROOT
  ? path.join(process.env.HOLIDAY_SQL_TEST_MODULE_ROOT, "package.json") : import.meta.url);
const { default: EmbeddedPostgres } = await import(require.resolve("embedded-postgres"));
const server = net.createServer();
await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
const port = server.address().port;
await new Promise((resolve) => server.close(resolve));
const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "lightness-voucher-contention-"));
const pg = new EmbeddedPostgres({
  databaseDir: path.join(tempDirectory, "db"), port, user: "postgres",
  password: randomBytes(20).toString("hex"), persistent: false,
  postgresFlags: ["-c", "listen_addresses=127.0.0.1", "-c", `unix_socket_directories=${tempDirectory}`],
  onLog: () => {}, onError: () => {},
});
await pg.initialise();
await pg.start();
const clients = await Promise.all(Array.from({ length: 8 }, async () => {
  const client = pg.getPgClient("postgres", "127.0.0.1");
  await client.connect();
  await client.query("set statement_timeout='10s'; set lock_timeout='8s'");
  return client;
}));
await clients[0].query("create role anon; create role authenticated; create role service_role bypassrls");
await clients[0].query("alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role");
await clients[0].query(await readFile(new URL("../supabase/migrations/202611250001_holiday_promotional_vouchers.sql", import.meta.url), "utf8"));

function issueInput(overrides = {}) {
  const suffix = randomUUID();
  return {
    campaign_id: "a-little-light-2026", checkout_session_id: `cs_test_${suffix}`,
    payment_intent_id: `pi_${suffix}`, paid_certificate_code: "LIGHT-1234-567890",
    code: `HOLIDAY-${randomBytes(12).toString("hex").toUpperCase()}`,
    purchaser_email: "synthetic@example.test", purchaser_name: "Synthetic Purchaser",
    purchased_amount_cents: 10000, face_value_cents: 1500, stripe_livemode: false,
    issued_at: new Date().toISOString(), valid_from: new Date(Date.now() - 3600000).toISOString(),
    expires_at: new Date(Date.now() + 3600000).toISOString(), ...overrides,
  };
}
async function issue(client = clients[0], input = issueInput()) {
  return (await client.query("select * from public.issue_holiday_voucher($1::jsonb)", [JSON.stringify(input)])).rows[0];
}
function redemptionInput(voucher, overrides = {}) {
  return { requestId: randomUUID(), voucherId: voucher.id, amountCents: 500, serviceId: "private-reiki",
    serviceAt: new Date().toISOString(), bookingReference: randomUUID(), redeemedBy: "admin@example.test",
    recipientName: "Synthetic Recipient", hasOtherPromotion: false, allowedServices: ["private-reiki"],
    allowPartial: true, maxVouchersPerBooking: null, serviceMustOccurDuringValidity: false, ...overrides };
}
async function redeem(client, input) {
  return (await client.query(`select * from public.redeem_holiday_voucher(
    $1::uuid,$2::uuid,$3::integer,$4::text,$5::timestamptz,$6::text,$7::text,$8::text,
    $9::boolean,$10::text[],$11::boolean,$12::integer,$13::boolean)`, Object.values(input))).rows[0];
}
async function current(voucher) {
  return (await clients[0].query("select * from public.holiday_vouchers where id=$1", [voucher.id])).rows[0];
}
async function refund(client, voucher, amount) {
  return (await client.query("select * from public.adjust_holiday_vouchers_for_refund($1,$2,$3,$4,$5,$6)",
    [`evt_${randomUUID()}`, voucher.payment_intent_id, false, amount, voucher.purchased_amount_cents, voucher.campaign_id])).rows[0];
}
async function restore(client, redemptionId, requestId = randomUUID()) {
  return (await client.query("select * from public.restore_holiday_voucher_redemption($1,$2,$3,$4,$5)",
    [requestId, redemptionId, true, "Synthetic cancellation meets existing policy", "admin@example.test"])).rows[0];
}

test("independent PostgreSQL connections converge simultaneous issuance on one voucher/outbox", async () => {
  const input = issueInput();
  const results = await Promise.all(clients.map((client) => issue(client, { ...input,
    code: `HOLIDAY-${randomBytes(12).toString("hex").toUpperCase()}` })));
  assert.equal(new Set(results.map((voucher) => voucher.id)).size, 1);
  assert.equal(new Set(results.map((voucher) => voucher.code)).size, 1);
  const rows = (await clients[0].query("select * from public.holiday_voucher_email_outbox where voucher_id=$1", [results[0].id])).rows;
  assert.equal(rows.length, 1);
});

test("simultaneous redemptions cannot overspend a voucher balance", async () => {
  const voucher = await issue();
  const results = await Promise.allSettled(clients.map((client) => redeem(client, redemptionInput(voucher, { amountCents: 1000 }))));
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal((await current(voucher)).balance_cents, 500);
  const count = (await clients[0].query("select count(*)::integer as n from public.holiday_voucher_redemptions where voucher_id=$1", [voucher.id])).rows[0].n;
  assert.equal(count, 1);
});

test("simultaneous identical redemption requests deduct credit once", async () => {
  const voucher = await issue();
  const input = redemptionInput(voucher);
  await Promise.all(clients.map((client) => redeem(client, input)));
  assert.equal((await current(voucher)).balance_cents, 1000);
});

test("email delivery claims allow only one sender across independent connections", async () => {
  const voucher = await issue();
  const results = await Promise.all(clients.map(async (client) =>
    (await client.query("select public.claim_holiday_voucher_email($1) as claim", [voucher.id])).rows[0].claim));
  assert.equal(results.filter((result) => result.claimed).length, 1);
  assert.equal(results.filter((result) => result.reason === "busy").length, clients.length - 1);
});

test("out-of-order concurrent refund events preserve the largest cumulative refund", async () => {
  const voucher = await issue();
  await Promise.all([refund(clients[0], voucher, 10000), refund(clients[1], voucher, 5000)]);
  const final = await current(voucher);
  assert.equal(final.amount_refunded_cents, 10000);
  assert.equal(final.entitlement_cents, 0);
  assert.equal(final.balance_cents, 0);
  assert.equal(final.status, "voided");
});

test("concurrent cancellation requests restore each redemption once", async () => {
  const voucher = await issue();
  await redeem(clients[0], redemptionInput(voucher));
  const id = (await clients[0].query("select id from public.holiday_voucher_redemptions where voucher_id=$1", [voucher.id])).rows[0].id;
  await Promise.all(clients.map((client) => restore(client, id)));
  assert.equal((await current(voucher)).balance_cents, 1500);
  const count = (await clients[0].query("select count(*)::integer as n from public.holiday_voucher_redemption_reversals where redemption_id=$1", [id])).rows[0].n;
  assert.equal(count, 1);
});

test("racing refund and cancellation cannot restore more than current entitlement", async () => {
  const voucher = await issue(clients[0], issueInput({ purchased_amount_cents: 50000, face_value_cents: 10000 }));
  await redeem(clients[0], redemptionInput(voucher, { amountCents: 7500 }));
  const id = (await clients[0].query("select id from public.holiday_voucher_redemptions where voucher_id=$1", [voucher.id])).rows[0].id;
  await Promise.all([refund(clients[0], voucher, 25000), restore(clients[1], id)]);
  const final = await current(voucher);
  assert.equal(final.entitlement_cents, 5000);
  assert.equal(final.balance_cents, 5000);
  assert.equal(final.refund_review_required, false);
});

test("booking-level voucher limits serialize distinct voucher rows when a policy limit exists", async () => {
  const first = await issue();
  const second = await issue();
  const bookingReference = randomUUID();
  const results = await Promise.allSettled([
    redeem(clients[0], redemptionInput(first, { bookingReference, maxVouchersPerBooking: 1 })),
    redeem(clients[1], redemptionInput(second, { bookingReference, maxVouchersPerBooking: 1 })),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
});

test.after(async () => {
  await Promise.all(clients.map((client) => client.end()));
  await pg.stop();
  await rm(tempDirectory, { recursive: true, force: true });
});
