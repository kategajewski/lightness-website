# Deployment Guide

This app is designed to deploy on `Vercel`.

## Current Status
- App builds successfully locally
- Supabase auth works locally
- Contact form writes to Supabase
- Stripe is intentionally not connected yet
- Domain cutover has not happened yet
- Vercel preview deployment is now live
- Vercel env vars for Supabase, Calendly, and Gmail forwarding have been added
- Supabase hosted auth URLs have been updated to the Vercel preview domain
- Private inquiry inbox at `/inquiries` is deployed and tested
- Contact form email forwarding to `kate@bethelightness.com` is deployed and tested

## Before Vercel
- Make sure the code is in a Git provider Vercel can import
- Keep the reference mockup in place:
  - [`homepage-mockup.html`](/Users/magicalbeing/Desktop/gohighlevel/homepage-mockup.html)
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

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_MEMBERSHIP_MONTHLY=
STRIPE_PRICE_REIKI_RISING=
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
- Stripe values can stay blank until payment launch, but checkout will remain staged until then
- `NEXT_PUBLIC_SITE_URL` must be changed from localhost to the real production domain before live password reset or Stripe redirect testing

## Supabase Production Settings
Before production testing, update Supabase Auth settings:

### Site URL
- `https://bethelightness.com`

### Redirect URLs
- `https://bethelightness.com/**`
- add preview URLs later if you want preview auth flows

If you use `www`, also add:
- `https://www.bethelightness.com/**`

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
1. Continue page-by-page design/content polish on the hosted preview
2. Review the local `selected-site-photos/best-for-website` shortlist and place final optimized images into the site
3. Test hosted password reset when ready
4. Keep Stripe paused until payment migration is approved

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
When the Vercel production site is approved:
1. Add `bethelightness.com` to the Vercel project
2. Update DNS at your registrar to point to Vercel
3. Wait for SSL to provision
4. Update Supabase Auth URLs to the live domain
5. Re-test login, password reset, and contact form
6. Only then retire GoHighLevel

## Current Recommended Next Step
1. Create the Vercel project
2. Add the Supabase env vars
3. Deploy a preview or production build without Stripe
4. Test the live hosted version
