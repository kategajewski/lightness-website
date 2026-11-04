// Stripe, Supabase and Mailchimp are mocked. No network calls or payments occur.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(PROJECT, 'package.json'));
const ts = require('typescript');
const EVENT_SLUG = 'reiki-share-november-5-2026';
const LINK_ID = 'plink_capacity_exact';
const LINK_URL = 'https://buy.stripe.com/capacity_exact';
const EVENT_CAPACITY_FIELDS = { paymentLinkId: LINK_ID, capacity: 7 };
const BASE_EVENT = {
  slug: EVENT_SLUG, name: 'Reiki Share', description: 'One Reiki Share ticket',
  amountCents: 2500, cancelPath: '/reiki-share', successPath: '/checkout/success',
  ...EVENT_CAPACITY_FIELDS,
};
const clone = value => structuredClone(value);
function emailConsentField(value) {
  return {
    key:'custom_eventupdates_435',type:'dropdown',optional:true,
    label:{type:'custom',custom:'Event updates by email'},
    dropdown:{options:[{label:'No',value:'choice_0'},{label:'Yes',value:'choice_1'}],default_value:null,...(value===undefined?{}:{value})},
  };
}

function paymentLink() {
  return {
    id: LINK_ID, object: 'payment_link', active: true, livemode: true, url: LINK_URL,
    metadata: { purchaseType: 'event', eventSlug: EVENT_SLUG, marketingConsentSource: 'stripe_payment_link_v1' },
    restrictions: { completed_sessions: { count: 0, limit: 7 } },
    after_completion: { type: 'redirect', redirect: { url: `https://bethelightness.com/checkout/success?type=event&eventSlug=${EVENT_SLUG}&session_id={CHECKOUT_SESSION_ID}` } },
    custom_fields: [emailConsentField()],
    line_items: { object: 'list', has_more: false, data: [
      { quantity: 1, adjustable_quantity: { enabled: false }, price: { id: 'price_reiki_share', type: 'one_time', unit_amount: 2500, currency: 'usd', recurring: null } },
    ] },
  };
}

