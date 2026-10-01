# Reiki offerings and quiz pause

User approved publishing on October 1, 2026.

- Feature The Embodied Healer and The Healer's Emergence Reiki coaching as available now, alongside individual sessions.
- Reiki Rising public enrollment is closed. Its public page is now a Fall 2027 interest page using the existing training inquiry form, with student portal access retained.
- Public Reiki Rising checkout GET and POST redirect to the interest page. Existing invoice automation, payment plans, confirmation emails and member content are unchanged.
- Remove TrainingPathQuiz from Courses and set REIKI_QUIZ_PAUSED in src/lib/reiki-quiz-results.ts. The API returns before parsing, saving, emailing or syncing to Mailchimp. Keep questions, scoring, results and stored submissions intact.
- After the current cohort, Kate intends to build a separately named self-paced Reiki course using the recordings. Do not relaunch the quiz until that course and updated recommendations are ready. No new course name or launch date approved.
- Mailchimp was signed out during the release. Website result emails are paused; any independently configured Mailchimp journeys still need inspection after login.

Release based on production a58b4fb, preserving January sound training, October event changes and protected video releases. Validation: production build; lint (no errors, existing image warnings); 19 focused tests covering pause boundaries, sound checkout, invoice confirmation and video access; local page checks including Writing/header/footer, current Events/detail links, account, current mentorship, waitlist and checkout pages.
