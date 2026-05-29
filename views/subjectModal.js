import {
  getSubjectById,
  updateSubject
} from "../core/store.js";
import { renderColorOptions } from "./subjectColors.js";

let modalState = null;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function openEditSubjectModal(subjectId) {
  modalState = { subjectId };
}

export function closeSubjectModal() {
  modalState = null;
}

export function hasSubjectModal() {
  return Boolean(modalState);
}

export async function saveSubjectModal(form) {
  if (!modalState) return;

  const fields = form.elements;
  const code = fields.namedItem("code").value.trim();
  const name = fields.namedItem("name").value.trim();
  const color = fields.namedItem("color").value;

  if (!code || !name) return;

  await updateSubject(modalState.subjectId, {
    code,
    name,
    color
  });

  closeSubjectModal();
}

export function renderSubjectModal() {
  if (!modalState) return "";

  const subject = getSubjectById(modalState.subjectId);

  if (!subject) {
    closeSubjectModal();
    return "";
  }

  return `
    <div class="modal-backdrop" data-action="close-subject-modal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="subject-modal-title">
        <form data-form="subject-modal">
          <div class="modal-header">
            <h2 id="subject-modal-title">Edit class</h2>
            <button class="icon-button" type="button" data-action="close-subject-modal" aria-label="Close">x</button>
          </div>

          <label>
            <span>Unit code</span>
            <input name="code" value="${escapeHtml(subject.code || "")}" required />
          </label>

          <label>
            <span>Class name</span>
            <input name="name" value="${escapeHtml(subject.name || "")}" required />
          </label>

          <div class="form-field">
            <span>Class color</span>
            ${renderColorOptions(subject.color)}
          </div>

          <div class="modal-actions">
            <div class="modal-actions-main">
              <button class="secondary-button" type="button" data-action="close-subject-modal">Cancel</button>
              <button type="submit">Save</button>
            </div>
          </div>
        </form>
      </section>
    </div>
  `;
}
