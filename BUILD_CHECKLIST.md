# Lightness Platform Build Checklist

This project will be completed one section at a time. Each section has:
- required user inputs
- implementation tasks
- testing gates
- completion criteria

## Current Snapshot
- `Section 0` completed
- `Section 1` completed
- `Section 2` completed
- `Section 3` completed
- `Section 4` completed
- `Section 5` partially completed in staging mode
- `Section 6` partially completed and working locally
- `Section 7` partially completed for first protected experiences
- `Section 8` started for deployment readiness
- `Section 8` now has a live private Vercel preview

## Completed Build Items
- App scaffold and env strategy complete
- Global shell complete
- Homepage complete
- About, Services, Events, Contact complete
- Calendly integration complete
- Courses catalog complete
- Monthly Membership page complete
- Gift Certificate page complete
- Sound Training page complete
- Privacy Policy page complete
- Terms page complete
- Refund policy page complete
- Login page complete
- Account dashboard complete
- Protected `Reiki Rising` area complete
- Protected `Monthly Membership` area complete
- Protected `Sound Training` attendee resources area complete
- Internal contact form complete
- Password reset flow built and awaiting final hosted verification
- Staged Stripe checkout pages complete
- Vercel preview deployment complete
- Hosted login and account testing complete
- Contact forwarding env vars configured in Vercel
- Private inquiry inbox live and tested
- Contact form email forwarding to `kate@bethelightness.com` live and tested
- Website photo options sorted locally into `selected-site-photos`
- Tight first-pass shortlist created at `selected-site-photos/best-for-website`
- Local homepage photo placement guide created at `homepage-photo-placement-guide.html`
- Homepage image direction applied and iterated in staging, including hero, supporting portrait, supporting detail, healing session, sound/event image, CTA consistency, and warm glow treatment
- Homepage copy refined from the old live site and simplified for a cleaner presentation
- Homepage testimonial reduced to one selected Google review for a more premium feel
- Services page realigned to the actual core Calendly 1:1 offerings

## Open Build Items
- Stripe live integration
- Stripe webhook to Supabase access sync
- Domain cutover
- Final content polish and SEO review
- Hosted password reset final verification
- Final website photo placement and optimization pass
- Mobile review of latest homepage and services updates
- Continue page-by-page content and layout refinement beyond homepage/services

## Section 0: Project Setup

### Need From User
- Vercel access
- Supabase access
- Stripe access
- Calendly access
- Domain registrar or DNS access

### Tasks
- Create Next.js project
- Configure Vercel project
- Create Supabase project
- Set environment variable strategy
- Add base repo structure
- Add deployment configuration

### Testing
- Local app boots
- Preview deploy works on Vercel
- Environment variables load correctly

### Done When
- Fresh app deploys successfully
- Base stack is connected without errors
- Status: completed

## Section 1: Design System + Global Shell

### Need From User
- Final logo files
- Final brand colors if different from mockup
- Final font decision if different from mockup

### Tasks
- Build global layout
- Build header/footer
- Build design tokens
- Build reusable components for buttons, cards, sections, testimonials
- Match approved mockup direction

### Testing
- Header/footer responsive on mobile and desktop
- Typography and spacing consistent
- No layout shift or broken navigation shell

### Done When
- Shared site shell is production-ready
- Mockup look is represented in reusable components
- Status: completed

## Section 2: Homepage

### Need From User
- Approved homepage copy
- Final CTA destination for booking
- Final testimonial set

### Tasks
- Implement homepage from approved mockup
- Use real approved images
- Wire real links
- Add SEO metadata

### Testing
- All homepage links resolve correctly
- Mobile layout matches intent
- CTA buttons point to final destinations

### Done When
- Homepage is ready for production review
- Status: completed

## Section 3: Core Public Pages

### Need From User
- Final content for About, Services, Events, Contact

### Tasks
- Implement About page
- Implement Services page
- Implement Events page
- Implement Contact page
- Add shared SEO/meta structure

### Testing
- Navigation across all pages works
- Content matches approved source material
- Pages render correctly on mobile and desktop

### Done When
- Main public marketing site is complete
- Status: mostly completed for first-launch pages
- Additional public pages already added beyond original scope:
  - membership
  - gift certificate
  - privacy policy
  - terms

## Section 4: Calendly Booking

### Need From User
- Final Calendly booking links
- Desired booking placement by page

