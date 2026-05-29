import {
  getSubjects,
  getAssessments,
  addSubject,
  addAssessment
} from "../core/store.js";
import {
  formatAssignmentType,
  formatDisplayDate,
  formatTimeRange,
  isClassType,
  isGradeType,
  sortByDueDate
} from "./dateFormat.js";

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

  if (!subjectId || !title || !dueDate) return;

  const assessment = {
    subjectId,
    title,
    type,
    dueDate
  };

  if (isGradeType(type)) {
    assessment.weight = Number(fields.namedItem("weight").value || 0);
    assessment.mark = Number(fields.namedItem("mark").value || 0);
  }

  if (isClassType(type)) {
    assessment.startTime = fields.namedItem("startTime").value;
    assessment.endTime = fields.namedItem("endTime").value;
    assessment.location = fields.namedItem("location").value.trim();
  }

  await addAssessment(assessment);
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

      <select name="type" data-action="assignment-type-change">
        <option value="assignment">Assignment</option>
        <option value="exam">Exam</option>
        <option value="quiz">Quiz</option>
        <option value="class">Class</option>
        <option value="placement">Placement</option>
        <option value="todo">Todo</option>
        <option value="other">Other</option>
      </select>

      <input name="dueDate" type="date" />

      <div class="form-grid">
        <label data-field-group="grade">
          <span>Weight %</span>
          <input name="weight" type="number" placeholder="Optional" />
        </label>

        <label data-field-group="grade">
          <span>Mark %</span>
          <input name="mark" type="number" placeholder="Optional" />
        </label>
      </div>

      <div class="form-grid is-hidden" data-field-group="class">
        <label>
          <span>Start time</span>
          <input name="startTime" type="time" />
        </label>

        <label>
          <span>End time</span>
          <input name="endTime" type="time" />
        </label>

        <label>
          <span>Location</span>
          <input name="location" placeholder="Room, campus, online" />
        </label>
      </div>

      <button type="submit">Add Item</button>
    </form>

    <h3>Your Subjects</h3>

    ${subjects.length === 0 ? `
      <div class="empty-state">
        <strong>No subjects yet</strong>
        <div class="muted">Add your first subject above to start planning classes and assessments.</div>
      </div>
    ` : subjects.map(s => {
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
                ${isClassType(a.type) && (formatTimeRange(a.startTime, a.endTime) || a.location)
                  ? `<div class="muted">${[formatTimeRange(a.startTime, a.endTime), a.location].filter(Boolean).join(" · ")}</div>`
                  : ""
                }
                ${isGradeType(a.type)
                  ? `<div class="muted">Weight: ${a.weight || 0}% · Mark: ${a.mark || 0}%</div>`
                  : ""
                }
              </div>
            `).join("") || `<div class="muted">No items yet</div>`}
          </div>
        </div>
      `;
    }).join("")}
  `;
}
