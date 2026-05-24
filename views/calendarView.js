import {
  getAssessments,
  getSubjectById
} from "../core/store.js";

function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const startDay = first.getDay(); // 0 = Sunday
  const daysInMonth = last.getDate();

  const cells = [];

  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const iso = date.toISOString().split("T")[0];
    cells.push(iso);
  }

  return cells;
}

export function renderCalendarView() {
  const assessments = getAssessments();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const days = getMonthMatrix(year, month);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const html = `
    <h2>Calendar</h2>

    <div class="calendar-grid">
      ${weekdays.map(day => `<div class="cal-weekday">${day}</div>`).join("")}
      ${days.map(date => {
        if (!date) return `<div class="cal-cell empty"></div>`;

        const items = assessments.filter(a => a.dueDate === date);

        return `
          <div class="cal-cell" data-action="new-assignment" data-due-date="${date}">
            <div class="cal-date">${date.split("-")[2]}</div>

            <div class="cal-items">
              ${items.map(item => {
                const subject = getSubjectById(item.subjectId);

                return `
                  <div
                    class="cal-item"
                    data-action="edit-assignment"
                    data-assessment-id="${item.id}"
                    style="border-left: 3px solid ${subject?.color || "#64748b"}; padding-left: 6px;"
                  >
                    ${item.title}
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;

  return html;
}
