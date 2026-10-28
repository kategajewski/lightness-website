# Virtual hypnotherapy intake

User requested a questionnaire and signature before a remote hypnotherapy session. Original blank source: https://docs.google.com/document/d/1Z1dSz9e2r8M-rSlzrleai6JieQCTuLiNog4V7eWJA8U/edit in kategajewski@gmail.com Drive. Original document is unchanged.

## Implemented

- Client form: /client-intake/hypnotherapy, unlisted with noindex, no-store and no-referrer. Original questions and consent, remote session arrangements, typed signature/date and printable receipt. Optional newsletter preference is captured separately, not automatically subscribed.
- Admin review: /client-intakes and /client-intakes/[id], verified existing Supabase identity and admin email allowlist. Account Admin Tools has a native Client Intakes link.
- Responses use a dedicated private client-intakes Storage bucket and AES-256-GCM ciphertext. Dedicated INTAKE_ENCRYPTION_KEY must remain stable and backed up privately. No answers are sent through contact_inquiries or email. Owner notifications contain reference/time and review link only.
- Immutable UUID writes and matching-payload retries preserve the original server receipt. Stored records retain consent text/version, typed signature, server timestamp and integrity fingerprint.
- No Google tracking or attribution runs on intake routes. Form POST and disabled pre-hydration controls prevent native GET submission of answers into URLs.

## Checks

Production build passed, all 79 regression tests passed and lint had zero errors (existing image warnings only). Browser: 390px layout has no horizontal overflow and 16px inputs. Required-field errors focus the first invalid answer and preserve a clean URL. The browser preserves and locks synthetic signed answers during an uncertain save while leaving retry enabled. No client answers appear in the URL. Configured local end-to-end saving, ciphertext integrity, matching retries and conflicting retries passed. Anonymous review URLs redirect to login.

Pre-release public regression checks passed for Events and detail links, account access, checkout and confirmation behavior, Writing, Courses and Reiki quiz. Writing remains in the shared header and absent from the footer. The release branch starts from the latest observed origin/main (681ec75).

Preview proof: /Users/magicalbeing/Desktop/lightness-platform/output/virtual-hypnotherapy-intake/intake-signature-preview.png. The origin guard accepts a validated browser-facing Host when Next uses an internal hostname and ignores forwarded hosts.

## Approved activation, October 28

User explicitly answered yes to using existing server credentials, configuring private encrypted storage and publication after reviewing the local form. Earlier rejected environment retrieval and credential-copy commands did not execute. Only necessary existing Supabase connection values were subsequently used in process memory. Created private JSON-only client-intakes bucket (128KiB per object), confirmed encrypted write plus denied anonymous listing/download and public download, then removed that access probe. A stable 32-byte base64 key is backed up privately in ignored primary .env.client-intakes (0600). Service credential was not copied to the worktree. Added INTAKE_ENCRYPTION_KEY through the signed-in Vercel dashboard to lightness-website, Secret type, Production only. CLI sign-in attempts were abandoned and stopped; no new CLI authorization was granted.

Local configured browser test saved a synthetic signed intake, confirmed consent/signature/server timestamp and a matching encrypted integrity fingerprint. Same retry returned original receipt; changed retry returned 409 and ciphertext stayed unchanged. Both local review URLs redirected anonymous requests to login. Synthetic records must be removed before final handoff. No actual client form invitation has been sent.

## Published verification

Published 3c8df00 from the reconciled release branch to main. Vercel Production deployment GCoUujCGWLu8db8smNbyb7BZJmJV reached Ready. Public post-release regression checks passed 41/41. The live form has no Google scripts and returns private no-store, noindex and no-referrer headers. A live synthetic submission returned a receipt and the existing signed-in Kate admin session reviewed its full answers, consent and signature. The Account Admin Tools shortcut works. Anonymous inbox and detail requests redirect to login. Both known local/live synthetic records were verified as test-only, removed individually and the private inbox was confirmed empty.

Live testing exposed a notification recipient-format issue: Resend rejected a comma-separated address string before the existing Gmail fallback. Intake owner notifications now pass a recipient array. Seven additional mocked-provider regressions verify the array, Gmail compatibility, fallback, unconfigured skip and unchanged single-recipient mail. Full production build and all 79 tests pass with this correction. No actual client invitation has been sent.
