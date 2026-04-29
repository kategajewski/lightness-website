# The Lightness of Being Migration PRD

## Summary
Rebuild `bethelightness.com` as a custom `Next.js` application deployed on `Vercel`, using `Supabase` for database/auth and `Stripe` for payments. Keep `Calendly` for booking in v1. Replace GoHighLevel entirely with a self-hosted marketing site plus protected customer access for courses and subscriptions.

Reference design:
- [`homepage-mockup.html`](/Users/magicalbeing/Desktop/gohighlevel/homepage-mockup.html)

Reference source assets:
- [`site-images`](/Users/magicalbeing/Desktop/gohighlevel/site-images)
- [`site.html`](/Users/magicalbeing/Desktop/gohighlevel/site.html)

## Current Project Status
- Build is in active progress and the local app is working.
- Core marketing pages are already implemented in the new app.
- Supabase auth is connected locally and tested.
- Stripe is intentionally not connected yet. Checkout pages are staged and ready for keys later.
- Calendly booking is wired to the current live booking URL.
- First protected course flow is working for `Reiki Rising`.
- First protected membership flow shell is working for `Monthly Membership`.
- Deployment setup documentation is now in place for Vercel.
- A private Vercel preview deployment is now live and loading correctly.
- Hosted login and account flows have now been tested successfully on the Vercel preview.
- Contact form, private inquiry inbox, and Gmail forwarding to `kate@bethelightness.com` are live and tested on the Vercel preview.
- Website photo options have been collected locally and sorted into a first-pass shortlist.
- A local homepage photo placement guide is now in progress to help choose final image placement before changing the live homepage.

## Completed So Far
- Base `Next.js` app scaffolded in [`web`](/Users/magicalbeing/Desktop/gohighlevel/web)
- Global shell and approved homepage design implemented
- Public pages built:
  - homepage
  - about
  - services
  - events
  - contact
  - courses
  - monthly membership
  - gift certificate
  - privacy policy
  - terms
  - refund policy
  - sound training
- Auth and member system foundations built:
  - login page
  - account dashboard
  - Supabase-backed session handling
  - `member_access` lookup
  - forgot password page
  - reset password page
- Protected content built:
  - `Reiki Rising` member library
  - `Monthly Membership` member library
  - `Sound Training` attendee resources area
- Stripe-ready staging flows built:
  - product catalog
  - checkout route
  - success/cancel pages
  - placeholder product mapping for launch offers
- Internal contact form is writing to Supabase
- Refund policy is live
- Project is now flattened to the repo root for simpler Vercel deployment
- Private inquiry inbox page is built, deployed, and tested
- Gmail-based inquiry forwarding is built, deployed, and tested

## Working Local Features
- Email/password login through Supabase
- Account dashboard reads `member_access` rows for the signed-in user
- Protected route gating works for:
  - `/library/reiki-rising`
  - `/library/monthly-membership`
  - `/library/sound-training`
- Public internal sales pages exist for:
  - `/membership`
  - `/gift-certificate`
  - `/courses`
  - `/sound-training`
- Legal pages exist for:
  - `/privacy-policy`
  - `/terms`
  - `/refund-policy`
- Contact form writes to `contact_inquiries`

## Working Hosted Features
- Vercel preview deployment is live
- Next.js build runs successfully on Vercel
- Project-level `Framework Preset` has been corrected to `Next.js`
- Root directory is the repo root (`./`)
- Preview is suitable for private review and staging
- Hosted login works
- Hosted account page works
- Hosted contact form stores inquiries in Supabase
- Hosted private inquiry inbox at `/inquiries` works for admin users
- Hosted contact form forwarding to `kate@bethelightness.com` works

## Current Environment Status
- Supabase values are present in [`web/.env.local`](/Users/magicalbeing/Desktop/gohighlevel/web/.env.local)
- Stripe env vars are intentionally blank for now
- Local dev server should be run from [`web`](/Users/magicalbeing/Desktop/gohighlevel/web)
- Production builds are verified with `webpack`

## Supabase Setup Already Completed
- Project URL collected
- Publishable anon key collected
- Secret key collected
- Email auth enabled
- Site URL configured for local development
- Redirect URL configured for local development
- `member_access` table created
- RLS enabled on `member_access`
- select policy for authenticated users created
- service role policy for backend writes created
- test user created
- test login verified
- test access lookup verified

