import { getSubjects, addSubject } from "../core/store.js";

window.addSubject = function () {
  const code = document.getElementById("s_code").value;
  const name = document.getElementById("s_name").value;

  addSubject({
    id: Date.now(),
    code,
    name,
    color: "#3b82f6"
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
        <div class="card">
          <strong>${s.code}</strong>
          <div>${s.name}</div>
        </div>
      `).join("")}
    </div>
  `;
}