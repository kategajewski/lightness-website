# A Little Light Goes a Long Way

Prepared November 24, 2026 for the existing Lightness Platform.

## Release status

- Implementation is prepared in `/private/tmp/lightness-holiday-2026`, based on refreshed production commit `c22cb042f7773731c3877bbeb23c4d12ca6dcecc`.
- Git HTTPS fetch and Vercel production metadata independently confirmed that baseline. The matching READY deployment is `dpl_EJVWtfGwv4fqx7ZGDJBmYXNWvAvZ`.
- No production application deployment or campaign activation has been completed at note preparation. Do not release the older dirty Desktop checkout over the current site.
- Supabase was signed out. Kate has now signed in so the final migration can be installed through the existing Website project. Installation and verification must finish before activation; they are not claimed complete here.
- The available local Stripe credential is in test mode. Production Stripe and email secrets are marked sensitive in Vercel and their values cannot be retrieved through the API. Their presence does not establish that the local integration uses the production configuration.
- A local browser purchase of the $50 tier reached paid success in Stripe Sandbox. Other sandbox purchase checks are being completed separately. This is not a live payment or an end-to-end voucher delivery verification.
- Real purchaser email delivery and a deployed payment-to-ledger-to-email check remain pending. No production readiness claim should be made from mocked tests alone.

## Approved campaign rules

Campaign: **A Little Light Goes a Long Way**. Tagline: **Give a little. Get a little.**

Purchases qualify from the configured launch instant through December 15, 2026 at 11:59 PM Eastern. The exclusive end instant is `2026-12-16T05:00:00.000Z`.

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

`src/lib/holiday-gift-campaign.ts` owns the campaign identity, approved rules, Eastern boundaries and qualification. Signed successful-payment event time controls purchase eligibility, so delayed webhook delivery does not invalidate a payment made before the deadline. The payment intent is also retrieved and must confirm the full succeeded USD payment.

`src/lib/holiday-gift-order.ts` validates decimal dollar amounts and quantities using integer cents. The checkout route records the unit amount, quantity and transaction total in server-authored Stripe metadata. Campaign checkout uses explicit full-value USD prices. Custom and multiple-certificate requests from a stale page are rejected after the campaign ends.

The existing paid certificate generator and purchase email transport remain in use. Quantity one keeps the existing `LIGHT-...` code. Larger orders derive stable codes from the session ID and a one-based certificate index, preserving each item's individual face value. The paid purchase email attaches every original certificate separately.

`src/lib/holiday-voucher-fulfillment.ts` and the signed Stripe webhook issue the separate complimentary voucher. Persistent SQL uniqueness and locks make issuance idempotent across concurrent retries. Current charge refunds are checked after issuance to reconcile a refund event that arrived before the checkout event.

`src/lib/holiday-voucher-email.ts` uses the existing Resend sender with an idempotency key derived from the voucher ID. It does not switch providers after an ambiguous outcome. A transactional email outbox claims one sender, records its provider reference and freezes the delivery amount and PDF for consistent retries. Delivery older than the guarded provider idempotency window requires manual review. Paid certificate delivery failures, promotional failures and a busy concurrent sender return a retryable webhook error.

`src/lib/holiday-voucher-document.ts` creates the separate branded email and PDF. Both clearly identify complimentary promotional credit, its unique code, validity dates and expiration. The existing paid certificate terms are not replaced by the promotional expiration.

Admin access is `/admin/holiday-vouchers`, linked from the admin account. The page and all actions require existing admin authentication. It separates live and test transactions and shows purchasers, Stripe references, paid certificate references, face value, adjusted entitlement, available balance, redemptions, refunds, cancellation restorations and email status. Redemption is recorded by Kate after checking the service and other-promotion restriction. This does not introduce a new consumer Calendly redemption system.

Homepage and gift purchase surfaces use the existing brand design. They render from current campaign state and refresh at the cutoff. After midnight Eastern on December 16 the banner, bonus labels and temporary custom/quantity form disappear automatically. Regular gift certificate purchasing remains available. No cron job or later code deployment is needed for the scheduled transition.

The public `/gift-certificate/holiday-terms` page retains campaign terms for voucher holders. Disclosures also appear in promotional materials and before checkout. Writing stays in the shared header and is not added to the footer. Courses and the paused Reiki quiz are outside this change.

## Database and activation

Apply `supabase/migrations/202611250001_holiday_promotional_vouchers.sql` to the correct existing Website Supabase project before enabling the campaign. It adds separate voucher, redemption, refund, cancellation-reversal and email-outbox records with service-role-only access. It does not migrate or reduce paid certificate balances.

