import { getSubjects, addSubject } from "../core/store.js";

const SUBJECT_COLORS = [
  "#60a5fa", // blue
  "#34d399", // green
  "#fbbf24", // yellow
  "#f87171", // red
  "#a78bfa", // purple
  "#fb7185"  // pink
];

function addNewSubject() {
  const code = document.getElementById("subjectCode").value.trim();
  const name = document.getElementById("subjectName").value.trim();

  if (!code || !name) return;

  const color =
    SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];

  subjects.push({
    id: Date.now(),
    code,
    name,
    color
  });

  document.getElementById("subjectCode").value = "";
  document.getElementById("subjectName").value = "";

  save();
}

export function renderSubjectsView() {
  const subjects = getSubjects();

  return `
    <h2>Subjects</h2>

    <input id="s_code" placeholder="Code" />
    <input id="s_name" placeholder="Name" />
    <button onclick="addNewSubject()">Add</button>

    <div>
      ${subjects.map(s => `
        <div class="card">
          <strong>${s.code}</strong>
          <div>${s.name}</div>
        </div>
      `).join("")}
    </div>
  `;
}