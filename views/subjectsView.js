import {
  getSubjects,
  getAssessments,
  addSubject,
  addAssessment
} from "../core/store.js";
import { formatAssignmentType, formatDisplayDate, sortByDueDate } from "./dateFormat.js";

const SUBJECT_COLORS = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#fb7185"
];

export async function addSubjectFromForm(form) {
  const fields = form.elements;
  const code = fields.namedItem("code").value.trim();
  const name = fields.namedItem("name").value.trim();

  if (!code || !name) return;

  const subjects = getSubjects();

  await addSubject({
    code,
    name,
    color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length]
  });
}

export async function addAssignmentFromForm(form) {
  const fields = form.elements;
  const subjectId = fields.namedItem("subjectId").value;
  const title = fields.namedItem("title").value.trim();
  const type = fields.namedItem("type").value;
  const dueDate = fields.namedItem("dueDate").value;
  const weight = Number(fields.namedItem("weight").value || 0);
  const mark = Number(fields.namedItem("mark").value || 0);

  if (!subjectId || !title || !dueDate) return;

  await addAssessment({
    subjectId,
    title,
    type,
    dueDate,
    weight,
    mark
  });
}

export function renderSubjectsView() {
  const subjects = getSubjects();
  const assessments = getAssessments();

  return `
    <h2>Subjects</h2>

    <form class="card" data-form="subject">
      <h3>Add Subject</h3>
      <input name="code" placeholder="Subject code e.g. NUR1001" />
      <input name="name" placeholder="Subject name" />
      <button type="submit">Add Subject</button>
    </form>

    <form class="card" data-form="assignment-quick-add">
      <h3>Add Assignment / Exam / Class</h3>

      <select name="subjectId">
        <option value="">Select subject</option>
        ${subjects.map(s => `
          <option value="${s.id}">${s.code} - ${s.name}</option>
        `).join("")}
      </select>

      <input name="title" placeholder="Title e.g. Essay 1" />

      <select name="type">
        <option value="assignment">Assignment</option>
        <option value="exam">Exam</option>
        <option value="class">Class</option>
        <option value="quiz">Quiz</option>
        <option value="placement">Placement</option>
        <option value="other">Other</option>
      </select>

      <input name="dueDate" type="date" />

      <input name="weight" type="number" placeholder="Weight % optional" />
      <input name="mark" type="number" placeholder="Mark % optional" />

      <button type="submit">Add Item</button>
    </form>

    <h3>Your Subjects</h3>

    ${subjects.map(s => {
      const subjectItems = assessments
        .filter(a => a.subjectId === s.id)
        .sort(sortByDueDate);

      return `
        <div class="card" style="border-left: 4px solid ${s.color}">
          <div class="item-header">
            <div>
              <strong>${s.code}</strong>
              <div class="muted">${s.name}</div>
            </div>
            <button class="small-button" type="button" data-action="edit-subject" data-subject-id="${s.id}">Edit</button>
          </div>

          <div class="list">
            ${subjectItems.map(a => `
              <div class="item">
                <div class="item-header">
                  <strong>${a.title}</strong>
                  <button class="small-button" type="button" data-action="edit-assignment" data-assessment-id="${a.id}">Edit</button>
                </div>
                <div class="muted">${formatAssignmentType(a.type)} · Due ${formatDisplayDate(a.dueDate)}</div>
                <div class="muted">Weight: ${a.weight || 0}% · Mark: ${a.mark || 0}%</div>
              </div>
            `).join("") || `<div class="muted">No items yet</div>`}
          </div>
        </div>
      `;
    }).join("")}
  `;
}
