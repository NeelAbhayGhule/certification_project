I'm building a College Event Certificate Eligibility Board as a single-page app — plain HTML and vanilla JavaScript, no frameworks, no backend, loaded with plain <script> tags so it opens by double-clicking.
Here's the problem statement: [paste the full P12 PDF text]
Don't write any UI or logic yet. Just give me data.js containing the fixed activity table and the five default participants as plain constants. Keep it simple and readable.

Now write `eligibility.js`. It should export a function that takes one participant and the activity list, and returns their total points, the set of categories they covered, whether they're eligible, and their failure reasons.
Rules: eligible requires all three categories (LEARN, BUILD, SHARE) and points >= PASS_MARK. Evaluate both requirements fully — don't stop at the first failure. Failure reasons must be in this exact order: `MISSING_CATEGORY: LEARN`, `MISSING_CATEGORY: BUILD`, `MISSING_CATEGORY: SHARE`, then `POINTS_BELOW_6` if applicable. An eligible participant has no reasons.
Also write a function that sorts results: eligible first, then ineligible, each group sorted by participant ID ascending.
No UI, no validation yet. Use the constants from `data.js`.

Now write validation.js. It takes the participant list and the activity list, and returns an array of errors. Four checks:

INVALID_PARTICIPANT — empty ID or name after trimming
DUPLICATE_PARTICIPANT_ID — two participants share an ID
UNKNOWN_ACTIVITY — an activity ID not in the fixed table
DUPLICATE_PARTICIPATION — the same activity listed twice for one participant
Each error must name the participant and the offending value. Trim all IDs and names before comparing. No UI. Use the constants from data.js — don't redeclare them.
i Have kept the pass_mark and categories in data.js btw

Now write index.html and ui.js — one attractive screen, plain CSS in a <style> tag, no frameworks.
Layout: a read-only activity table (ID, name, category, points); an editable participant table where ID and name are text inputs and completed activities is a comma-separated text input; an Evaluate button and a Reset button; an error area; a results area showing eligible participants first then ineligible, each with total points, categories covered, and failure reasons; and a summary showing counts of eligible and ineligible.
On Evaluate: run validateParticipants first. If there are errors, show them and clear all results and counts, and do not evaluate. Otherwise run evaluateParticipant on each and sortResults.
On Reset: deep-clone DEFAULT_PARTICIPANTS, clear errors, clear results and counts.
Use the existing functions and constants — don't redeclare anything.