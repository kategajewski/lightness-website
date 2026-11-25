# A Little Light Goes a Long Way

Prepared November 24, 2026 for the existing Lightness Platform.

## Release status

- Implementation is prepared in `/private/tmp/lightness-holiday-2026`, based on refreshed production commit `c22cb042f7773731c3877bbeb23c4d12ca6dcecc`. Canonical implementation and checkout hardening are committed through `cbbb6f4`. The Desktop checkout became dataless through local file offloading; the hydrated temporary checkout is the authoritative release source.
- Git HTTPS fetch and Vercel production metadata independently confirmed that baseline. The matching READY deployment is `dpl_EJVWtfGwv4fqx7ZGDJBmYXNWvAvZ`.
- No public production promotion or campaign activation has been completed. Private test deployments use the production environment with per-deployment test overrides and no assigned aliases. The live domain remains on the original `c22cb04` deployment. Do not release the older dirty Desktop checkout over the current site.
- After Kate signed into Supabase, the final migration was installed through the existing Website project. Service-role access returned HTTP 200 and anonymous access was rejected with HTTP 401. The ledger now contains five isolated test purchases.
- The available local Stripe credential is in test mode. Production Stripe and email secrets are marked sensitive in Vercel and their values cannot be retrieved through the API. Their presence does not establish that the local integration uses the production configuration.
- Browser sandbox purchases of all five tiers were completed. The Stripe API confirmed each session was complete and paid for its exact USD face value with `livemode=false`. No real money was charged.
- Five genuine Stripe completed-payment events were replayed into the protected staged webhook using a fresh staged signing secret. All returned HTTP 200. The existing paid certificate email markers were recorded, and five separate promotional email outboxes have provider references with one attempt each. Replaying the $50 event twice more created no additional voucher or delivery attempt.
- Kate explicitly confirmed that all ten test emails arrived: the five paid gift certificates and five separate promotional vouchers. The Resend status API returned HTTP 401 with the existing sending credential; mailbox delivery was therefore verified by the recipient rather than by provider status retrieval.
- The existing LIVE Stripe webhook endpoint `we_1TcW9zElTVNK9O7pJhAuaXto` was updated and verified with four enabled events: `checkout.session.completed`, `invoice.paid`, `checkout.session.async_payment_succeeded` and `charge.refunded`. Its destination URL, API version and signing secret were unchanged.
- An existing live $140 inline-price checkout produced a `cs_live_` session without submitting payment. The older $50 external-price path redirected back to the internal checkout page. Gift checkout now uses inline full face values for every listed amount so it does not depend on the failing external mapping.

Private test deployments:

- `https://lightness-website-pozy0qpql-bethelightness.vercel.app` (`dpl_ErdHfEmi7rjPYGaStm8KQ2HQPKQ3`) performed the real sandbox-event fulfillment and duplicate checks.
- `https://lightness-website-8fjfelov4-bethelightness.vercel.app` (`dpl_B9mFwj5kbSWYoMnV8e1ewWNEuJXZ`) includes the finalized checkout hardening and an artifact-only delivery-status diagnostic. It is READY, has no aliases and leaves the live domain unchanged.
- Both artifacts narrow owner notifications to `kate@bethelightness.com`, set `CONTACT_FORWARD_TO` to that same approved inbox, omit cron configuration and disable intake automation. They use test Stripe keys at build and runtime. These are test-only changes outside the canonical source.
- The diagnostic is Vercel protected and requires an independent random per-deployment token. It reads only the five known Kate test vouchers and attempts provider status retrieval. It is absent from the canonical release source and sends no email.
- Never promote either test deployment to the live domain. A live release must be a fresh build from canonical source with ordinary production settings and no diagnostic route.

## Approved campaign rules

Campaign: **A Little Light Goes a Long Way**. Tagline: **Give a little. Get a little.**

Purchases qualify from the configured launch instant through December 15, 2026 at 11:59 PM Eastern. The exclusive end instant is `2026-12-16T05:00:00.000Z`.

Payment must be initiated by the deadline. Later bank settlement is allowed when Stripe's signed `checkout.session.completed` event proves timely payment initiation. Merely opening a checkout does not count. No certificate or complimentary voucher is issued while payment remains pending; issuance requires successful full payment.

| Full transaction value | One complimentary voucher |
| --- | --- |
| $50 through $99.99 | $5 |
| $100 through $149.99 | $15 |
| $150 through $249.99 | $25 |
| $250 through $499.99 | $50 |
| $500 or more | $100 |

