import { renderSubjectsView } from "./views/subjectsView.js";
import { renderCalendarView } from "./views/calendarView.js";
import { renderUpcomingView } from "./views/upcomingView.js";
import { renderGradesView } from "./views/gradesView.js";
import { loadData } from "./core/store.js";

import { login, logout, observeAuth } from "./core/auth.js";

let currentView = "calendar";
let currentUser = null;

window.login = login;
window.logout = logout;

window.switchView = function (view) {
  currentView = view;
  render();
};

function renderNav() {
  return `
  <div class="nav">
    <button onclick="switchView('subjects')">Subjects</button>
    <button onclick="switchView('calendar')">Calendar</button>
    <button onclick="switchView('upcoming')">Upcoming</button>
    <button onclick="switchView('grades')">Grades</button>

    ${currentUser
      ? `<button onclick="logout()">Logout</button>`
      : `<button onclick="login()">Login</button>`
    }
  </div>
`;
}

window.render = function render() {
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
  `;
}

observeAuth(async (user) => {
  console.log("AUTH USER:", user);

  currentUser = user;

  if (user) {
    await loadData(user.uid);
  }

  render();
});