function harness({ link=paymentLink(), stripeFailure=false, lineItemsFailure=false, noStripeClient=false, eventOverrides={}, uncapped=false, webhookType='checkout.session.completed', invalidSignature=false, legacySessions=[], legacyLookupResult, expireThrows=false, expireResult, rereadResult, limitUpdateThrows=false, unverifiedLimitUpdate=false }={}) {
  const calls = [], emails = [], writes = [], confirmations = [], invoiceConfirmations = [];
  const legacyById=new Map(legacySessions.map(session=>[session.id,session]));
  const legacyReads=new Map();
  const event = { ...BASE_EVENT, ...eventOverrides };
  if (uncapped) { delete event.paymentLinkId; delete event.capacity; }
  const stripe = { paymentLinks: {
    retrieve: async (id, options) => {
      calls.push({kind:'link-read',id,options});
      if (stripeFailure) throw new Error('Mock Stripe unavailable');
      return clone(link);
    },
    listLineItems: async id => {
      calls.push({kind:'line-items-read',id});
      if (stripeFailure || lineItemsFailure) throw new Error('Mock Stripe unavailable');
      return clone(link.line_items);
    },
    update: async(id,input)=>{
      calls.push({kind:'link-update',id,input});
      if(limitUpdateThrows) throw new Error('Mock Stripe capacity update unavailable');
      if(unverifiedLimitUpdate) return clone(link);
      return {...clone(link),...(input.active===undefined?{}:{active:input.active}),restrictions:{completed_sessions:{...link.restrictions.completed_sessions,...input.restrictions?.completed_sessions}}};
    },
  }, checkout:{sessions:{
    retrieve:async id=>{
      calls.push({kind:'legacy-read',id});
      const reads=legacyReads.get(id)||0;legacyReads.set(id,reads+1);
      const value=reads>0&&rereadResult?rereadResult:(legacyLookupResult||legacyById.get(id));
      assert.ok(value,'Unexpected legacy session lookup');return clone(value);
    },
    expire:async id=>{
      calls.push({kind:'legacy-expire',id});
      if(expireThrows) throw new Error('Mock Stripe expiration raced or failed');
      return clone(expireResult||{...legacyById.get(id),status:'expired'});
    },
  }}, webhooks:{constructEvent:(payload,signature,secret)=>{
    calls.push({kind:'signature-check',payload,signature,secret});
    if(invalidSignature) throw new Error('Mock invalid signature');
    return {type:webhookType,data:{object:{id:'cs_mock_paid'}}};
  }} };
  const fetchMock = async (url, options={}) => {
    const u = new URL(url);
    const method = options.method || 'GET';
    calls.push({kind:'fetch',url:u.href,method,body:options.body});
    if (stripeFailure) throw new Error('Mock Stripe unavailable');
    if (u.pathname.includes('/payment_links/')) {
      const value = u.pathname.endsWith('/line_items') ? link.line_items : link;
      return { ok:true, status:200, json:async()=>clone(value), text:async()=>JSON.stringify(value) };
    }
    if (u.pathname==='/v1/checkout/sessions' && method==='POST') {
      return { ok:true, status:200, json:async()=>({id:'cs_mock_uncapped',url:'https://checkout.stripe.com/c/pay/cs_mock_uncapped'}), text:async()=>'' };
    }
    throw new Error(`Unexpected network request: ${method} ${u.href}`);
  };
  const deps = {
    'server-only': {},
    'next/server': { NextResponse: { redirect:(url, options)=>({url:String(url),...options}), json:(body,options)=>({body,status:200,...options}) } },
    '@/lib/env': { env: {siteUrl:'https://bethelightness.com',stripeSecretKey:'sk_live_mock',stripePublishableKey:'pk_live_mock',stripeWebhookSecret:'whsec_mock'},integrations:{stripe:true,supabase:true,mailchimp:true} },
    '@/lib/events': { getEventBySlug:slug=>slug===event.slug?event:undefined },
    '@/lib/stripe/server': {getStripe:async()=>noStripeClient?null:stripe},
    '@/lib/supabase/admin': {createSupabaseAdminClient:()=>({from:table=>({upsert:async(value,options)=>{writes.push({table,value,options});return {error:null};}})})},
    '@/lib/mailchimp': {syncEmailSignupToMailchimp:async input=>{emails.push(input);return {skipped:false};}},
    '@/lib/checkout-confirmation': {processCheckoutSessionConfirmation:async(sessionId,source)=>{confirmations.push({sessionId,source});return {customerEmail:'sent',ownerEmail:'sent'};}},
    '@/lib/invoice-confirmation': {processInvoiceConfirmation:async invoiceId=>{invoiceConfirmations.push(invoiceId);}},
  };
  const cache = new Map();
  function load(relative) {
    const absolute = path.resolve(PROJECT,relative);
    if (cache.has(absolute)) return cache.get(absolute);
    const exports = {};
    cache.set(absolute,exports);
    const js = ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
    const moduleRequire = name => {
      if (Object.hasOwn(deps,name)) return deps[name];
      if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
      if (name.startsWith('.')) return load(`${path.relative(PROJECT,path.resolve(path.dirname(absolute),name))}.ts`);
      throw new Error(`Unexpected dependency: ${name}`);
    };
    vm.runInNewContext(js,{exports,require:moduleRequire,URL,URLSearchParams,Date,fetch:fetchMock,console:{error:()=>{},warn:()=>{},log:()=>{}}},{filename:absolute});
    return exports;
  }
  async function checkout(extraForm={}) {
    const form = new FormData();
    form.set('eventSlug',event.slug);
    for (const [key,value] of Object.entries(extraForm)) form.set(key,value);
    const route = load('src/app/api/checkout/event/route.ts');
    return route.POST({formData:async()=>form});
  }
  async function record(session) {
    return load('src/lib/event-attendance.ts').recordEventAttendanceFromSession(session);
  }
  async function webhook() {
    return load('src/app/api/stripe/webhook/route.ts').POST({headers:{get:name=>name==='stripe-signature'?'sig_mock':null},text:async()=>'raw-mock-payload'});
  }
  return {checkout,record,webhook,calls,emails,writes,event,confirmations,invoiceConfirmations};
}
function assertNoUncappedSession(h) {
  assert.equal(h.calls.some(call=>call.kind==='fetch' && call.method==='POST' && new URL(call.url).pathname==='/v1/checkout/sessions'),false,'Capacity event must never create an uncapped Checkout Session');
}
function assertBlocked(result) {
  assert.equal(result.status,303);
  assert.notEqual(new URL(result.url).origin,'https://buy.stripe.com');
  assert.equal(new URL(result.url).origin,'https://bethelightness.com');
  assert.equal(new URL(result.url).pathname,'/reiki-share');
  assert.ok(new URL(result.url).searchParams.has('checkoutError'));
}

