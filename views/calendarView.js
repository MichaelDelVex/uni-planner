import { getAssessments, getSubjectById } from "../core/store.js";

window._selectedDate = null;

window.setDate = function (date) {
    window._selectedDate = date;

    const title = prompt("Assessment title?");
    if (!title) return;

    const assessments = JSON.parse(localStorage.getItem("assessments") || "[]");

    assessments.push({
        id: Date.now(),
        title,
        subjectId: null,
        dueDate: date,
        weight: 0,
        mark: 0
    });

    localStorage.setItem("assessments", JSON.stringify(assessments));
    location.reload(); // simple refresh for now
};

function getMonthMatrix(year, month) {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const startDay = first.getDay(); // 0-6
    const daysInMonth = last.getDate();

    const cells = [];

    // padding before month starts
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

    const html = `
    <h2>Calendar</h2>

    <div class="calendar-grid">
      ${days.map(date => {
        if (!date) return `<div class="cal-cell empty"></div>`;

        const items = assessments.filter(a => a.dueDate === date);

        return `
          <div class="cal-cell" onclick="setDate('${date}')">
            <div class="cal-date">${date.split("-")[2]}</div>

            <div class="cal-items">
            ${items.map(i => {
                const subject = getSubjectById(i.subjectId);

                return `
                    <div class="cal-item"
                        style="border-left: 3px solid ${subject?.color || '#64748b'}; padding-left: 6px;">
                    ${i.title}
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