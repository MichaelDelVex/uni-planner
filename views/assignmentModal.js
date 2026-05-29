import {
  addAssessment,
  deleteAssessment,
  getAssessmentById,
  getSubjects,
  updateAssessment
} from "../core/store.js";
import { formatAssignmentType, isClassType, isGradeType } from "./dateFormat.js";

let modalState = null;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeNumber(value) {
  if (value === "") return 0;

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getFormData(form) {
  const fields = form.elements;
  const type = fields.namedItem("type").value;
  const assessment = {
    title: fields.namedItem("title").value.trim(),
    subjectId: fields.namedItem("subjectId").value || null,
    type,
    dueDate: fields.namedItem("dueDate").value
  };

  if (isGradeType(type)) {
    assessment.weight = normalizeNumber(fields.namedItem("weight").value);
    assessment.mark = normalizeNumber(fields.namedItem("mark").value);
  }

  if (isClassType(type)) {
    assessment.startTime = fields.namedItem("startTime").value;
    assessment.endTime = fields.namedItem("endTime").value;
    assessment.location = fields.namedItem("location").value.trim();
  }

  return assessment;
}

export function openNewAssignmentModal(defaults = {}) {
  modalState = {
    mode: "new",
    defaults
  };
}

export function openEditAssignmentModal(assessmentId) {
  modalState = {
    mode: "edit",
    assessmentId
  };
}

export function closeAssignmentModal() {
  modalState = null;
}

export function hasAssignmentModal() {
  return Boolean(modalState);
}

export async function saveAssignmentModal(form) {
  if (!modalState) return;

  const assessment = getFormData(form);
  if (!assessment.title || !assessment.dueDate) return;

  if (modalState.mode === "edit") {
    await updateAssessment(modalState.assessmentId, assessment);
  } else {
    await addAssessment(assessment);
  }

  closeAssignmentModal();
}

export async function deleteAssignmentModal() {
  if (!modalState || modalState.mode !== "edit") return;

  await deleteAssessment(modalState.assessmentId);
  closeAssignmentModal();
}

export function renderAssignmentModal() {
  if (!modalState) return "";

  const subjects = getSubjects();
  const assessment = modalState.mode === "edit"
    ? getAssessmentById(modalState.assessmentId)
    : modalState.defaults;

  if (!assessment) {
    closeAssignmentModal();
    return "";
  }

  const selectedSubjectId = assessment.subjectId || "";
  const selectedType = assessment.type || "assignment";
  const title = modalState.mode === "edit" ? "Edit item" : "Add item";
  const showGradeFields = isGradeType(selectedType);
  const showClassFields = isClassType(selectedType);

  return `
    <div class="modal-backdrop" data-action="close-assignment-modal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="assignment-modal-title">
        <form data-form="assignment-modal">
          <div class="modal-header">
            <h2 id="assignment-modal-title">${title}</h2>
            <button class="icon-button" type="button" data-action="close-assignment-modal" aria-label="Close">x</button>
          </div>

          <label>
            <span>Title</span>
            <input name="title" value="${escapeHtml(assessment.title || "")}" required />
          </label>

          <label>
            <span>Subject</span>
            <select name="subjectId">
              <option value="">No subject</option>
              ${subjects.map(subject => `
                <option value="${subject.id}" ${subject.id === selectedSubjectId ? "selected" : ""}>
                  ${escapeHtml(subject.code)} - ${escapeHtml(subject.name)}
                </option>
              `).join("")}
            </select>
          </label>

          <label>
            <span>Type</span>
            <select name="type" data-action="assignment-type-change">
              ${["assignment", "exam", "quiz", "class", "placement", "todo", "other"].map(type => `
                <option value="${type}" ${type === selectedType ? "selected" : ""}>${formatAssignmentType(type)}</option>
              `).join("")}
            </select>
          </label>

          <div class="form-grid">
            <label>
              <span>Due date</span>
              <input name="dueDate" type="date" value="${escapeHtml(assessment.dueDate || "")}" required />
            </label>

            <label class="${showGradeFields ? "" : "is-hidden"}" data-field-group="grade">
              <span>Weight %</span>
              <input name="weight" type="number" min="0" max="100" step="0.01" value="${assessment.weight ?? 0}" />
            </label>

            <label class="${showGradeFields ? "" : "is-hidden"}" data-field-group="grade">
              <span>Mark %</span>
              <input name="mark" type="number" min="0" max="100" step="0.01" value="${assessment.mark ?? 0}" />
            </label>
          </div>

          <div class="form-grid ${showClassFields ? "" : "is-hidden"}" data-field-group="class">
            <label>
              <span>Start time</span>
              <input name="startTime" type="time" value="${escapeHtml(assessment.startTime || "")}" />
            </label>

            <label>
              <span>End time</span>
              <input name="endTime" type="time" value="${escapeHtml(assessment.endTime || "")}" />
            </label>

            <label>
              <span>Location</span>
              <input name="location" value="${escapeHtml(assessment.location || "")}" placeholder="Room, campus, online" />
            </label>
          </div>

          <div class="modal-actions">
            ${modalState.mode === "edit"
              ? `<button class="danger-button" type="button" data-action="delete-assignment">Delete</button>`
              : ""
            }
            <div class="modal-actions-main">
              <button class="secondary-button" type="button" data-action="close-assignment-modal">Cancel</button>
              <button type="submit">Save</button>
            </div>
          </div>
        </form>
      </section>
    </div>
  `;
}