test('valid dedicated cap redirects to its Stripe URL without creating a fresh session',async()=>{
  const h=harness();
  const result=await h.checkout({quantity:'99',paymentLinkId:'plink_attacker',marketingConsent:'yes'});
  assert.equal(result.status,303);
  assert.equal(result.url,LINK_URL);
  assertNoUncappedSession(h);
  assert.ok(h.calls.some(call=>call.kind==='link-read'||(call.kind==='fetch'&&call.url.includes(`/payment_links/${LINK_ID}`))),'The fixed configured link must be retrieved from Stripe');
});

test('one remaining seat is available but the seventh completion closes registration',async()=>{
  for(const count of [6,7,8]) {
    const link=paymentLink();link.restrictions.completed_sessions.count=count;
    const h=harness({link});const result=await h.checkout();
    if(count===6) assert.equal(result.url,LINK_URL);else assertBlocked(result);
    assertNoUncappedSession(h);
  }
});

const unsafeLinks = [
  ['deactivated',link=>{link.active=false;}],
  ['missing native cap',link=>{delete link.restrictions;}],
  ['cap allows eight',link=>{link.restrictions.completed_sessions.limit=8;}],
  ['wrong event metadata',link=>{link.metadata.eventSlug='reiki-share-july-1-2026';}],
  ['wrong purchase type',link=>{link.metadata.purchaseType='gift_certificate';}],
  ['two tickets per completion',link=>{link.line_items.data[0].quantity=2;}],
  ['quantity adjustable',link=>{link.line_items.data[0].adjustable_quantity.enabled=true;}],
  ['wrong ticket amount',link=>{link.line_items.data[0].price.unit_amount=1;}],
  ['wrong currency',link=>{link.line_items.data[0].price.currency='eur';}],
  ['recurring charge',link=>{link.line_items.data[0].price.type='recurring';link.line_items.data[0].price.recurring={interval:'month'};}],
  ['extra product',link=>{link.line_items.data.push(clone(link.line_items.data[0]));}],
  ['test link with live keys',link=>{link.livemode=false;}],
  ['missing completion count',link=>{delete link.restrictions.completed_sessions.count;}],
  ['negative completion count',link=>{link.restrictions.completed_sessions.count=-1;}],
  ['fractional completion count',link=>{link.restrictions.completed_sessions.count=0.5;}],
  ['unexpected consent source',link=>{link.metadata.marketingConsentSource='event_checkout_v1';}],
  ['optional additional items',link=>{link.optional_items=[{price:'price_extra',quantity:1}];}],
  ['unread additional line items',link=>{link.line_items.has_more=true;}],
  ['untrusted checkout URL',link=>{link.url='https://buy.stripe.com.evil.example/capacity';}],
  ['missing email-consent field',link=>{link.custom_fields=[];}],
  ['required email-consent field',link=>{link.custom_fields[0].optional=false;}],
  ['wrong email-consent field type',link=>{link.custom_fields[0].type='text';}],
  ['unrelated custom-field label',link=>{link.custom_fields[0].label.custom='Other question';}],
  ['missing No consent option',link=>{link.custom_fields[0].dropdown.options=link.custom_fields[0].dropdown.options.filter(option=>option.label!=='No');}],
  ['missing Yes consent option',link=>{link.custom_fields[0].dropdown.options=link.custom_fields[0].dropdown.options.filter(option=>option.label!=='Yes');}],
  ['default Yes consent',link=>{link.custom_fields[0].dropdown.default_value='choice_1';}],
];
for(const [description,mutate] of unsafeLinks) test(`fails closed for ${description}`,async()=>{
  const link=paymentLink();mutate(link);const h=harness({link});
  assertBlocked(await h.checkout());assertNoUncappedSession(h);
});
test('Stripe retrieval failure never falls back to uncapped checkout',async()=>{
  const h=harness({stripeFailure:true});assertBlocked(await h.checkout());assertNoUncappedSession(h);
});
test('Stripe line-item lookup failure never falls back to uncapped checkout',async()=>{
  const h=harness({lineItemsFailure:true});assertBlocked(await h.checkout());assertNoUncappedSession(h);
});
test('missing Stripe client fails closed',async()=>{
  const h=harness({noStripeClient:true});assertBlocked(await h.checkout());assertNoUncappedSession(h);
});
test('capacity event missing its configured Payment Link fails closed before Stripe',async()=>{
  const h=harness({eventOverrides:{paymentLinkId:undefined}});assertBlocked(await h.checkout());assertNoUncappedSession(h);assert.equal(h.calls.length,0);
});
test('invalid configured capacity fails closed rather than creating uncapped checkout',async()=>{
  for(const capacity of [undefined,0,-1]) {
    const h=harness({eventOverrides:{capacity}});assertBlocked(await h.checkout());assertNoUncappedSession(h);
  }
});
test('optional consent defaults to No or stays unanswered without blocking checkout',async()=>{
  for(const defaultValue of [null,undefined,'choice_0']) {
    const link=paymentLink();link.custom_fields[0].dropdown.default_value=defaultValue;
    const h=harness({link});assert.equal((await h.checkout()).url,LINK_URL);assertNoUncappedSession(h);
  }
});
test('closed capacity event never reaches Stripe',async()=>{
  const h=harness({eventOverrides:{registrationClosed:true}});assertBlocked(await h.checkout());assert.equal(h.calls.length,0);
});
test('other events retain ordinary fixed-quantity checkout and per-request consent',async()=>{
  const h=harness({uncapped:true,eventOverrides:{slug:'other-event',name:'Other Event',cancelPath:'/other-event'}});
  const result=await h.checkout({quantity:'99',marketingConsent:'yes'});
  assert.equal(result.url,'https://checkout.stripe.com/c/pay/cs_mock_uncapped');
  const posts=h.calls.filter(call=>call.kind==='fetch'&&call.method==='POST');assert.equal(posts.length,1);
  assert.equal(posts[0].body.get('line_items[0][quantity]'),'1');
  assert.equal(posts[0].body.get('metadata[marketingConsent]'),'yes');
  assert.equal(posts[0].body.get('metadata[marketingConsentSource]'),'event_checkout_v1');
});

