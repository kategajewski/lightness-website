# May 10, 2026 - Security, Email List, and Gift Certificates

## Security and spam protection

- Added Cloudflare Turnstile protection to the email updates form, contact form, and mentorship application.
- Added hidden bot-trap fields and timing checks to reduce automated spam submissions.
- Added server-side Turnstile verification before forms are accepted.
- Added sitewide security headers:
  - Strict Transport Security
  - X-Content-Type-Options
  - X-Frame-Options
  - Referrer-Policy
  - Permissions-Policy
- Hardened auth redirects and checkout return URLs.
- Updated vulnerable dependencies until `npm audit --omit=dev` reported zero vulnerabilities.

## Mailchimp

- The email list form now syncs to Mailchimp.
- Added `Online programs` as a checkbox option on the email updates page.

## Gift certificates

- Gift certificate purchases now send a printable PDF certificate after Stripe checkout.
- The PDF includes:
  - The Lightness of Being logo
  - Gift amount
  - Purchaser/date line
  - Unique certificate code
  - Redemption wording
- Current gift certificate amounts:
  - `$50`
  - `$100`
  - `$150`
  - `$250`
  - `$500`
- Removed the `$140` option to keep the choices cleaner.
- Certificate wording now says:
  - `Redeem through bethelightness.com using this certificate code.`

## Stripe note

- The site supports the `$150` gift certificate checkout.
- A test-mode `$150` Stripe Price was created locally:
  - `price_1TVjCaElTVNK9O7pfUomqrSi`
- Production Vercel has a variable slot supported in code:
  - `STRIPE_PRICE_GIFT_CERTIFICATE_150`
- If a live Stripe Price is created later, add its live price ID to that Vercel environment variable.
- Until then, the live site can still create the `$150` checkout dynamically.

## Commits

- `db21d06` - Harden website forms and security headers
- `6478404` - Send printable gift certificates after checkout
- `15bda23` - Add logo and 150 gift certificate option
- `fb66f79` - Update gift certificate redemption and 150 price support
- `1f53cf2` - Remove 140 gift certificate option
