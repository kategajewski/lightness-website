import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
function load(file, dependencies, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, URLSearchParams, console, ...globals, require: name => { assert.ok(name in dependencies, name); return dependencies[name]; } };
  vm.runInNewContext(source, context);
  return context.exports;
}
const env = { siteUrl: 'https://bethelightness.com', stripeSecretKey: 'test-only' };
const offers = load('../src/lib/offers.ts', { '@/lib/env': { env, integrations: { stripe: true } }, '@/lib/site': { site: { links: {} } } });
const offer = offers.getOfferBySlug('sound-training');
async function checkout(optionKey) {
  let body;
  const route = load('../src/app/api/checkout/route.ts', {
    'next/server': { NextResponse: { redirect: (url, options) => ({ url, ...options }) } },
    '@/lib/env': { env, integrations: { stripe: true } },
    '@/lib/offers': offers,
    '@/lib/reiki-rising-agreement': { REIKI_RISING_AGREEMENT_VERSION: 'test' },
  }, { fetch: async (_url, options) => { body = options.body; return { ok: true, json: async () => ({ url: 'https://checkout.stripe.com/test' }) }; } });
  const form = new FormData(); form.set('slug', 'sound-training'); form.set('optionKey', optionKey);
  const response = await route.POST({ formData: async () => form });
  return { body, response };
}
test('full tuition is exactly $1,344 with no recurring billing', async () => {
  const { body } = await checkout('january-2027-full');
  assert.equal(body.get('mode'), 'payment');
  assert.equal(body.get('line_items[0][price_data][unit_amount]'), '134400');
  assert.equal(body.get('line_items[0][price]'), null);
  assert.equal(body.get('metadata[fixedInstallmentPlan]'), null);
});
test('plan bills $333 now and five $222.22 payments, total $1,444.10', async () => {
  const { body } = await checkout('january-2027-plan');
  assert.equal(body.get('mode'), 'subscription');
  const monthly = Number(body.get('line_items[0][price_data][unit_amount]'));
  const topUp = Number(body.get('line_items[1][price_data][unit_amount]'));
  assert.equal(monthly + topUp, 33300);
  assert.equal(monthly, 22222);
  assert.equal(monthly * 6 + topUp, 144410);
  assert.equal(body.get('line_items[1][price_data][recurring][interval]'), null);
  assert.equal(body.get('metadata[installmentCount]'), '6');
  assert.equal(body.get('subscription_data[metadata][fixedInstallmentPlan]'), 'true');
  assert.match(body.get('custom_text[submit][message]'), /does not renew/);
});
test('invalid or missing options never create a checkout', async () => {
  for (const key of ['', 'old-plan', 'january-2027-plan&amount=1']) {
    const { body, response } = await checkout(key);
    assert.equal(body, undefined); assert.match(response.url, /checkout\/sound-training$/);
  }
});
test('schedule ends after six monthly cycles and duplicate confirmation is safe', async () => {
  let update, configured = false;
  const schedule = { id: 'sched_test', status: 'active', current_phase: { start_date: 1790553600 }, metadata: {} };
  const stripe = {
    subscriptions: { retrieve: async () => ({ schedule: 'sched_test', items: { data: [{ price: { id: 'price_monthly' }, quantity: 1 }] } }) },
    subscriptionSchedules: {
      retrieve: async () => configured ? { ...schedule, metadata: update.metadata, end_behavior: update.end_behavior } : schedule,
      update: async (_id, value) => { assert.equal(configured, false); update = value; configured = true; },
    },
  };
  const lib = load('../src/lib/installment-schedules.ts', { 'server-only': {}, '@/lib/offers': offers });
  const session = { subscription: 'sub_test', metadata: { offerSlug: offer.slug, optionKey: 'january-2027-plan', fixedInstallmentPlan: 'true' } };
  assert.equal(await lib.configureInstallmentScheduleFromSession(session, stripe), 'configured');
  assert.equal(update.end_behavior, 'cancel');
  assert.equal(update.phases.length, 1);
  assert.equal(update.phases[0].duration.interval_count, 6);
  assert.equal(update.phases[0].items.length, 1);
  assert.equal(update.phases[0].items[0].price, 'price_monthly');
  assert.equal(update.proration_behavior, 'none');
  assert.equal(await lib.configureInstallmentScheduleFromSession(session, stripe), 'already_configured');
});
