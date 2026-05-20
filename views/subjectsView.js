import {
  getSubjects,
  getAssessments,
  addSubject,
  addAssessment
} from "../core/store.js";

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

window.addAssignment = async function () {
  const subjectId = document.getElementById("a_subject").value;
  const title = document.getElementById("a_title").value.trim();
  const type = document.getElementById("a_type").value;
  const dueDate = document.getElementById("a_dueDate").value;
  const weight = Number(document.getElementById("a_weight").value || 0);
  const mark = Number(document.getElementById("a_mark").value || 0);

  if (!subjectId || !title || !dueDate) return;

  await addAssessment({
    subjectId,
    title,
    type,
    dueDate,
    weight,
    mark
  });

  render();
};

export function renderSubjectsView() {
  const subjects = getSubjects();
  const assessments = getAssessments();

  return `
    <h2>Subjects</h2>

    <div class="card">
      <h3>Add Subject</h3>
      <input id="s_code" placeholder="Subject code e.g. NUR1001" />
      <input id="s_name" placeholder="Subject name" />
      <button onclick="addSubject()">Add Subject</button>
    </div>

    <div class="card">
      <h3>Add Assignment / Exam / Class</h3>

      <select id="a_subject">
        <option value="">Select subject</option>
        ${subjects.map(s => `
          <option value="${s.id}">${s.code} - ${s.name}</option>
        `).join("")}
      </select>

      <input id="a_title" placeholder="Title e.g. Essay 1" />

      <select id="a_type">
        <option value="assignment">Assignment</option>
        <option value="exam">Exam</option>
        <option value="class">Class</option>
        <option value="quiz">Quiz</option>
        <option value="placement">Placement</option>
        <option value="other">Other</option>
      </select>

      <input id="a_dueDate" type="date" />

      <input id="a_weight" type="number" placeholder="Weight % optional" />
      <input id="a_mark" type="number" placeholder="Mark % optional" />

      <button onclick="addAssignment()">Add Item</button>
    </div>

    <h3>Your Subjects</h3>

    ${subjects.map(s => {
      const subjectItems = assessments.filter(a => a.subjectId === s.id);

      return `
        <div class="card" style="border-left: 4px solid ${s.color}">
          <strong>${s.code}</strong>
          <div class="muted">${s.name}</div>

          <div class="list">
            ${subjectItems.map(a => `
              <div class="item">
                <strong>${a.title}</strong>
                <div class="muted">${a.type} · Due ${a.dueDate}</div>
                <div class="muted">Weight: ${a.weight || 0}% · Mark: ${a.mark || 0}%</div>
              </div>
            `).join("") || `<div class="muted">No items yet</div>`}
          </div>
        </div>
      `;
    }).join("")}
  `;
}