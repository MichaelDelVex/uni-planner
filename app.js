import { renderSubjectsView } from "./views/subjectsView.js";
import { renderCalendarView } from "./views/calendarView.js";
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

let currentView = "calendar";
let currentUser = null;

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

  if (action === "close-assignment-modal") {
    closeAssignmentModal();
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
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !hasAssignmentModal()) return;

  closeAssignmentModal();
  render();
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
