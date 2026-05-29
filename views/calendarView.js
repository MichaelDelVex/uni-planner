import {
  getAssessments,
  getSubjectById
} from "../core/store.js";
import { formatAssignmentType, formatDisplayDate, formatTimeRange } from "./dateFormat.js";

let displayedMonth = new Date();
displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
let selectedDate = toLocalIsoDate(new Date());

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

export function navigateCalendarToToday() {
  const today = new Date();
  displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDate = toLocalIsoDate(today);
}

export function selectCalendarDate(date) {
  selectedDate = date;
}

export function renderCalendarView() {
  const assessments = getAssessments();
  const todayIso = toLocalIsoDate(new Date());

  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();

  const days = getMonthMatrix(year, month);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const selectedItems = assessments
    .filter(a => a.dueDate === selectedDate)
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  const html = `
    <div class="calendar-layout">
      <div class="calendar-month-panel">
        <div class="calendar-header">
          <button class="icon-button" type="button" data-action="calendar-prev-month" aria-label="Previous month">&lt;</button>
          <h2>${getCalendarTitle(year, month)}</h2>
          <button class="secondary-button calendar-today-button" type="button" data-action="calendar-today">Today</button>
          <button class="icon-button" type="button" data-action="calendar-next-month" aria-label="Next month">&gt;</button>
        </div>

        <div class="calendar-grid">
          ${weekdays.map(day => `<div class="cal-weekday">${day}</div>`).join("")}
          ${days.map(date => {
            if (!date) return `<div class="cal-cell empty"></div>`;

            const items = assessments.filter(a => a.dueDate === date);
            const isToday = date === todayIso;
            const isSelected = date === selectedDate;

            return `
              <div class="cal-cell ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}" data-action="select-calendar-date" data-due-date="${date}">
                <div class="cal-date">${date.split("-")[2]}</div>

                <div class="cal-items">
                  ${items.map(item => {
                    const subject = getSubjectById(item.subjectId);
                    const subjectColor = subject?.color || "#64748b";

                    return `
                      <div
                        class="cal-item"
                        data-action="edit-assignment"
                        data-assessment-id="${item.id}"
                        style="--subject-color: ${subjectColor}; border-left: 3px solid ${subjectColor}; padding-left: 6px;"
                      >
                        ${item.title}
                      </div>
                    `;
                  }).join("")}
                  ${items.length > 1 ? `<div class="cal-item-count">+${items.length}</div>` : ""}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <section class="day-agenda" aria-label="Selected day items">
        <div class="day-agenda-header">
          <div>
            <h3>${formatDisplayDate(selectedDate)}</h3>
            <div class="muted">${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"}</div>
          </div>
          <button class="small-button" type="button" data-action="new-assignment" data-due-date="${selectedDate}">Add</button>
        </div>

        <div class="day-agenda-list">
          ${selectedItems.length === 0 ? `
            <div class="empty-state">
              <strong>No items this day</strong>
              <div class="muted">Add a class, todo, assignment, or exam for this date.</div>
            </div>
          ` : selectedItems.map(item => {
            const subject = getSubjectById(item.subjectId);
            const subjectColor = subject?.color || "#64748b";
            const timeRange = formatTimeRange(item.startTime, item.endTime);

            return `
              <button class="day-agenda-item" type="button" data-action="edit-assignment" data-assessment-id="${item.id}" style="--subject-color: ${subjectColor};">
                <span class="day-agenda-dot"></span>
                <span>
                  <strong>${item.title}</strong>
                  <span class="muted">${[formatAssignmentType(item.type), subject?.code, timeRange, item.location].filter(Boolean).join(" · ")}</span>
                </span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    </div>
  `;

  return html;
}