function session(metadata={},customFields) {
  return {id:'cs_mock_paid',status:'complete',payment_status:'paid',customer_details:{name:'Test Client',email:'client@example.test'},amount_total:2500,currency:'usd',created:1793700000,payment_intent:'pi_mock',metadata:{purchaseType:'event',eventSlug:EVENT_SLUG,...metadata},...(customFields===undefined?{}:{custom_fields:customFields})};
}
const consentCases = [
  ['native explicit Yes uses its opaque option value',{marketingConsentSource:'stripe_payment_link_v1',marketingConsent:'no'},[emailConsentField('choice_1')],1],
  ['native explicit No overrides yes metadata',{marketingConsentSource:'stripe_payment_link_v1',marketingConsent:'yes'},[emailConsentField('choice_0')],0],
  ['native unanswered field overrides yes metadata',{marketingConsentSource:'stripe_payment_link_v1',marketingConsent:'yes'},[emailConsentField(null)],0],
  ['native missing field overrides yes metadata',{marketingConsentSource:'stripe_payment_link_v1',marketingConsent:'yes'},undefined,0],
  ['native literal yes is not a valid opaque option',{marketingConsentSource:'stripe_payment_link_v1'},[emailConsentField('yes')],0],
  ['native unrelated field never grants consent',{marketingConsentSource:'stripe_payment_link_v1'},[{...emailConsentField('choice_1'),label:{type:'custom',custom:'Unrelated question'}}],0],
  ['native Yes default never grants consent',{marketingConsentSource:'stripe_payment_link_v1'},[{...emailConsentField('choice_1'),dropdown:{...emailConsentField('choice_1').dropdown,default_value:'choice_1'}}],0],
  ['native required field never grants consent',{marketingConsentSource:'stripe_payment_link_v1'},[{...emailConsentField('choice_1'),optional:false}],0],
  ['legacy yes is preserved',{marketingConsentSource:'event_checkout_v1',marketingConsent:'yes'},undefined,1],
  ['legacy no does not become consent from another source',{marketingConsentSource:'event_checkout_v1',marketingConsent:'no'},[emailConsentField('choice_1')],0],
  ['missing source with no consent does not subscribe',{},undefined,0],
];
for(const [description,metadata,customFields,expected] of consentCases) test(`attendance marketing consent: ${description}`,async()=>{
  const h=harness();await h.record(session(metadata,customFields));
  assert.equal(h.writes.length,1,'Ticket recording is independent of marketing consent');
  assert.equal(h.emails.length,expected);
  if(expected) assert.equal(h.emails[0].email,'client@example.test');
});

