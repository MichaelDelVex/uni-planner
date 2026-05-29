import { renderSubjectsView } from "./views/subjectsView.js";
import {
  navigateCalendarMonth,
  navigateCalendarToToday,
  renderCalendarView,
  selectCalendarDate
} from "./views/calendarView.js";
import { renderUpcomingView } from "./views/upcomingView.js";
import { renderGradesView } from "./views/gradesView.js";
import { loadData, clearData } from "./core/store.js";
import { login, logout, observeAuth } from "./core/auth.js";
import {
  addAssignmentFromForm,
  addSubjectFromForm
} from "./views/subjectsView.js";
import {
  closeAssignmentModal,
  deleteAssignmentModal,
  hasAssignmentModal,
  openEditAssignmentModal,
  openNewAssignmentModal,
  renderAssignmentModal,
  saveAssignmentModal
} from "./views/assignmentModal.js";
import {
  closeSubjectModal,
  hasSubjectModal,
  openEditSubjectModal,
  renderSubjectModal,
  saveSubjectModal
} from "./views/subjectModal.js";

let currentView = "calendar";
let currentUser = null;

function isGradeType(type) {
  return ["assignment", "exam", "quiz"].includes(type);
}

function isClassType(type) {
  return ["class", "placement"].includes(type);
}

function updatePlannerItemFields(form, type) {
  const showGradeFields = isGradeType(type);
  const showClassFields = isClassType(type);

  form.querySelectorAll('[data-field-group="grade"]').forEach(field => {
    field.classList.toggle("is-hidden", !showGradeFields);
  });

  form.querySelectorAll('[data-field-group="class"]').forEach(field => {
    field.classList.toggle("is-hidden", !showClassFields);
  });

  if (!showGradeFields) {
    form.elements.namedItem("weight").value = "";
    form.elements.namedItem("mark").value = "";
  }

  if (!showClassFields) {
    form.elements.namedItem("startTime").value = "";
    form.elements.namedItem("endTime").value = "";
    form.elements.namedItem("location").value = "";
  }
}

function switchView(view) {
  currentView = view;
  render();
}

function renderNav() {
  return `
  <div class="nav">
    <button class="${currentView === "subjects" ? "active" : ""}" data-action="switch-view" data-view="subjects">Subjects</button>
    <button class="${currentView === "calendar" ? "active" : ""}" data-action="switch-view" data-view="calendar">Calendar</button>
    <button class="${currentView === "upcoming" ? "active" : ""}" data-action="switch-view" data-view="upcoming">Upcoming</button>
    <button class="${currentView === "grades" ? "active" : ""}" data-action="switch-view" data-view="grades">Grades</button>

    ${currentUser
      ? `<button data-action="logout">Logout</button>`
      : `<button data-action="login">Login</button>`
    }
  </div>
`;
}

function render() {
  const root = document.getElementById("app");

  let viewHTML = "";

  if (currentView === "subjects") viewHTML = renderSubjectsView();
  if (currentView === "calendar") viewHTML = renderCalendarView();
  if (currentView === "upcoming") viewHTML = renderUpcomingView();
  if (currentView === "grades") viewHTML = renderGradesView();

  root.innerHTML = `
    ${renderNav()}
    <div class="view">
      ${viewHTML}
    </div>
    ${renderAssignmentModal()}
    ${renderSubjectModal()}
  `;
}

document.addEventListener("click", async (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const action = actionTarget.dataset.action;
  if (actionTarget.classList.contains("modal-backdrop") && event.target !== actionTarget) return;

  if (action === "switch-view") {
    switchView(actionTarget.dataset.view);
    return;
  }

  if (action === "login") {
    await login();
    return;
  }

  if (action === "logout") {
    await logout();
    return;
  }

  if (action === "calendar-prev-month") {
    navigateCalendarMonth(-1);
    render();
    return;
  }

  if (action === "calendar-next-month") {
    navigateCalendarMonth(1);
    render();
    return;
  }

  if (action === "calendar-today") {
    navigateCalendarToToday();
    render();
    return;
  }

  if (action === "select-calendar-date") {
    selectCalendarDate(actionTarget.dataset.dueDate);
    render();
    return;
  }

  if (action === "new-assignment") {
    openNewAssignmentModal({
      dueDate: actionTarget.dataset.dueDate,
      type: "assignment",
      weight: 0,
      mark: 0
    });
    render();
    return;
  }

  if (action === "edit-assignment") {
    openEditAssignmentModal(actionTarget.dataset.assessmentId);
    render();
    return;
  }

  if (action === "edit-subject") {
    openEditSubjectModal(actionTarget.dataset.subjectId);
    render();
    return;
  }

  if (action === "close-assignment-modal") {
    closeAssignmentModal();
    render();
    return;
  }

  if (action === "close-subject-modal") {
    closeSubjectModal();
    render();
    return;
  }

  if (action === "delete-assignment") {
    await deleteAssignmentModal();
    render();
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!form.dataset.form) return;

  event.preventDefault();

  if (form.dataset.form === "subject") {
    await addSubjectFromForm(form);
    render();
    return;
  }

  if (form.dataset.form === "assignment-quick-add") {
    await addAssignmentFromForm(form);
    render();
    return;
  }

  if (form.dataset.form === "assignment-modal") {
    await saveAssignmentModal(form);
    render();
    return;
  }

  if (form.dataset.form === "subject-modal") {
    await saveSubjectModal(form);
    render();
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.dataset.action !== "assignment-type-change") return;

  updatePlannerItemFields(target.closest("form"), target.value);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (hasAssignmentModal()) {
    closeAssignmentModal();
    render();
    return;
  }

  if (hasSubjectModal()) {
    closeSubjectModal();
    render();
  }
});

observeAuth(async (user) => {
  currentUser = user;

  if (user) {
    await loadData(user.uid);
  } else {
    clearData();
  }

  render();
});