- Custom dollar amounts qualify at the highest threshold reached. The existing $140 option remains available and receives $15.
- Several certificates can be purchased together. The current online form accepts a quantity of certificates with the same individual value. One bonus is based on their combined transaction total, with a maximum $100 bonus per transaction.
- Purchasers pay every certificate's full face value. Each paid certificate has its own code and PDF. The complimentary voucher has a different code and arrives in a separate email to the purchaser.
- Processor and delivery capacity limits are a $0.50 minimum transaction, a $999,999.99 maximum transaction and 100 certificates per online order. A certificate may be worth less than $0.50 when the combined transaction reaches the minimum.
- Complimentary credit is valid January 1 through March 31, 2027. The inclusive Eastern dates correspond to `2027-01-01T05:00:00.000Z` through the exclusive expiration `2027-04-01T04:00:00.000Z`, including the March daylight saving change.
- Partial redemption is allowed. Multiple holiday vouchers may be combined with each other and with paid gift certificates. Other promotions cannot be combined with complimentary credit.
- The voucher is transferable. Redemption must occur during the validity period; the eligible appointment itself may take place later.
- Eligible private services are Rest & Receive, Return to Self: Sacred Reset, Gentle Energy Support for Children, The Inner Journey, Private Sound Immersion and Personalized Guidance.
- A full purchase refund voids the complimentary voucher. A partial refund recalculates its entitlement using the qualifying amount retained. Previously used promotional credit above the revised entitlement is held for review. Paid gift certificate values and terms are managed through the existing process.
- Canceled-appointment credit is restored only when the existing cancellation policy permits it. Restoration does not extend the original March 31 expiration.

## Implementation

`src/lib/holiday-gift-campaign.ts` owns the campaign identity, approved rules, Eastern boundaries and qualification. Signed completed-checkout event time establishes initiation, while current Stripe payment state determines whether anything can be issued. A bank payment initiated before the deadline may settle later. A browser timestamp, session creation time or retry signature time cannot establish eligibility. The payment intent is also retrieved and must confirm the full succeeded USD payment in the same mode.

`src/lib/holiday-payment-initiation-store.ts` durably records initiation evidence before the webhook is acknowledged, including unpaid completions and negative proofs after the deadline. Financial identity is immutable. Separate append-only receipts preserve distinct Stripe Event IDs, and the canonical proof points to the earliest authenticated completion for the same transaction. Async success arriving before its proof returns a retryable error; a later completed event can reconcile a session that has already become paid. An initiation storage failure does not block the original paid certificate confirmation; it keeps complimentary fulfillment retryable. The current paid state always requires an original certificate email sent marker before a voucher is issued, even when the event snapshot still says unpaid. Voucher `issued_at` records actual issuance time separately from initiation.

`src/lib/holiday-gift-order.ts` validates decimal dollar amounts and quantities using integer cents. The checkout route records the unit amount, quantity and transaction total in server-authored Stripe metadata. All gift checkout uses explicit full-value USD prices, including after the campaign ends, rather than depending on older external price mappings. Hosted gift checkout needs the configured secret key; it does not require a publishable key for Stripe's hosted redirect. Other offers keep their existing integration gate. Custom and multiple-certificate requests from a stale page are rejected after the campaign ends.

The existing paid certificate generator and purchase email transport remain in use. Quantity one keeps the existing `LIGHT-...` code. Larger orders derive stable codes from the session ID and a one-based certificate index, preserving each item's individual face value. The paid purchase email attaches every original certificate separately.

`src/lib/holiday-voucher-fulfillment.ts` and the signed Stripe webhook issue the separate complimentary voucher. Persistent SQL uniqueness and locks make issuance idempotent across concurrent retries. Current charge refunds are checked after issuance to reconcile a refund event that arrived before the checkout event.

`src/lib/holiday-voucher-email.ts` uses the existing Resend sender with an idempotency key derived from the voucher ID. It does not switch providers after an ambiguous outcome. A transactional email outbox claims one sender, records its provider reference and freezes the delivery amount and PDF for consistent retries. Delivery older than the guarded provider idempotency window requires manual review. Paid certificate delivery failures, promotional failures and a busy concurrent sender return a retryable webhook error.

`src/lib/holiday-voucher-document.ts` creates the separate branded email and PDF. Both clearly identify complimentary promotional credit, its unique code, validity dates and expiration. The existing paid certificate terms are not replaced by the promotional expiration.

Admin access is `/admin/holiday-vouchers`, linked from the admin account. The page and all actions require existing admin authentication. It separates live and test transactions and shows purchasers, Stripe references, paid certificate references, face value, adjusted entitlement, available balance, redemptions, refunds, cancellation restorations and email status. Redemption is recorded by Kate after checking the service and other-promotion restriction. This does not introduce a new consumer Calendly redemption system.

Homepage and gift purchase surfaces use the existing brand design. They render from current campaign state and refresh at the cutoff. After midnight Eastern on December 16 the banner, bonus labels and temporary custom/quantity form disappear automatically. Regular gift certificate purchasing remains available. No cron job or later code deployment is needed for the scheduled transition.

