# Lightness Platform Deployment Guide

Lightness Platform is designed to deploy on `Vercel`.

## Current Status
- App builds successfully locally
- Supabase auth works locally
- Contact form writes to Supabase
- Production domain cutover is complete
- Live production site is available at `https://bethelightness.com`
- `www.bethelightness.com` is also connected and valid in Vercel
- Vercel production deployment is live
- Vercel env vars for Supabase, Calendly, and Gmail forwarding have been added
- Vercel `NEXT_PUBLIC_SITE_URL` is set to `https://bethelightness.com`
- Supabase hosted auth URLs have been updated to the production domain
- Private inquiry inbox at `/inquiries` is deployed and tested
- Contact form email forwarding to `kate@bethelightness.com` is deployed and tested
- Stripe checkout/test flows have been staged and tested, but final live payment migration should still be handled deliberately before replacing any old payment setup

## Before Vercel
- Make sure the code is in a Git provider Vercel can import
- Keep the reference mockup in place:
  - [`homepage-mockup.html`](/Users/magicalbeing/Desktop/lightness-platform/homepage-mockup.html)
- Confirm the production domain to use at first deploy:
  - `bethelightness.com`
  - optional later: `www.bethelightness.com`

## Vercel Project Setup
1. Create a new Vercel project
2. Import the GitHub repository
3. Leave the root directory as:
   - `./`
4. Make sure the framework is:
   - `Next.js`
5. Leave build command as the default Next.js build
6. Leave output setting as the default Next.js output

Important:
- The app was moved to the repo root to avoid Vercel monorepo/root-directory confusion
- Do not point Vercel at `web` on future imports

## Required Vercel Environment Variables
Add these before the first production deployment:

```env
NEXT_PUBLIC_SITE_URL=https://bethelightness.com

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/thelightnessofbeing

NEXT_PUBLIC_GOOGLE_TAG_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_ADS_ID=
NEXT_PUBLIC_GOOGLE_ADS_CONTACT_CONVERSION_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_EMAIL_SIGNUP_CONVERSION_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_CALENDLY_CONVERSION_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_MEMBERSHIP_MONTHLY=
STRIPE_PRICE_REIKI_RISING=
STRIPE_PRICE_REIKI_RISING_EARLY_BIRD_PLAN=
STRIPE_PRICE_SOUND_TRAINING=
STRIPE_PRICE_SOUND_TRAINING_FULL=
STRIPE_PRICE_SOUND_TRAINING_PLAN=
STRIPE_PRICE_GIFT_CERTIFICATE=
STRIPE_PRICE_GIFT_CERTIFICATE_50=
STRIPE_PRICE_GIFT_CERTIFICATE_100=
STRIPE_PRICE_GIFT_CERTIFICATE_140=
STRIPE_PRICE_GIFT_CERTIFICATE_250=
STRIPE_PRICE_GIFT_CERTIFICATE_500=
```

Notes:
- Supabase values are required for login, account access, password reset, and the contact form
- Google values are optional until Ads/GA4 conversion tracking is ready, but should be added before paid traffic is optimized
- Stripe values can stay blank until payment launch, but checkout will remain staged until then
- `NEXT_PUBLIC_SITE_URL` must be changed from localhost to the real production domain before live password reset or Stripe redirect testing

## Supabase Production Settings
Production auth settings were updated on May 3, 2026:

### Site URL
- `https://bethelightness.com`

### Redirect URLs
- `https://bethelightness.com/**`
- `https://www.bethelightness.com/**`
- `http://localhost:3000/**` is still allowed for local development/testing

## First Deploy Checklist
- Vercel project created
- repo root selected as root directory
- production env vars added
- first deploy succeeds
- homepage loads
- login page loads
- contact form loads
- account page redirects correctly for signed-out users

## Current Next Steps
1. Test live login with a real member account
2. Test one live password reset email and confirm the link returns to `https://bethelightness.com`
3. Submit one live contact form test and confirm storage/email forwarding
4. Keep Stripe/live payment migration deliberate until any old payment setup is ready to be retired

## Production Smoke Test
- Homepage renders correctly
- About, Services, Events, Contact pages open
- Calendly links open the correct booking page
- Contact form submits and writes to `contact_inquiries`
- Login works with a real test account
- Account page shows the correct `member_access` rows
- Protected pages block unauthorized users
- Password reset works with the production domain after Supabase URL config is updated

## Stripe Launch Checklist
Do this later when ready to replace the old live payment setup:
- add Stripe env vars in Vercel
- create Stripe products and prices
- add price IDs
- test checkout in Stripe test mode
- add webhook endpoint
- connect purchases to `member_access`

## Domain Cutover
Completed on May 3, 2026:
1. Added `bethelightness.com` to the Vercel `lightness-website` project
2. Updated IONOS DNS:
   - `A` record for `@` / `bethelightness.com` changed from `162.159.140.166` to `216.150.1.1`
   - `CNAME` for `www` changed from `sites.ludicrous.cloud` to Vercel DNS
3. Vercel generated SSL and marked both domains as valid:
   - `bethelightness.com`
   - `www.bethelightness.com`
4. Updated Supabase Auth URL configuration to the live domain
5. Updated Vercel `NEXT_PUBLIC_SITE_URL` to `https://bethelightness.com`
6. Triggered production redeploy at commit `80cf930`

## Current Recommended Next Step
1. Test live member login
2. Test live password reset email
3. Test live contact form
4. Review whether and when to retire old GoHighLevel pages/payment paths
