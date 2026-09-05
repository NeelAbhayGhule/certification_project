# AI Interaction Log — P12 Certificate Eligibility Board

## Approach
I deliberately built this in stages rather than asking for the whole app
at once, so I could verify each layer before moving on. Logic first, UI
last — all the contract rules live in the logic, and they're much easier
to test in the console than through a half-built screen.

Tool used: Claude.

---

## Stage 1 — Data structures
[prompt]

**Outcome:** Got the activity and participant constants.
**My change:** The generated file had no constant for the category order
or the pass mark. Since failure reasons must always be listed
LEARN → BUILD → SHARE, I added REQUIRED_CATEGORIES so the ordering comes
from data rather than being hardcoded in the logic, and PASS_MARK so the
threshold lives in one place.

---

## Stage 2 — Eligibility logic
[prompt]

**Constraint I added:** "Evaluate both requirements fully — don't stop at
the first failure." Without this the model would likely have returned early
on the first missing category, which breaks C05 (needs both a missing
category and the points reason).

**Verified against the built-in oracle:** totals came out 7, 6, 7, 7, 4
with C01 and C02 eligible, matching the problem statement exactly.

**Issue found:** PASS_MARK was declared in both data.js and eligibility.js.
With plain script tags all files share one global scope, so a duplicate
const is a SyntaxError and the whole page fails to render. Fixed by making
data.js the single source of truth for constants.

---

## Stage 3 — Validation
[prompt]

**Design decision:** Validation is a separate module from evaluation, and
it gates it — if validation fails, evaluation never runs. This matters
because evaluateParticipant trusts its input: I tested a duplicate A01 and
it silently returned 9 points instead of erroring. Keeping the gate means
bad data can't reach the evaluator.

---

## Stage 4 — UI
[prompt]

**Iteration:** The first version left previous results on screen after
editing an input, so the displayed results no longer matched the inputs.
The contract requires the screen to stay synchronized, so I added a single
clearOutput() function called from every input handler.

**Second fix:** Participant IDs and names weren't being trimmed. I trim on
Evaluate rather than on keystroke — trimming in the input handler would
stop the user typing spaces inside a name at all.