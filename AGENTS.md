# Project Writing Style

Apply these rules to all user-facing website copy:

- Do not use em dashes. Rewrite the sentence or use periods, commas, colons or parentheses where appropriate.
- Do not use Oxford commas. In a list of three or more items, do not place a comma directly before "and."
- If either rule would make a sentence confusing or ambiguous, rewrite the sentence for clarity.

# Deployment Safeguards

- Preserve the `/writing` page and the `Writing` link in the shared header during all future updates and deployments. Do not add Writing to the footer.
- Before publishing changes to the Courses page or Reiki quiz, verify that `/writing` loads, the header link remains present and the footer does not include a Writing link.
- Before publishing any Courses page or Reiki quiz changes, refresh the latest production branch and reconcile all newer production updates into the release. Never deploy the older local preview state over newer live pages.
- After reconciliation, verify the current Events page, event detail links, account access, checkout, confirmation emails, Writing page, Courses page and Reiki quiz before publishing.