for(const type of ['checkout.session.completed','checkout.session.async_payment_succeeded']) test(`verified ${type} processes purchase confirmation`,async()=>{
  const h=harness({webhookType:type});const result=await h.webhook();
  assert.equal(result.status,200);assert.equal(result.body.received,true);
  assert.equal(h.confirmations.length,1);assert.equal(h.confirmations[0].sessionId,'cs_mock_paid');assert.equal(h.confirmations[0].source,'webhook');
  const verification=h.calls.find(call=>call.kind==='signature-check');
  assert.equal(verification.payload,'raw-mock-payload');assert.equal(verification.signature,'sig_mock');assert.equal(verification.secret,'whsec_mock');
  assert.equal(h.invoiceConfirmations.length,0);
});
test('async payment failure does not run purchase confirmation or send emails',async()=>{
  const h=harness({webhookType:'checkout.session.async_payment_failed'});const result=await h.webhook();
  assert.equal(result.status,200);assert.equal(result.body.received,true);
  assert.equal(h.confirmations.length,0);assert.equal(h.invoiceConfirmations.length,0);assert.equal(h.emails.length,0);assert.equal(h.writes.length,0);
});
test('invalid webhook signature rejects before purchase confirmation or other side effects',async()=>{
  const h=harness({webhookType:'checkout.session.async_payment_succeeded',invalidSignature:true});const result=await h.webhook();
  assert.equal(result.status,400);assert.match(result.body.error,/Invalid Stripe signature/);
  assert.equal(h.confirmations.length,0);assert.equal(h.invoiceConfirmations.length,0);assert.equal(h.emails.length,0);assert.equal(h.writes.length,0);
});

