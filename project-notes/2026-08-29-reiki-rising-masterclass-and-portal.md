# Reiki Rising, Called to Reiki and Portal Handoff

Date: August 29, 2026  
Branch: `codex/event-mailchimp-optin`  
Worktree: `/Users/magicalbeing/Desktop/lightness-platform/.codex-worktrees/event-mailchimp-optin`

## Outcome

The Called to Reiki masterclass, Reiki Rising live-call resources and student portal access flow are live and connected. The portal setup process was hardened against email-security scanners, Mishelle's access was restored and a permanent QA student account was created for future testing.

## Called to Reiki Masterclass

- Public route: `/is-reiki-calling-you`
- Name: `Called to Reiki`
- Subtitle: `A Holy Fire® Reiki Masterclass + Healing Experience`
- Date: Wednesday, September 16, 2026
- Time: 7:00-8:15 PM ET
- Format: live online
- Price: $11
- Tuition credit: the $11 may be applied to Reiki Rising when the student enrolls by September 20. The copy treats this as a sweet optional incentive, not pressure to join and not a cash refund.
- Promotional captions may still open with `Is Reiki calling you?`

Current masterclass access:

- Meet: `https://meet.google.com/myw-kuih-cgh`
- Dial-in: `+1 740-324-5018`
- PIN: `682453263`
- More numbers: `https://tel.meet/myw-kuih-cgh?pin=5444824961536`

`src/lib/reiki-masterclass-access.ts` is the shared source of truth for the Meet and calendar details. The landing page, event configuration, confirmation email, Google Calendar link and `.ics` attachment use this shared information. The previous incorrect Meet link was removed.

## Reiki Rising Fall 2026 Portal

- Access slug: `reiki-rising-fall-2026`
- Student portal: `/library/reiki-rising-fall-2026`
- Login: `/login`
- Account: `/account`

The portal includes:

- weekly Reiki Rising Google Meet access
- recurring calendar access
- the required textbook link
- a free Called to Reiki masterclass card for enrolled students

The masterclass card includes `Join the Free Masterclass` and `Add to Google Calendar`. Reiki Rising students do not need to use the public $11 checkout.

Weekly Reiki Rising call:

- Meet: `https://meet.google.com/vka-htoq-sgj`
- Dial-in: `+1 361-271-1087`
- PIN: `387 491 998#`
- Schedule: Wednesdays from 7:00-8:15 PM ET

Textbook:

- `https://www.reiki.org/store/books/reiki-healing-touch`

## Portal Setup and Password Recovery

The original one-click setup route could lose one-time tokens when an email-security scanner opened the link before the student. The flow now separates the harmless landing page from token verification.

Current flow:

1. The student receives `Your secure Lightness portal link` with a `Choose Your Password` button.
2. `/portal-setup` displays a safe page without consuming the token.
3. The student presses `Continue to Create Password`.
4. `/portal-setup/continue` verifies the token, establishes the session and opens password creation.
5. After saving the password, the student sees `Go to Portal Login`.
6. Signed-in students can later use `Change Password` on `/account`.

Expired or invalid links lead to a friendly state where the student can request a new link.

Relevant routes:

- `/forgot-password`
- `/portal-setup`
- `/portal-setup/continue`
- `/create-password`
- `/reset-password`
- `/account`

Security policy:

- Default to automatic account creation and a password chosen privately by the student.
- Use a unique temporary password only as an individual recovery fallback.
- Never use a shared password across students.
- Never store temporary passwords in handoff notes, source files or email drafts.

## Student and QA State

Mishelle:

- Email: `mishellealcivar3@gmail.com`
- Payment, enrollment and member access records existed correctly.
- A unique temporary password was assigned through the admin API after link recovery continued to fail.
- Kate confirmed the login and portal worked.
- The password is intentionally omitted. Mishelle can change it from `/account`.

Permanent QA student:

- Email: `kategajewski+portaltest@gmail.com`
- Has active access to `reiki-rising-fall-2026`.
- Received a real secure password email, confirmed unread in Kate's Gmail.
- Keep this account for future checkout, setup and portal regression tests.
- No QA password is stored here.

Recommended QA sequence:

1. Open the unread secure portal email in an Incognito or Private window.
2. Confirm the safe setup page appears.
3. Press `Continue to Create Password`.
4. Choose a password.
5. Log in and verify `/library/reiki-rising-fall-2026`.
6. Confirm the weekly call, calendar, textbook and free masterclass card are visible.

## Important Files

- `src/app/is-reiki-calling-you/page.tsx`
- `src/lib/events.ts`
- `src/lib/email.ts`
- `src/lib/reiki-masterclass-access.ts`
- `src/app/library/reiki-rising-fall-2026/page.tsx`
- `src/lib/reiki-rising-live-calls.ts`
- `src/lib/portal-access.ts`
- `src/app/portal-setup/page.tsx`
- `src/app/portal-setup/continue/route.ts`
- `src/app/auth/callback/route.ts`
- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/reset-password-form.tsx`
- `src/app/account/page.tsx`

## Validation and Deployment

- Targeted ESLint passes succeeded.
- Production builds succeeded after the final portal and masterclass changes.
- Mobile setup, expired-link handling and invalid-token recovery were checked.
- Called to Reiki was checked on desktop and mobile.
- The Writing header link remains present and Writing is absent from the footer.
- Implementation through commit `50bdfd1` was pushed to both the feature branch and `main` before this handoff update.

## Next Session

Start by completing the permanent QA account flow. Once that succeeds, future student enrollments should use the automatic setup path. If an individual student still cannot use a secure link, verify enrollment and member access first, then use a unique temporary password only as the last recovery step.
