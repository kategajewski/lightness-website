# New-client virtual Reiki intake

Requested October 31, 2026. User confirmed this form is for new clients only.

Source: Reiki Client Information Form in kategajewski@gmail.com Drive, https://docs.google.com/document/d/1bXL2ez3Z9Pbk6oi4jmv9QS-SCri8L3PL3mVRgzxDMOo/edit . Original blank document remains unchanged. The business-account connector search did not find it, so the file was grounded through the signed-in personal Drive search and read through the connector using its observed ID.

## Implementation

- New unlisted, no-account client form at /client-intake/reiki. Clearly asks for completion before the first Reiki session with Kate and says returning clients need not repeat it. No history lookup or automatic message to existing clients was added.
- Source-based name, phone, optional email and event/program updates preference, intentions, referral and previous Reiki experience. Email stays optional unless the client opts into updates. The opt-in is recorded with the intake and does not silently subscribe anyone.
- Physical-touch permission replaced by remote-session consent. Preserves the source medical-care boundary, privacy notice and signed/date intent, with remote wording and no promised outcome. Omits the source's stronger healing-response/multiple-session claims rather than introducing medical efficacy claims. Background reference: https://www.nccih.nih.gov/health/reiki .
- Typed electronic signature, versioned consent snapshot, server receipt and printable client copy follow existing hypnotherapy behavior. Separate POST validator/endpoint, bounded body, origin guard, bot checks and immutable retries. No answers in URLs, logs or owner emails.
- Same existing private encrypted client-intakes bucket/key/admin access. Reiki records have formType=reiki. Existing hypnotherapy record bytes, fingerprints and retry compatibility are unchanged. Inbox shows the relevant modality and provides both share links.
- /client-intake and /api/client-intake privacy prefixes already cover the new routes. Existing hypnotherapy link and Calendly configuration remain unchanged. This task does not add first-client conditional Calendly delivery.

## Verification

- All 92 automated regressions passed, including new Reiki validation, optional email, persisted source-specific consent, encrypted immutable saving, cross-form UUID conflicts, mixed admin records and legacy hypnotherapy compatibility.
- Production build passed. TypeScript passed. Full lint had zero errors; pre-existing image warnings remained. Agent subsequently removed two new fixture-only unused-variable warnings and owned-file lint passed cleanly.
- Independent security/privacy review found no material blocker.
- In-app browser preview on separate local production server port3391, since the older3390 server had no new route and Chrome blocked localhost navigation. Required-field validation focused fullName without altering the URL. At390px width there was no horizontal overflow and input text remained16px. Viewport override reset.
- Local public smoke checks passed Reiki/hypnotherapy private headers and tracking suppression, Writing/header/no-footer link, Events/detail routes and Courses. Local login could not render without production Supabase runtime configuration; no credentials were copied to the checkout. Anonymous auth/notification behavior is covered by mocked regressions and must be rechecked on the configured production site after publication.

## Release

Release is based on refreshed origin/main2302ecaa42b63d5cfea65871204964a2f88d55d7 in the attached worktree, not the stale Desktop checkout. Before release, refresh main again and verify no newer live changes are overwritten. Preserve /writing and its header link with no footer Writing link. Publication/live checks pending at note creation.

The earlier appointment-instructions reminder page is still waiting on the user's wording and service scope. No reminder changes were made as part of this intake task.