const LEGACY_ID='cs_legacy_capacity';
function legacySession(overrides={}) {
  return {id:LEGACY_ID,livemode:true,mode:'payment',amount_total:2500,currency:'usd',metadata:{purchaseType:'event',eventSlug:EVENT_SLUG},payment_link:null,status:'open',payment_status:'unpaid',...overrides};
}
function legacyHarness(overrides={}) {
  return harness({legacySessions:[legacySession()],eventOverrides:{legacyCheckoutSessionIds:[LEGACY_ID]},...overrides});
}
test('valid open unpaid legacy checkout is expired before a new capped redirect',async()=>{
  const h=legacyHarness();assert.equal((await h.checkout()).url,LINK_URL);assertNoUncappedSession(h);
  assert.equal(h.calls.filter(call=>call.kind==='legacy-expire').length,1);
  const expiredIndex=h.calls.findIndex(call=>call.kind==='legacy-expire');
  assert.ok(expiredIndex<h.calls.findIndex(call=>call.kind==='line-items-read'));
  assert.equal(h.calls.some(call=>call.kind==='link-update'),false);
});
test('already expired legacy checkout needs no expiration or capacity reduction',async()=>{
  const h=legacyHarness({legacySessions:[legacySession({status:'expired'})]});
  assert.equal((await h.checkout()).url,LINK_URL);assertNoUncappedSession(h);
  assert.equal(h.calls.some(call=>call.kind==='legacy-expire'||call.kind==='link-update'),false);
});
test('completed legacy checkout reserves one seat and reduces the native cap to six even when unpaid',async()=>{
  for(const payment_status of ['paid','unpaid']) {
    const h=legacyHarness({legacySessions:[legacySession({status:'complete',payment_status})]});
    assert.equal((await h.checkout()).url,LINK_URL);assertNoUncappedSession(h);
    assert.equal(h.calls.some(call=>call.kind==='legacy-expire'),false);
    const updates=h.calls.filter(call=>call.kind==='link-update');assert.equal(updates.length,1);
    assert.equal(updates[0].input.restrictions.completed_sessions.limit,6);
  }
});
test('expiration race rereads a completed legacy payment and reduces the cap',async()=>{
  const h=legacyHarness({expireThrows:true,rereadResult:legacySession({status:'complete',payment_status:'paid'})});
  assert.equal((await h.checkout()).url,LINK_URL);assertNoUncappedSession(h);
  assert.equal(h.calls.filter(call=>call.kind==='legacy-read').length,2);
  assert.equal(h.calls.filter(call=>call.kind==='legacy-expire').length,1);
  assert.equal(h.calls.find(call=>call.kind==='link-update').input.restrictions.completed_sessions.limit,6);
});
test('legacy checkout remaining open after expiration failure blocks all new checkout',async()=>{
  for(const expireThrows of [true,false]) {
    const h=legacyHarness({expireThrows,expireResult:legacySession()});
    assertBlocked(await h.checkout());assertNoUncappedSession(h);
    assert.equal(h.calls.some(call=>call.kind==='line-items-read'||call.kind==='link-update'),false);
  }
});
const invalidLegacyCases=[
  ['identity',row=>({...row,id:'cs_wrong'})],
  ['mode',row=>({...row,mode:'subscription'})],
  ['live mode',row=>({...row,livemode:false})],
  ['amount',row=>({...row,amount_total:1})],
  ['currency',row=>({...row,currency:'eur'})],
  ['event',row=>({...row,metadata:{...row.metadata,eventSlug:'other-event'}})],
  ['purchase type',row=>({...row,metadata:{...row.metadata,purchaseType:'gift_certificate'}})],
  ['existing Payment Link',row=>({...row,payment_link:'plink_other'})],
  ['paid open checkout',row=>({...row,payment_status:'paid'})],
];
for(const [label,mutate] of invalidLegacyCases) test(`invalid legacy ${label} never expires a session or allows checkout`,async()=>{
  const invalid=mutate(legacySession());
  const h=legacyHarness({legacyLookupResult:invalid});
  assertBlocked(await h.checkout());assertNoUncappedSession(h);
  assert.equal(h.calls.some(call=>call.kind==='legacy-expire'||call.kind==='link-update'),false);
});
test('failed or unverified native-cap reduction blocks new checkout',async()=>{
  for(const flags of [{limitUpdateThrows:true},{unverifiedLimitUpdate:true}]) {
    const h=legacyHarness({legacySessions:[legacySession({status:'complete',payment_status:'paid'})],...flags});
    assertBlocked(await h.checkout());assertNoUncappedSession(h);
    assert.equal(h.calls.filter(call=>call.kind==='link-update').length,1);
    assert.equal(h.calls.some(call=>call.kind==='line-items-read'),false);
  }
});