## Goals
- Launch a premium branded website based on the approved homepage mockup.
- Migrate core content and flows off GoHighLevel.
- Support session booking via Calendly.
- Support one-time and recurring payments with Stripe.
- Give customers account-based access to purchased courses or memberships.
- Keep the system simple to operate and easy to extend later.

## Core User Flows
- Visitor lands on homepage and navigates public marketing pages.
- Visitor books a session via Calendly.
- Visitor purchases a course or subscription via Stripe Checkout.
- Stripe webhook updates access in Supabase.
- Customer logs in and sees only the content they own.

## Initial Scope
- Public website:
  - Homepage
  - About
  - Services
  - Events
  - Contact
  - Course or membership landing pages
  - Gift Certificate
  - Privacy Policy
  - Terms
- Payments:
  - Stripe Checkout
  - Basic purchase confirmation flow
- Auth:
  - Email/password account login
  - Password reset
- Member area:
  - Dashboard
  - Course library
  - Protected course pages
- Integrations:
  - Calendly
  - Stripe
  - Supabase auth/database
  - Vercel deploy + custom domain

## Deferred Scope
- PayPal at launch unless explicitly required
- Advanced LMS features like quizzes, certificates, cohorts, or discussion boards
- Full CMS/editor for non-technical content editing
- Complex drip automation beyond basic access control

## Technical Direction
- Framework: `Next.js`
- Hosting: `Vercel`
- Database/Auth: `Supabase`
- Payments: `Stripe`
- Booking: `Calendly`
- Styling/UI: implement from approved mockup with reusable components
- Protected media: external video hosting if needed; do not store large video assets in repo

## Success Criteria
- `bethelightness.com` runs on the new stack.
- Core public pages are migrated and linked correctly.
- Calendly links are wired and tested.
- Stripe checkout works in test and production.
- Successful purchase grants the correct access.
- Unauthenticated users cannot access protected content.
- Site is responsive and visually aligned with the approved mockup.
- GoHighLevel can be retired after launch validation.

## Next Priorities
1. Begin page-by-page design/content polish, especially pages that still feel too close to the old website
2. Review the `selected-site-photos/best-for-website` shortlist and choose final images for homepage, about, services, events, and sound training
3. Confirm password reset end-to-end after hosted domain is configured in Supabase
4. Connect Stripe keys and price IDs when launch-ready
5. Grant access automatically after Stripe purchases
6. Cut over the domain from GoHighLevel when approved

## Important Notes For Next Session
- Whenever the user says `save everything`, update [`SESSION_HANDOFF.md`](/Users/magicalbeing/Desktop/gohighlevel/SESSION_HANDOFF.md) with a concise summary of the session so continuity is preserved even if the thread is closed.
- The user wants to continue section by section and may pause one product area while continuing others.
- `Reiki Rising` implementation should be paused for deeper lesson expansion unless the user explicitly reopens it.
- Do not connect Stripe until the user is ready to move off the old live setup.
- Keep the approved homepage mockup unchanged as the design reference.
- Continue using the existing warm, premium visual system already implemented.
- Preserve the current internal route structure instead of pointing back to old GoHighLevel pages whenever a new page is built.
- Use [`DEPLOYMENT.md`](/Users/magicalbeing/Desktop/gohighlevel/DEPLOYMENT.md) as the deployment playbook.
- Important deployment note: the app now lives at the repo root for Vercel. Do not set the root directory to `web` on future imports.
- Current stop point: inquiry inbox and Gmail forwarding are live/tested; photo options are sorted locally into `selected-site-photos`, including a tighter `best-for-website` shortlist with local usage notes. The homepage has now been significantly polished with updated imagery, warm glow treatment, cleaner copy pulled from the old live site, one selected Google review testimonial, simplified sections, and clearer navigation cards. The Services page has also been realigned to the user's real Calendly 1:1 offerings. A current visual reference screenshot is saved locally at `homepage-current-screenshot.png`. Next session should continue page-by-page polish, verify the latest homepage/services changes on mobile, and then refine the next most important page.

## Required Inputs From User
- Vercel account access
- Supabase account access
- Stripe account access
- Calendly account access
- Domain and DNS access
- GoHighLevel login for content migration
- Final page list
- Final product and pricing list
- Course access rules
- Brand assets and copy
- Legal policy content