Existing Supabase API credentials do not provide arbitrary DDL. No SQL management RPC or database management credential was available locally. Use the authenticated dashboard SQL editor for this migration, then verify the tables, function signatures and restricted grants.

Server-only environment entries are documented in `.env.example`:

```dotenv
HOLIDAY_GIFT_CAMPAIGN_ENABLED=false
HOLIDAY_GIFT_CAMPAIGN_LAUNCHED_AT=2026-11-25T00:00:00.000Z
```

The timestamp is an example. Set the actual UTC launch instant and enable only the intended production environment after the integration checks pass. Keep preview mail and Stripe traffic isolated. Once checkout sessions exist, preserve the configured launch instant because issued session metadata is matched against it during retries.

Scheduled expiration is determined by the dates. Leave the launch setting stable for delayed successful-payment retries after December 15; the campaign flag does not need to be turned off to hide the expired promotion. An emergency flag disable also disables eligibility processing and therefore needs follow-up for queued payments.

## Validation recorded

- `npm run test:holiday`: 88 tests passed after the final admin fixes. This sequential command covers campaign thresholds, cutoff and DST boundaries, decimal/custom/multiple orders, paid PDFs, voucher email templates and idempotency, webhook fulfillment and admin authorization/actions. It needs only the normal project dependencies.
- SQL behavior suite: 18 tests passed against PGlite using the actual migration. It exercises balances, restrictions, refunds, restoration, email claims and grants.
- Native PostgreSQL 17 contention suite: eight tests passed using eight independent database connections. It tests simultaneous issuance, overspending prevention, duplicate redemption requests, a single email claimant and concurrent refund/restoration paths. Temporary clusters were stopped and removed.
- Production build passed with Next.js 16.2.6, including the Writing route. TypeScript and targeted ESLint passed. A final full lint/type check is still appropriate after the last admin/UI changes.
- Admin display and input issues found during ledger review were fixed: booking references are limited to the SQL maximum of 160 characters, inactive vouchers show zero available credit and refund-only reductions are not labeled partial redemption. The recorded underlying ledger balance remains visible separately.
- A sandbox browser checkout is not evidence of production email delivery. Actual delivery remains a deployment gate.

Optional SQL dependencies are deliberately not added to the production dependency lock. The test installation at `/private/tmp/lightness-holiday-sql-tests` contains `@electric-sql/pglite`, `embedded-postgres@17.9.0-beta.17` and `pg`.

```sh
npm run test:holiday
npm run lint
npx tsc --noEmit
npm run build
HOLIDAY_SQL_TEST_MODULE_ROOT=/private/tmp/lightness-holiday-sql-tests node --test scripts/test-holiday-voucher-ledger.mjs
HOLIDAY_SQL_TEST_MODULE_ROOT=/private/tmp/lightness-holiday-sql-tests node --test scripts/test-holiday-voucher-contention.mjs
```

The native runner requires permission to start a local process and loopback listener. It starts an isolated temporary database and removes it after completion.

## Remaining release gates

1. Refresh production again immediately before release and reconcile any new main-branch changes. Preserve current December Events and all existing service, account and course updates.
2. Finish and verify the migration in the correct production project, then verify admin access with Kate's authenticated account. Unauthorized visitors must not receive voucher data or mutation access.
3. Confirm that the deployed Stripe key, webhook secret and events belong to the same intended mode and account. Keep sandbox rows separate from live purchases. Verify all five purchase tiers through the intended checkout path, including custom and multiple-certificate cases.
4. Verify actual original certificate delivery and the separate promotional email, its PDF, code, value and dates. Retry the same event and confirm one voucher and one completed email outbox. Exercise redemption restrictions and refund handling using isolated test transactions and records.
5. Verify the exact expiration boundary with a controlled clock: promotion visible at December 15, 2026 11:59:59 PM Eastern and regular purchasing restored at December 16 midnight Eastern. Verify existing open pages refresh and stale promotional requests cannot create a bonus after the cutoff.
6. Smoke-test `/`, `/gift-certificate`, `/checkout/gift-certificate`, `/gift-certificate/holiday-terms`, `/events`, `/rooted-vision-womens-circle`, `/sound-journeys-at-sanctuary`, `/login`, `/account`, `/checkout/success`, `/checkout/cancel`, `/writing` and `/courses`. A successful confirmation shell alone does not verify email delivery.
7. On the release candidate, confirm `/writing` loads, the shared header includes Writing and the footer does not. Confirm Courses keeps its current content and Reiki quiz remains paused. Verify account access, event detail/checkout links and confirmation emails before publishing.
8. Deploy only after the remaining integration checks pass. Recheck the live campaign, paid checkout, email delivery, admin ledger and protected existing routes after release. Record the final commit, deployment and verified launch instant here.
