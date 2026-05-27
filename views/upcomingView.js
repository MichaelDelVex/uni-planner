import { getAssessments } from "../core/store.js";
import { formatDisplayDate, sortByDueDate } from "./dateFormat.js";

export function renderUpcomingView() {
  const items = [...getAssessments()]
    .sort(sortByDueDate);

  return `
    <h2>Upcoming</h2>

    ${items.map(a => `
      <div class="card">
        <strong>${a.title}</strong>
        <div>${formatDisplayDate(a.dueDate)}</div>
      </div>
    `).join("")}
  `;
}
