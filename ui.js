// ui.js
// Wires the DOM to the pure functions in eligibility.js and validation.js,
// using the fixed data in data.js. Loaded last, via a plain <script> tag.
// Does not redeclare ACTIVITIES, DEFAULT_PARTICIPANTS, PASS_MARK,
// REQUIRED_CATEGORIES, evaluateParticipant, sortResults, or
// validateParticipants — all of those come from the earlier scripts.

// The board's current, editable participant list. Starts out as a deep
// clone of DEFAULT_PARTICIPANTS so editing it never mutates the constant.
let participants = [];

function cloneParticipants(list) {
  return list.map((participant) => ({
    id: participant.id,
    name: participant.name,
    completedActivityIds: [...participant.completedActivityIds],
  }));
}

// Turns a comma-separated input value like "A01, A02,, A03" into
// ["A01", "A02", "A03"]. An empty/blank field becomes an empty array.
function parseActivityIdsInput(value) {
  return value
    .split(",")
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 0);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- Rendering ---------------------------------------------------------

function renderActivityTable() {
  const tbody = document.getElementById("activity-tbody");
  tbody.innerHTML = ACTIVITIES.map((activity) => `
    <tr>
      <td>${escapeHtml(activity.id)}</td>
      <td>${escapeHtml(activity.name)}</td>
      <td><span class="category-tag">${escapeHtml(activity.category)}</span></td>
      <td>${activity.points}</td>
    </tr>
  `).join("");
}

// Rebuilds the participant table from the current `participants` array.
// Each input edits `participants` directly, so Evaluate/Reset always read
// whatever is currently on screen.
function renderParticipantTable() {
  const tbody = document.getElementById("participant-tbody");
  tbody.innerHTML = "";

  participants.forEach((participant, index) => {
    const tr = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.className = "col-id";
    const idInput = document.createElement("input");
    idInput.type = "text";
    idInput.value = participant.id;
    idInput.setAttribute("aria-label", `Participant ${index + 1} ID`);
    idInput.addEventListener("input", () => {
      participants[index].id = idInput.value;
    });
    idCell.appendChild(idInput);

    const nameCell = document.createElement("td");
    nameCell.className = "col-name";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = participant.name;
    nameInput.setAttribute("aria-label", `Participant ${index + 1} name`);
    nameInput.addEventListener("input", () => {
      participants[index].name = nameInput.value;
    });
    nameCell.appendChild(nameInput);

    const activitiesCell = document.createElement("td");
    activitiesCell.className = "col-activities";
    const activitiesInput = document.createElement("input");
    activitiesInput.type = "text";
    activitiesInput.value = participant.completedActivityIds.join(", ");
    activitiesInput.setAttribute("aria-label", `Participant ${index + 1} completed activities`);
    activitiesInput.addEventListener("input", () => {
      participants[index].completedActivityIds = parseActivityIdsInput(activitiesInput.value);
    });
    activitiesCell.appendChild(activitiesInput);

    tr.appendChild(idCell);
    tr.appendChild(nameCell);
    tr.appendChild(activitiesCell);
    tbody.appendChild(tr);
  });
}

function renderErrors(errors) {
  const area = document.getElementById("error-area");
  if (!errors || errors.length === 0) {
    area.innerHTML = "";
    return;
  }

  const items = errors.map((error) => `
    <li><code>${escapeHtml(error.type)}</code> — participant
      <strong>${escapeHtml(error.participantId)}</strong>,
      value <code>${escapeHtml(error.value)}</code></li>
  `).join("");

  area.innerHTML = `
    <div class="error-box">
      <h2>Fix these before evaluating</h2>
      <ul>${items}</ul>
    </div>
  `;
}

function renderSummary(results) {
  const area = document.getElementById("summary-area");
  if (!results) {
    area.innerHTML = "";
    return;
  }

  const eligibleCount = results.filter((result) => result.eligible).length;
  const ineligibleCount = results.length - eligibleCount;

  area.innerHTML = `
    <div class="card">
      <h2>Summary</h2>
      <div class="summary-counts">
        <div class="summary-stat eligible">
          <span class="value">${eligibleCount}</span>
          <span class="label">Eligible</span>
        </div>
        <div class="summary-stat ineligible">
          <span class="value">${ineligibleCount}</span>
          <span class="label">Ineligible</span>
        </div>
      </div>
    </div>
  `;
}

function renderResults(results) {
  const area = document.getElementById("results-area");
  if (!results) {
    area.innerHTML = "";
    return;
  }

  if (results.length === 0) {
    area.innerHTML = `<div class="card"><p class="empty-note">No participants to evaluate.</p></div>`;
    return;
  }

  const cards = results.map((result) => {
    const statusClass = result.eligible ? "eligible" : "ineligible";
    const statusLabel = result.eligible ? "Eligible" : "Ineligible";

    const categoryTags = REQUIRED_CATEGORIES.map((category) => {
      const covered = result.categoriesCovered.has(category);
      return `<span class="category-tag${covered ? "" : " missing"}">${escapeHtml(category)}</span>`;
    }).join(" ");

    const reasonsHtml = result.reasons.length > 0
      ? `<ul class="failure-reasons">${result.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>`
      : "";

    return `
      <div class="result-card ${statusClass}">
        <div class="result-head">
          <span class="who">${escapeHtml(result.name)} <span class="pid">${escapeHtml(result.participantId)}</span></span>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="result-detail"><span class="points">${result.totalPoints} pts</span> · needs ${PASS_MARK}+</div>
        <div class="categories-covered">${categoryTags}</div>
        ${reasonsHtml}
      </div>
    `;
  }).join("");

  area.innerHTML = `<div class="card"><h2>Results</h2>${cards}</div>`;
}

// --- Actions -------------------------------------------------------------

function evaluateAll() {
  const errors = validateParticipants(participants, ACTIVITIES);

  if (errors.length > 0) {
    renderErrors(errors);
    renderSummary(null);
    renderResults(null);
    return; // do not evaluate while there are input errors
  }

  renderErrors([]);
  const results = participants.map((participant) => evaluateParticipant(participant, ACTIVITIES));
  const sorted = sortResults(results);
  renderSummary(sorted);
  renderResults(sorted);
}

function resetAll() {
  participants = cloneParticipants(DEFAULT_PARTICIPANTS);
  renderParticipantTable();
  renderErrors([]);
  renderSummary(null);
  renderResults(null);
}

// --- Wire up ---------------------------------------------------------

document.getElementById("evaluate-btn").addEventListener("click", evaluateAll);
document.getElementById("reset-btn").addEventListener("click", resetAll);

renderActivityTable();
resetAll(); 