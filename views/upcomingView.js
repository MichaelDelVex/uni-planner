import { getAssessments } from "../core/store.js";
import { formatDisplayDate, formatTimeRange, isBeforeToday, sortByDueDate } from "./dateFormat.js";

export function renderUpcomingView() {
  const items = [...getAssessments()]
    .sort(sortByDueDate);

  return `
    <h2>Upcoming</h2>

    ${items.length === 0 ? `
      <div class="empty-state">
        <strong>No upcoming items</strong>
        <div class="muted">Assignments, exams, and classes will appear here once you add them.</div>
      </div>
    ` : items.map(a => `
      <div class="card upcoming-card ${isBeforeToday(a.dueDate) ? "is-past-due" : ""}">
        <div class="upcoming-card-content">
          <strong>${a.title}</strong>
          <div>${formatDisplayDate(a.dueDate)}</div>
          ${formatTimeRange(a.startTime, a.endTime) || a.location
            ? `<div class="muted">${[formatTimeRange(a.startTime, a.endTime), a.location].filter(Boolean).join(" - ")}</div>`
            : ""
          }
        </div>
      </div>
    `).join("")}
  `;
}
