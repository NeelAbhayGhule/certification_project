// data.js
// Fixed reference data for the College Event Certificate Eligibility Board.
// Plain constants only — no UI, no evaluation logic. Loaded via a plain
// <script> tag before the rest of the app, so these are simple globals.

// The fixed activity table. Never edited by the user at runtime.
// category is one of "LEARN", "BUILD", "SHARE".
const ACTIVITIES = [
  { id: "A01", name: "Emerging Tech Talk", category: "LEARN", points: 2 },
  { id: "A02", name: "Soldering Mini Lab", category: "BUILD", points: 3 },
  { id: "A03", name: "Project Pitch Circle", category: "SHARE", points: 2 },
  { id: "A04", name: "Open Source Clinic", category: "BUILD", points: 2 },
];
// Required categories, in the exact order failure reasons must be listed.
const REQUIRED_CATEGORIES = ["LEARN", "BUILD", "SHARE"];

// Minimum total points required for eligibility.
const PASS_MARK = 6;

// The five default participant records, restored whenever the board is reset.
// completedActivityIds lists the activity IDs each participant has finished;
// each entry represents one completed participation.
const DEFAULT_PARTICIPANTS = [
  { id: "C01", name: "Asha", completedActivityIds: ["A01", "A02", "A03"] },
  { id: "C02", name: "Bilal", completedActivityIds: ["A01", "A03", "A04"] },
  { id: "C03", name: "Chen", completedActivityIds: ["A01", "A02", "A04"] },
  { id: "C04", name: "Divya", completedActivityIds: ["A02", "A03", "A04"] },
  { id: "C05", name: "Eshan", completedActivityIds: ["A01", "A03"] },
];