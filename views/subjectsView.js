import { addSubject, getSubjects } from "../core/store.js";

const SUBJECT_COLORS = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#fb7185"
];

window.addSubject = async function () {
  const code = document.getElementById("s_code").value.trim();
  const name = document.getElementById("s_name").value.trim();

  if (!code || !name) return;

  const subjects = getSubjects();

  await addSubject({
    code,
    name,
    color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length]
  });

  render();
};

export function renderSubjectsView() {
  const subjects = getSubjects();

  return `
    <h2>Subjects</h2>

    <input id="s_code" placeholder="Code" />
    <input id="s_name" placeholder="Name" />
    <button onclick="addSubject()">Add</button>

    <div>
      ${subjects.map(s => `
        <div class="card" style="border-left: 4px solid ${s.color}">
          <strong>${s.code}</strong>
          <div>${s.name}</div>
        </div>
      `).join("")}
    </div>
  `;
}