import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

function load(path, dependencies) {
  const js = ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {}, console, require: name => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(js, context);
  return context.exports;
}
const forbidden = () => { throw new Error('Paused request must not create a side effect'); };
const response = { NextResponse: {
  json: (body, options) => ({ body, ...options }),
  redirect: (url, options) => ({ url, ...options }),
} };

test('paused quiz rejects even a stale browser submission before form parsing, storage or email', async () => {
  const quiz = load('../src/lib/reiki-quiz-results.ts', {});
  assert.equal(quiz.REIKI_QUIZ_PAUSED, true);
  const route = load('../src/app/api/quiz-result/route.ts', {
    'next/server': response,
    '@/lib/reiki-quiz-results': quiz,
    '@/lib/env': { integrations: { supabase: true, emailDelivery: true, mailchimp: true } },
    '@/lib/email': { sendReikiQuizResultEmail: forbidden },
    '@/lib/form-security': { getFormValue: forbidden, hasValidTurnstileToken: forbidden, isLikelyAutomatedSubmission: forbidden },
    '@/lib/mailchimp': { syncEmailSignupToMailchimp: forbidden },
    '@/lib/supabase/admin': { createSupabaseAdminClient: forbidden },
  });
  const result = await route.POST({ formData: forbidden });
  assert.equal(result.status, 503);
  assert.match(result.body.message, /paused/);
});

test('closed Reiki checkout redirects before offers or payment processing', async () => {
  const route = load('../src/app/api/checkout/route.ts', {
    'next/server': response,
    '@/lib/env': { env: { siteUrl: 'https://bethelightness.com' }, integrations: { stripe: true } },
    '@/lib/offers': { getOfferBySlug: forbidden, isPurchaseOptionAvailable: forbidden },
    '@/lib/reiki-rising-agreement': {},
  });
  const form = new FormData();
  form.set('slug', 'reiki-rising');
  form.set('optionKey', 'fall-2026-full');
  const result = await route.POST({ formData: async () => form });
  assert.equal(result.status, 303);
  assert.equal(result.url, 'https://bethelightness.com/reiki-rising');
});
