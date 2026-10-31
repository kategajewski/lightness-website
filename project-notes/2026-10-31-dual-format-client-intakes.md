# Intake forms for in-person and remote sessions

The user explicitly requested all intake forms for both in-person and remote sessions so the same links can be sent for either format. This resolves the earlier unconfirmed-scope publication rejection for the parent form. Publishing the parent form and extending the adult forms is now authorized.

Routes remain /client-intake/hypnotherapy, /client-intake/reiki and /client-intake/childrens-reiki. The adult Reiki form remains for new clients only. Both adult forms now require a session-format choice and confirmation of the relevant arrangements. In-person Reiki also requires a hands-off or light-touch preference. Changing format clears the confirmation and Reiki touch choice. Virtual Reiki discards any touch preference on the server. The parent form already supports both formats and a guardian signature.

Adult form versions are hypnotherapy-2026-10-31-v2 and reiki-2026-10-31-v2. New signed records snapshot selected arrangements. Existing encrypted records retain their exact raw shape and digests, with legacy remote mode interpreted only for display. No marketing subscription, booking automation or client message was added. All three forms reuse the private encrypted inbox and metadata-only owner notification.

Validation: 112 automated tests passed, production build and TypeScript passed and ESLint error check passed. Independent review ran 46 combined intake/form tests with no release blocker. Browser verified both adult mode branches, reset acknowledgements, in-person touch choices and their removal for remote Reiki, required-field focus and clean URL. At 390px the adult Reiki form has no horizontal overflow and 16px inputs; viewport reset. Parent both-mode browser checks were completed with its feature commit.

Local public forms, Writing, Events and event details returned 200 with privacy/header checks passing. The local server has no Supabase environment, so local login returns a configuration error; production login/account/admin and configured API validation must be checked against the live deployment. No secrets or real signed test records were used. Production branch was refreshed from origin/main 1660dd5306e2af898387c71d82a9a995ef7eac36 before release. Only the attached production worktree is used; Desktop remains stale.

Keep /writing and its shared header link, with no Writing footer link. No Courses or quiz source changed. Appointment-reminder instructions remain a separate task awaiting the user's wording.
