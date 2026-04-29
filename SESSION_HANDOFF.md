# Session Handoff

This file is the running session memory for the project.

Rule for future sessions:
- Whenever the user says `save everything`, update this file with a concise summary of what was completed in that session.
- Include:
  - pages or flows changed
  - important links or portal resources added
  - any important Supabase / Vercel / auth / Stripe state
  - the next recommended starting point

## Current Note
### Latest Save Point
- Stripe setup / pricing:
  - Monthly Membership price ID saved and added locally:
    - `STRIPE_PRICE_MEMBERSHIP_MONTHLY=price_1SP3HWElTVNK9O7pK4L76oOY`
  - Sound Practitioner Training now has two clean test prices saved and wired locally:
    - full payment: `price_1TRICDElTVNK9O7pRz5HE8WT`
    - 5-month plan: `price_1TRIE0ElTVNK9O7ptPE3DN8Y`
  - Gift Certificate now has five clean test prices saved and wired locally:
    - `$50` → `price_1TRJWrElTVNK9O7p3BkVRess`
    - `$100` → `price_1TRJwpElTVNK9O7pK5QvvstW`
    - `$140` → `price_1TRJxAElTVNK9O7pEALKFsUD`
    - `$250` → `price_1TRJxWElTVNK9O7py7tJ4PPs`
    - `$500` → `price_1TRJxlElTVNK9O7pfCDzcbPx`
  - Reiki Rising checkout is intentionally still on hold so current payment-plan students are not disturbed.
- Local env / Stripe keys:
  - Both `.env.local` files now include the new Stripe test price IDs for membership, sound training, and gift certificates.
  - Both `.env.local` files now include Stripe test API keys:
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
    - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET` is still blank locally.
  - Reminder for later:
    - rotate the Stripe **test** secret key after testing is finished.
- Checkout code:
  - Checkout flow now supports multiple purchase options instead of only one fixed price.
  - Sound training checkout supports:
    - full pay
    - payment plan
  - Gift certificate checkout supports:
    - $50 / $100 / $140 / $250 / $500
  - Gift certificate checkout wording was softened to feel customer-facing.
  - Gift certificate checkout image source was corrected to use local `gift-certificate-lantern.jpeg`.
- Gift certificate landing page:
  - Added `Gift Certificate` to the footer.
  - Replaced the broken right-side image with a proper local lantern image.
  - Rewrote page copy to speak to customers instead of internal build language.
  - Infused coaching / guidance language into the offer.
  - Removed the repetitive three-card explainer section.
  - `Available Amounts` are now real clickable `Choose $...` buttons.
- Git / GitHub:
  - The previous remote history mismatch was resolved by creating a new clean GitHub repo:
    - `https://github.com/kategajewski/lightness-website.git`
  - Local repo remote now points to that new repo.
  - Old stale upstream tracking for the previous remote was cleared.
  - GitHub Desktop now shows the clean `Publish branch` state for the new repo / repo preview linkage.
- Local development setup:
  - Node was installed locally and Terminal now reports `v24.15.0`.
  - The local `next` package had been corrupted; it was repaired.
  - Local dev server now starts successfully with:
    - `npm run dev`
    - local URL: `http://localhost:3000`
- Important testing note:
  - Stripe test values currently exist only in local `.env.local`, not in Vercel yet.
  - Any real Stripe checkout testing must happen on:
    - `http://localhost:3000`
  - not on the Vercel preview URL yet.
- Next recommended starting point:
  - Resume local testing from `http://localhost:3000/gift-certificate`.
  - Click a gift amount and confirm Stripe Checkout opens correctly in local dev.
  - Then test:
    - Sound Practitioner Training full pay
    - Sound Practitioner Training payment plan
    - Monthly Membership
  - After local checkout testing passes, add the same Stripe env vars into Vercel.
  - Then build the Stripe webhook / receipt / portal-access workflow.