### Tasks
- Add booking CTAs
- Embed or deep-link Calendly where appropriate
- Add booking confirmation UX as needed

### Testing
- Each booking CTA opens the correct Calendly flow
- Mobile Calendly behavior is acceptable

### Done When
- Booking works end-to-end without GoHighLevel
- Status: completed

## Section 5: Stripe Products + Checkout

### Need From User
- Stripe account access
- Product list
- Price list
- One-time vs recurring definitions

### Tasks
- Create Stripe products/prices
- Add checkout session flows
- Add success/cancel flows
- Store transaction mapping in Supabase

### Testing
- Stripe test payments succeed
- Success and cancel pages behave correctly
- Purchased item is recorded correctly

### Done When
- Payments work for all launch offers
- Status: partially completed
- Already done:
  - staged checkout route
  - success and cancel pages
  - offer mapping for launch products
  - internal checkout pages for:
    - monthly membership
    - reiki rising
    - sound training
    - gift certificate
- Still needed:
  - real Stripe keys
  - price IDs
  - webhook handling
  - purchase-to-access automation

## Section 6: Auth + Member Access

### Need From User
- Rules for who should access what after purchase

### Tasks
- Add signup/login/reset flows
- Add protected routes
- Add user dashboard
- Map Stripe purchases to access rules

### Testing
- New account creation works
- Login/logout works
- Logged-out users are blocked from protected content
- Correct customers get correct access

### Done When
- Member system works securely
- Status: partially completed and locally tested
- Already done:
  - login flow
  - logout flow
  - dashboard
  - Supabase session handling
  - `member_access` table lookup
  - protected route gating
  - forgot password request flow
  - reset password form flow
- Still needed:
  - optional signup UX
  - final hosted password reset verification
  - Stripe-to-access automation

## Section 7: Courses / Membership Content

### Need From User
- Course titles
- Module structure
- Video/PDF/audio assets
- Hosting choice for video

### Tasks
- Build course index
- Build course detail pages
- Build protected lesson pages
- Add membership or subscription unlock logic

### Testing
- Protected lessons only load for authorized users
- Course navigation works
- Media embeds work

### Done When
- First launch-ready course or membership is live
- Status: partially completed
- Already done:
  - course catalog
  - protected `Reiki Rising` library shell
  - protected `Monthly Membership` library shell
  - public `Sound Training` page
  - protected `Sound Training` attendee resources shell

## Section 8: Deployment + Production Readiness

### Need From User
- Vercel account access
- Git provider access for the repo
- DNS access for `bethelightness.com`

### Tasks
- Create Vercel project
- Use repo root as the Vercel root directory
- Add production environment variables
- Deploy hosted build
- Update Supabase auth URLs for hosted domain
- Run hosted smoke tests

### Testing
- Vercel build succeeds
- Hosted homepage loads
- Hosted login works
- Hosted contact form writes to Supabase
- Hosted protected routes redirect correctly
- Hosted password reset works after Supabase URL update

### Done When
- Hosted deployment is live and stable
- Production envs are configured
- App is ready for domain cutover review
- Status: in progress
- Already done:
  - Git repo initialized
  - GitHub repo created and connected
  - App moved to repo root for Vercel compatibility
  - Vercel project created
  - Framework preset corrected to `Next.js`
  - Hosted preview deployment now loads successfully
- Still needed:
  - push latest local code to GitHub
  - redeploy latest preview
  - test hosted inquiry inbox
  - test Gmail inquiry forwarding
  - test hosted password reset
- Still needed:
  - sound training area
  - deeper lesson/module pages
  - downloads/resources
  - media hosting choices
- Pause note:
  - do not continue deeper `Reiki Rising` lesson expansion unless the user asks to resume it

## Section 8: Migration + Domain Cutover

### Need From User
- DNS access
- Launch approval

### Tasks
- Final content QA
- Redirect mapping from old URLs
- Domain connection in Vercel
- Production environment setup
- Launch checklist execution

### Testing
- Domain resolves to Vercel
- Old key URLs redirect correctly
- Stripe production keys work
- Supabase production environment works

### Done When
- New site is live on `bethelightness.com`
- GoHighLevel is no longer required
- Status: not started

## Next Session Starting Point
Recommended next task order:
1. `Sound Training`
2. `Contact form refinement`
3. `Password reset / account recovery`
4. `Refund policy`
5. `Stripe live integration`