The public `/gift-certificate/holiday-terms` page retains campaign terms for voucher holders. Disclosures also appear in promotional materials and before checkout. Writing stays in the shared header and is not added to the footer. Courses and the paused Reiki quiz are outside this change.

## Database and activation

Apply `supabase/migrations/202611250001_holiday_promotional_vouchers.sql` to the correct existing Website Supabase project before enabling the campaign. It adds separate voucher, redemption, refund, cancellation-reversal and email-outbox records with service-role-only access. It does not migrate or reduce paid certificate balances.

The bank timing rule also requires `202611250002_holiday_payment_initiations.sql` and `202611250003_holiday_payment_initiation_events.sql`, in that order. Migration 002 is installed and service-role reads returned HTTP 200 with zero initial proofs. Migration 003 has passed SQL tests and is awaiting its final dashboard application/verification at this note update. The older clean `cbbb6f4` candidate predates this rule and must never be published.

Existing Supabase API credentials do not provide arbitrary DDL. No SQL management RPC or database management credential was available locally. Use the authenticated dashboard SQL editor for this migration, then verify the tables, function signatures and restricted grants.

Server-only environment entries are documented in `.env.example`:

```dotenv
HOLIDAY_GIFT_CAMPAIGN_ENABLED=false
HOLIDAY_GIFT_CAMPAIGN_LAUNCHED_AT=2026-11-25T00:00:00.000Z
```

The timestamp above is an example. The release controller has chosen `2026-11-25T02:19:06.188Z` as the stable production launch instant. Preserve it when rebuilding the final candidate. Before synchronizing main or publishing, persist both campaign flags as plain production project configuration so future GitHub deployments retain the campaign. The prepared flag action writes only these two keys and has not been applied yet. Keep preview mail and Stripe traffic isolated. Once checkout sessions exist, preserve the launch instant because issued session metadata is matched against it during retries.

Scheduled expiration is determined by the dates. Leave the launch setting stable for delayed successful-payment retries after December 15; the campaign flag does not need to be turned off to hide the expired promotion. An emergency flag disable also disables eligibility processing and therefore needs follow-up for queued payments.

## Validation recorded

- `npm run test:holiday`: 114 tests passed after the final bank initiation cases, pending-payment confirmation page and original-certificate independence change. Targeted lint and TypeScript also passed. This sequential command covers thresholds, cutoff and DST boundaries, decimal/custom/multiple orders, paid PDFs, voucher emails, initiation proofs, out-of-order events, current-paid reconciliation, duplicate prevention and admin actions. It needs only the normal project dependencies.
- SQL behavior suite: 18 tests passed against PGlite using the actual migration. It exercises balances, restrictions, refunds, restoration, email claims and grants.
- Native PostgreSQL 17 contention suite: eight tests passed using eight independent database connections. It tests simultaneous issuance, overspending prevention, duplicate redemption requests, a single email claimant and concurrent refund/restoration paths. Temporary clusters were stopped and removed.
- Initiation migration 002: ten PGlite and ten native PostgreSQL tests passed. Additive receipt migration 003: eleven PGlite and eleven native PostgreSQL tests passed, including distinct Event IDs, earliest-time reconciliation, immutable financial identity and independent-connection contention.
- Production build passed with Next.js 16.2.6, including the Writing route. TypeScript and targeted ESLint passed. A final full lint/type check is still appropriate after the last admin/UI changes.
- Admin display and input issues found during ledger review were fixed: booking references are limited to the SQL maximum of 160 characters, inactive vouchers show zero available credit and refund-only reductions are not labeled partial redemption. The recorded underlying ledger balance remains visible separately.
- All five real sandbox purchases and staged fulfillment checks passed. Each voucher has the correct $5, $15, $25, $50 or $100 face value and full recorded test balance. Redemption is available only during its stated dates. All have `stripe_livemode=false`. Five unique codes and five sent outboxes remained unchanged after two extra duplicate deliveries. Kate confirmed receipt of all ten purchaser emails.
- Before the bank rule change, the clean unaliased production candidate built successfully, returned an unpaid `cs_live_` checkout, preserved Writing/header/footer and December Events, rejected an invalid signature with HTTP 400 and omitted the test diagnostic with HTTP 404. It remains unpublished and is obsolete; rebuild and repeat these checks from the bank-aware source.
- The built application passed a controlled-clock expiration test at December 16, 2026 midnight Eastern (`2026-12-16T05:00:00.000Z`): the homepage banner and custom/quantity controls disappeared, all six regular amounts remained and stale custom or quantity-two requests were rejected. This was a local built-application test, not a production clock change.

