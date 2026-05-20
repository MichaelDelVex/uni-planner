import { getAssessments } from "../core/store.js";

export function renderCalendarView() {
  const assessments = getAssessments();

  return `
    <h2>Calendar</h2>

    <div class="card">
      ${assessments.map(a => `
        <div>
          ${a.title} - ${a.dueDate}
        </div>
      `).join("")}
    </div>
  `;
}