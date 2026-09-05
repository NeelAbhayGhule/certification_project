// validation.js
// Input validation for the College Event Certificate Eligibility Board.
// No UI — this file only inspects participant/activity records and reports
// problems with them. Loaded via a plain <script> tag (no modules), so this
// is just a plain global function, in the same style as data.js and
// eligibility.js. Does not redeclare any constants from data.js.

// Validates a participant list against the fixed activity list.
//
// participants: array of { id, name, completedActivityIds } (see data.js)
// activities:   array of { id, ... } (see data.js)
//
// Returns an array of error objects, one per problem found:
// {
//   type,          // "INVALID_PARTICIPANT" | "DUPLICATE_PARTICIPANT_ID" |
//                  // "UNKNOWN_ACTIVITY" | "DUPLICATE_PARTICIPATION"
//   participantId, // the participant the error belongs to (trimmed ID, or
//                  // a positional label like "(row 3)" when the ID itself
//                  // is the empty/invalid field)
//   value,         // the offending value: "id" or "name" for
//                  // INVALID_PARTICIPANT, otherwise the trimmed ID/activity
//                  // ID that was duplicated or unrecognized
// }
//
// All IDs and names are trimmed before any comparison.
function validateParticipants(participants, activities) {
  const errors = [];
  const knownActivityIds = new Set(activities.map((activity) => activity.id.trim()));
  const seenParticipantIds = new Set();

  participants.forEach((participant, index) => {
    const trimmedId = (participant.id ?? "").trim();
    const trimmedName = (participant.name ?? "").trim();

    // When the ID itself is blank we still need something to name the
    // participant by in the error, so fall back to a positional label.
    const participantLabel = trimmedId || `(row ${index + 1})`;

    if (!trimmedId || !trimmedName) {
      errors.push({
        type: "INVALID_PARTICIPANT",
        participantId: participantLabel,
        value: !trimmedId ? "id" : "name",
      });
    }

    if (trimmedId) {
      if (seenParticipantIds.has(trimmedId)) {
        errors.push({
          type: "DUPLICATE_PARTICIPANT_ID",
          participantId: trimmedId,
          value: trimmedId,
        });
      } else {
        seenParticipantIds.add(trimmedId);
      }
    }

    const seenActivityIds = new Set();
    for (const rawActivityId of participant.completedActivityIds ?? []) {
      const trimmedActivityId = (rawActivityId ?? "").trim();

      if (!knownActivityIds.has(trimmedActivityId)) {
        errors.push({
          type: "UNKNOWN_ACTIVITY",
          participantId: participantLabel,
          value: trimmedActivityId,
        });
        continue; // an unknown ID can't also count as a duplicate of a real one
      }

      if (seenActivityIds.has(trimmedActivityId)) {
        errors.push({
          type: "DUPLICATE_PARTICIPATION",
          participantId: participantLabel,
          value: trimmedActivityId,
        });
      } else {
        seenActivityIds.add(trimmedActivityId);
      }
    }
  });

  return errors;
}