Private payloads and provider references are excluded from Git in `output/holiday-campaign/private/`. The detailed replay evidence is `replay-report.json`. Local staging/replay helpers and per-deployment secrets are outside the release source under `/private/tmp`; do not copy them into a production artifact.

Optional SQL dependencies are deliberately not added to the production dependency lock. The test installation at `/private/tmp/lightness-holiday-sql-tests` contains `@electric-sql/pglite`, `embedded-postgres@17.9.0-beta.17` and `pg`.

```sh
npm run test:holiday
npm run lint
npx tsc --noEmit
npm run build
HOLIDAY_SQL_TEST_MODULE_ROOT=/private/tmp/lightness-holiday-sql-tests node --test scripts/test-holiday-voucher-ledger.mjs
HOLIDAY_SQL_TEST_MODULE_ROOT=/private/tmp/lightness-holiday-sql-tests node --test scripts/test-holiday-voucher-contention.mjs
HOLIDAY_SQL_TEST_MODULE_ROOT=/private/tmp/lightness-holiday-sql-tests node --test scripts/test-holiday-payment-initiation-sql.mjs
HOLIDAY_SQL_TEST_MODULE_ROOT=/private/tmp/lightness-holiday-sql-tests HOLIDAY_INITIATION_NATIVE=1 node --test scripts/test-holiday-payment-initiation-sql.mjs
HOLIDAY_SQL_TEST_MODULE_ROOT=/private/tmp/lightness-holiday-sql-tests node --test scripts/test-holiday-payment-initiation-events-sql.mjs
HOLIDAY_SQL_TEST_MODULE_ROOT=/private/tmp/lightness-holiday-sql-tests HOLIDAY_INITIATION_NATIVE=1 node --test scripts/test-holiday-payment-initiation-events-sql.mjs
```

The native runner requires permission to start a local process and loopback listener. It starts an isolated temporary database and removes it after completion.

## Remaining release gates

1. Refresh production again immediately before release and reconcile any new main-branch changes. Preserve current December Events and all existing service, account and course updates.
2. Migrations 001 and 002 are installed; finish migration 003 and verify its restricted access. Reconcile the same five genuine sandbox events into the new proof tables, confirming no new purchaser emails and unchanged voucher/outbox counts. Verify admin access with Kate's authenticated account on the final candidate. Unauthorized visitors must not receive voucher data or mutation access.
3. Confirm that the deployed Stripe key, webhook secret and events belong to the same intended mode and account. Keep sandbox rows separate from live purchases. Verify all five purchase tiers through the intended checkout path, including custom and multiple-certificate cases.
4. Kate confirmed receipt of all ten original-certificate and separate-voucher emails. Preserve that result while replaying the same events for initiation reconciliation; existing sent markers and outboxes must prevent another send. Redemption restrictions and refund behavior passed SQL and native contention tests; do not represent these as live customer redemptions.
5. Verify the exact expiration boundary with a controlled clock: promotion visible at December 15, 2026 11:59:59 PM Eastern and regular purchasing restored at December 16 midnight Eastern. Verify existing open pages refresh and stale promotional requests cannot create a bonus after the cutoff.
6. Smoke-test `/`, `/gift-certificate`, `/checkout/gift-certificate`, `/gift-certificate/holiday-terms`, `/events`, `/rooted-vision-womens-circle`, `/sound-journeys-at-sanctuary`, `/login`, `/account`, `/checkout/success`, `/checkout/cancel`, `/writing` and `/courses`. A successful confirmation shell alone does not verify email delivery.
7. On the release candidate, confirm `/writing` loads, the shared header includes Writing and the footer does not. Confirm Courses keeps its current content and Reiki quiz remains paused. Verify account access, event detail/checkout links and confirmation emails before publishing.
8. Build a fresh production release from canonical source only after the remaining checks pass. Do not promote a test artifact containing test Stripe settings, narrowed recipients, disabled crons or the diagnostic. Recheck the live campaign, paid checkout, email delivery, admin ledger and protected existing routes after release. Record the final commit, deployment and verified launch instant here.

## Final database and regression verification

- Migrations 001, 002 and 003 were installed successfully through the authenticated Website project SQL editor. Existing five test vouchers were preserved.
- Production service-role access is allowed and public access is denied. Direct checks rejected redemption before January 1, combination with another promotion and ineligible training purchases without changing the test voucher balance.
- The final main holiday suite passed 114 tests. Four relevant existing email, invoice, enrollment and event-capacity suites passed 82 regression tests after their dependency mocks were updated.
- The user confirmed receipt of all five paid gift certificate emails and all five separate promotional voucher emails.
- The deadline rule is payment initiation before December 15 at 11:59 PM Eastern. Later bank settlement is allowed. Initiation comes from preserved signed checkout completion evidence, never checkout opening time.
