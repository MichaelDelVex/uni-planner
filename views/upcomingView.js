import { getAssessments } from "../core/store.js";

export function renderUpcomingView() {
  const items = getAssessments()
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return `
    <h2>Upcoming</h2>

    ${items.map(a => `
      <div class="card">
        <strong>${a.title}</strong>
        <div>${a.dueDate}</div>
      </div>
    `).join("")}
  `;
}