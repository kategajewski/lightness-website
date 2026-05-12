# Google Ads Sync

Lightness Platform has a dormant Google tag integration. It starts working only after the Google/GA4 environment variables are added in Vercel.

## Website Events

The site is ready to send these events:

- `generate_lead` after `/contact?status=success`
- `sign_up` after `/email-updates?status=success`
- `book_appointment_click` when someone clicks the Calendly booking link
- `email_click` when someone clicks a `mailto:` link
- `phone_click` when someone clicks a `tel:` link
- `purchase` after `/checkout/success`

## Vercel Variables

```env
NEXT_PUBLIC_GOOGLE_TAG_ID=AW-10836891194
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-10836891194
NEXT_PUBLIC_GOOGLE_ADS_CONTACT_CONVERSION_LABEL=5sSzCKvMr6scELqst68o
NEXT_PUBLIC_GOOGLE_ADS_EMAIL_SIGNUP_CONVERSION_LABEL=vWuvCOnnx6scELqst68o
NEXT_PUBLIC_GOOGLE_ADS_CALENDLY_CONVERSION_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL=
```

## Recommended Google Ads Conversion Actions

- Contact form lead
  - Category: Submit lead form
  - Primary optimization action
  - Use for bidding
- Calendly booking click
  - Category: Book appointment or outbound click
  - Primary if bookings are the main goal, secondary if contact leads are the main goal
- Email signup
  - Category: Sign-up
  - Secondary optimization action unless list growth is the campaign goal
- Purchase
  - Category: Purchase
  - Primary once Stripe payments are live

## Next Dashboard Step

In Google Ads, create or confirm each conversion action, then copy:

- the Google Ads ID, formatted like `AW-123456789`
- each conversion label, which is the part after the slash in `AW-123456789/label_here`

Add those values to Vercel, redeploy, then verify with Google Tag Assistant and Google Ads conversion diagnostics.

## Current Google Ads Values

- Google Ads account: `514-076-4033`
- Google tag / Ads ID: `AW-10836891194`
- Contact form lead label: `5sSzCKvMr6scELqst68o`
- Email signup label: `vWuvCOnnx6scELqst68o`

Calendly booking click and purchase conversion labels still need dedicated conversion actions if those should be optimized separately from contact and email signup leads.
