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

The bank timing rule also requires `202611250002_holiday_payment_initiations.sql` and `202611250003_holiday_payment_initiation_events.sql`, in that order. All three migrations were installed through the authenticated Website project SQL editor. Service-role reads are allowed and anonymous reads return HTTP 401. Final reconciliation preserved five test vouchers and recorded five initiation proofs and five append-only event receipts.

Existing Supabase API credentials do not provide arbitrary DDL. No SQL management RPC or database management credential was available locally. Use the authenticated dashboard SQL editor for this migration, then verify the tables, function signatures and restricted grants.

Server-only environment entries are documented in `.env.example`:

```dotenv
HOLIDAY_GIFT_CAMPAIGN_ENABLED=false
HOLIDAY_GIFT_CAMPAIGN_LAUNCHED_AT=2026-11-25T00:00:00.000Z
```

The timestamp above is an example. The release controller has chosen `2026-11-25T02:19:06.188Z` as the stable production launch instant. Preserve it when rebuilding the final candidate. Both campaign flags were persisted as plain production project configuration before main was synchronized: enabled `true` and launch `2026-11-25T02:19:06.188Z`. The guarded action verified that all unrelated environment configuration was unchanged. Future GitHub deployments retain these settings. Keep preview mail and Stripe traffic isolated. Once checkout sessions exist, preserve the launch instant because issued session metadata is matched against it during retries.

Scheduled expiration is determined by the dates. Leave the launch setting stable for delayed successful-payment retries after December 15; the campaign flag does not need to be turned off to hide the expired promotion. An emergency flag disable also disables eligibility processing and therefore needs follow-up for queued payments.

## Validation recorded

- `npm run test:holiday`: 114 tests passed after the final bank initiation cases, pending-payment confirmation page and original-certificate independence change. Targeted lint and TypeScript also passed. This sequential command covers thresholds, cutoff and DST boundaries, decimal/custom/multiple orders, paid PDFs, voucher emails, initiation proofs, out-of-order events, current-paid reconciliation, duplicate prevention and admin actions. It needs only the normal project dependencies.
- SQL behavior suite: 18 tests passed against PGlite using the actual migration. It exercises balances, restrictions, refunds, restoration, email claims and grants.
- Native PostgreSQL 17 contention suite: eight tests passed using eight independent database connections. It tests simultaneous issuance, overspending prevention, duplicate redemption requests, a single email claimant and concurrent refund/restoration paths. Temporary clusters were stopped and removed.
- Initiation migration 002: ten PGlite and ten native PostgreSQL tests passed. Additive receipt migration 003: eleven PGlite and eleven native PostgreSQL tests passed, including distinct Event IDs, earliest-time reconciliation, immutable financial identity and independent-connection contention.
- Production build passed with Next.js 16.2.6, including the Writing route. Final full ESLint and TypeScript checks passed on the frozen bank-aware source.
- Admin display and input issues found during ledger review were fixed: booking references are limited to the SQL maximum of 160 characters, inactive vouchers show zero available credit and refund-only reductions are not labeled partial redemption. The recorded underlying ledger balance remains visible separately.
- All five real sandbox purchases and staged fulfillment checks passed. Each voucher has the correct $5, $15, $25, $50 or $100 face value and full recorded test balance. Redemption is available only during its stated dates. All have `stripe_livemode=false`. Five unique codes and five sent outboxes remained unchanged after two extra duplicate deliveries. Kate confirmed receipt of all ten purchaser emails.
- The final bank-aware private test deployment replayed the same five genuine completed events. It recorded five initiation proofs and five append-only receipts while preserving all five voucher IDs, provider references and sent outboxes at one attempt. Two additional duplicate deliveries made no changes. No additional purchaser email was sent.
- The final clean production candidate from `beff921` built successfully with original admin recipients, original crons and inherited live credentials. It returned an unpaid `cs_live_` checkout, preserved Writing/header/footer and December Events, rejected an invalid signature with HTTP 400 and omitted the test diagnostic with HTTP 404. Public checks passed again after release.
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

## Final release record

The campaign was published on November 24, 2026 after the approved rules and delivery checks were complete. No real payment was submitted during release verification.

| Release detail | Verified value |
| --- | --- |
| Application commit and GitHub main | `beff9218646b3b9da3ea69ce7c22ac2ec35d13bf` |
| Stable campaign launch instant | `2026-11-25T02:19:06.188Z` |
| Production flags persisted | `2026-11-25T02:53:42.427Z` |
| Reviewed clean candidate | `dpl_4jEww7fPGY9K1uMnc52Qm6Cv7pCT` |
| Clean candidate promotion | `2026-11-25T02:55:30.797Z` |
| Final GitHub production deployment | `dpl_vko5o8susnh2whbNf3a21HkhXoNS`, READY |
| Public smoke verification | `2026-11-25T02:56:38.653Z` |

Production was refreshed immediately before publication. GitHub main and the domain were still at `c22cb042f7773731c3877bbeb23c4d12ca6dcecc`. Main was fast-forwarded to the reviewed `beff921` release after the two campaign flags were persisted. The clean candidate was promoted while the GitHub build was completing. The automatic GitHub deployment then became READY and assigned all five original aliases to the same reviewed application source: `bethelightness.com`, `www.bethelightness.com`, `lightness-preview-4x1n.vercel.app`, `lightness-website-bethelightness.vercel.app` and `lightness-website-git-main-bethelightness.vercel.app`.

The production artifact preserves original owner recipients and original cron configuration. It inherits the existing live payment and email credentials. No test Stripe override, test recipient override, test diagnostic or disabled-cron setting was published. Private test artifacts remain separate.

Final public HTTP checks passed for the homepage, gift certificate page, holiday terms, gift checkout, Writing, December Events and both current event detail pages, login, account, Courses and checkout success/cancel. Writing remains in the header and absent from the footer. The homepage campaign and the bank initiation disclosures are present. Unauthorized voucher-admin access redirects to login. Invalid webhook signatures return HTTP 400 and the removed test diagnostic returns HTTP 404. A live-mode $50 Stripe checkout opened without a payment or customer email. The final public page review and authenticated account workflows should continue to use the normal account process; the HTTP smoke does not constitute a new live customer purchase.

The live Stripe webhook endpoint retains its existing URL, API version and signing secret. Its subscribed events are `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded` and `invoice.paid`.

All three migrations are installed. The final main holiday suite passed 114 tests and four relevant existing email, invoice, enrollment and event-capacity suites passed 82 regressions. SQL and native contention suites passed 68 tests in total. Direct restricted-access checks rejected redemption before January 1, combination with another promotion and ineligible training purchases without changing the test voucher balance. These were controlled verification checks, not live customer redemptions.

Kate confirmed receipt of all five paid gift certificate emails and all five separate complimentary voucher emails. The final replay preserved the same five vouchers, five sent outboxes, provider references and single delivery attempts. It added only the five durable initiation proofs and five raw event receipts required by the bank timing rule. No additional email delivery was required.

Private release evidence is held outside the published source: `/private/tmp/lightness-holiday-postlaunch-smoke.json`, `/private/tmp/lightness-holiday-production-flags-result.json` and `/private/tmp/lightness-holiday-production-release-verification.json`. Detailed Stripe event payloads and delivery references stay under the ignored private output directory.
