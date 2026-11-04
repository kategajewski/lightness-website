# Reiki Share Stripe capacity

- November 19, 2026 Reiki Share remains $25 and retains the legacy event slug `reiki-share-november-5-2026` for attendance and confirmations.
- Dedicated live Stripe Payment Link: `plink_1UXthtElTVNK9O7p2bHqxK0l`, https://buy.stripe.com/28E6oHe5W0gp3sT6Fxdwc02.
- Stripe enforces 7 total completed purchases. Quantity is fixed at 1 and cannot be adjusted. Sold-out text is configured on Stripe and the website.
- Prior to rollout, Supabase attendance had 0 records for this event. Stripe Checkout Recent showed the newest bespoke session on November 2 at 12:54 PM, canceled; next was October 12 for a different $150 purchase. No completed legacy purchases or unexpired legacy event sessions existed. The newest old session was already more than 24 hours old.
- The event API validates the dedicated link, mode, metadata, native limit, quantity, price, extra items and optional email preference. Failures block checkout instead of creating a new uncapped session.
- Optional Stripe custom dropdown `Event updates by email` has No and Yes options with no preselected value. Only explicit Yes grants marketing consent. Website metadata source is `stripe_payment_link_v1`; existing events retain their prior consent flow.
- Stripe success redirect retains the original website confirmation URL, event metadata and session ID. Webhook now also processes `checkout.session.async_payment_succeeded` so delayed payment methods receive confirmation once paid.
- Native link limitations count completed sessions rather than unique email addresses. Refunding a purchase does not automatically reopen a spot. Any manual registration must be reconciled separately with this seven-ticket inventory.
- Validation: 51 mocked checkout/consent/webhook tests pass; production build and lint pass. Existing invoice and paused-enrollment checks pass. Live public Events, event details, account entry, checkout confirmation shell, Writing and Courses returned 200; Writing remains in the header and absent from the footer. No real payment or test email was sent.
- Release begins from refreshed production commit `8c81e717c29a3bd2bc4fe017bf27b15b91547a4f`; do not deploy the stale Desktop checkout.
