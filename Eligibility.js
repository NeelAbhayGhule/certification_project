// eligibility.js
// Pure eligibility logic for the College Event Certificate Eligibility Board.
// No UI, no input validation — this file only evaluates and sorts records
// that are already assumed to be well-formed (see data.js for the shapes).
// Loaded via a plain <script> tag (no modules), so everything here is just
// a plain global function/constant, in the same style as data.js.

// Evaluates a single participant against the fixed activity list.
//
// participant: { id, name, completedActivityIds } (see data.js)
// activities:  array of { id, category, points } (see data.js)
//
// Returns:
// {
//   participantId,
//   name,
//   totalPoints,        // sum of points for completed activities
//   categoriesCovered,  // Set of categories earned, e.g. Set(["LEARN","BUILD"])
//   eligible,           // true only if all three categories are covered AND
//                       // totalPoints >= PASS_MARK
//   reasons,            // ordered array of failure reason strings; empty
//                       // when eligible
// }
function evaluateParticipant(participant, activities) {
  const activityById = new Map(activities.map((activity) => [activity.id, activity]));

  const categoriesCovered = new Set();
  let totalPoints = 0;

  for (const activityId of participant.completedActivityIds) {
    const activity = activityById.get(activityId);
    if (!activity) continue; // unknown IDs are a validation concern, not this file's job
    categoriesCovered.add(activity.category);
    totalPoints += activity.points;
  }

  // Evaluate both requirements fully — never stop at the first failure.
  const missingCategoryReasons = REQUIRED_CATEGORIES
    .filter((category) => !categoriesCovered.has(category))
    .map((category) => `MISSING_CATEGORY: ${category}`);

  const hasEnoughPoints = totalPoints >= PASS_MARK;
  const reasons = hasEnoughPoints
    ? missingCategoryReasons
    : [...missingCategoryReasons, `POINTS_BELOW_${PASS_MARK}`];

  const eligible = missingCategoryReasons.length === 0 && hasEnoughPoints;

  return {
    participantId: participant.id,
    name: participant.name,
    totalPoints,
    categoriesCovered,
    eligible,
    reasons,
  };
}

// Sorts evaluated results: eligible participants first, then ineligible;
// within each group, ascending by participant ID. Does not mutate its input.
function sortResults(results) {
  return [...results].sort((a, b) => {
    if (a.eligible !== b.eligible) {
      return a.eligible ? -1 : 1;
    }
    return a.participantId.localeCompare(b.participantId);
  });
}