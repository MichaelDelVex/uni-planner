import {
  getAssessments,
  getSubjectById
} from "../core/store.js";

let displayedMonth = new Date();
displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function toLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCalendarTitle(year, month) {
  const currentYear = new Date().getFullYear();
  const label = monthNames[month];

  return year === currentYear ? label : `${label} ${year}`;
}

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
    const iso = toLocalIsoDate(date);
    cells.push(iso);
  }

  return cells;
}

export function navigateCalendarMonth(offset) {
  displayedMonth = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth() + offset,
    1
  );
}

export function renderCalendarView() {
  const assessments = getAssessments();

  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();

  const days = getMonthMatrix(year, month);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const html = `
    <div class="calendar-header">
      <button class="icon-button" type="button" data-action="calendar-prev-month" aria-label="Previous month">&lt;</button>
      <h2>${getCalendarTitle(year, month)}</h2>
      <button class="icon-button" type="button" data-action="calendar-next-month" aria-label="Next month">&gt;</button>
    </div>

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
