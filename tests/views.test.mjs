import assert from "node:assert/strict";
import test from "node:test";
import { loadBrowserModule, makeForm } from "./helpers/moduleLoader.mjs";

const subjectsPath = new URL("../views/subjectsView.js", import.meta.url);
const calendarPath = new URL("../views/calendarView.js", import.meta.url);
const upcomingPath = new URL("../views/upcomingView.js", import.meta.url);
const gradesPath = new URL("../views/gradesView.js", import.meta.url);
const modalPath = new URL("../views/assignmentModal.js", import.meta.url);
const subjectModalPath = new URL("../views/subjectModal.js", import.meta.url);

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function isoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplayDate(isoDate = "") {
  const [year, month, day] = isoDate.split("-");

  if (!year || !month || !day) return isoDate;

  return `${day}/${month}/${year}`;
}

function sortByDueDate(a, b) {
  return a.dueDate.localeCompare(b.dueDate);
}

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isBeforeToday(isoDate = "") {
  return isoDate < getTodayIsoDate();
}

function formatAssignmentType(type = "") {
  if (!type) return "";

  return `${type.slice(0, 1).toUpperCase()}${type.slice(1)}`;
}

function isGradeType(type = "") {
  return ["assignment", "exam", "quiz"].includes(type);
}

function isClassType(type = "") {
  return ["class", "placement"].includes(type);
}

function formatTimeRange(startTime = "", endTime = "") {
  if (startTime && endTime) return `${startTime}-${endTime}`;
  if (startTime) return startTime;
  if (endTime) return `Until ${endTime}`;

  return "";
}

test("subjects view renders add forms and edits assignments without globals", async () => {
  const addedSubjects = [];
  const addedAssessments = [];
  const subjects = [{ id: "s1", code: "NUR1001", name: "Nursing", color: "#60a5fa" }];
  const assessments = [{ id: "a1", title: "Essay", subjectId: "s1", dueDate: "2026-06-01", type: "assignment", weight: 40, mark: 72 }];

  const view = await loadBrowserModule(subjectsPath, {
    getSubjects: () => subjects,
    getAssessments: () => assessments,
    addSubject: async subject => addedSubjects.push(subject),
    addAssessment: async assessment => addedAssessments.push(assessment),
    formatAssignmentType,
    formatDisplayDate,
    formatTimeRange,
    isClassType,
    isGradeType,
    sortByDueDate
  }, ["renderSubjectsView", "addSubjectFromForm", "addAssignmentFromForm"]);

  const html = view.renderSubjectsView();
  assert.match(html, /data-form="subject"/);
  assert.match(html, /data-form="assignment-quick-add"/);
  assert.match(html, /data-action="edit-subject"/);
  assert.match(html, /data-action="edit-assignment"/);
  assert.match(html, /Assignment · Due 01\/06\/2026/);
  assert.match(html, /Due 01\/06\/2026/);
  assert.doesNotMatch(html, /onclick=/);

  await view.addSubjectFromForm(makeForm({ code: "PSY100", name: "Psychology" }));
  assert.deepEqual(plain(addedSubjects[0]), { code: "PSY100", name: "Psychology", color: "#34d399" });

  await view.addAssignmentFromForm(makeForm({
    subjectId: "s1",
    title: "Quiz",
    type: "quiz",
    dueDate: "2026-06-08",
    weight: "10",
    mark: "95"
  }));
  assert.deepEqual(plain(addedAssessments[0]), {
    subjectId: "s1",
    title: "Quiz",
    type: "quiz",
    dueDate: "2026-06-08",
    weight: 10,
    mark: 95
  });

  await view.addAssignmentFromForm(makeForm({
    subjectId: "s1",
    title: "Lecture",
    type: "class",
    dueDate: "2026-06-09",
    weight: "20",
    mark: "80",
    startTime: "11:00",
    endTime: "12:00",
    location: "Campus"
  }));
  assert.deepEqual(plain(addedAssessments[1]), {
    subjectId: "s1",
    title: "Lecture",
    type: "class",
    dueDate: "2026-06-09",
    startTime: "11:00",
    endTime: "12:00",
    location: "Campus"
  });
});

test("subjects and upcoming views display dd/mm/yyyy dates in due date order", async () => {
  const assessments = [
    { id: "a1", title: "Latest", subjectId: "s1", dueDate: "2026-06-20" },
    { id: "a2", title: "Earliest", subjectId: "s1", dueDate: "2026-06-01" }
  ];

  const subjectsView = await loadBrowserModule(subjectsPath, {
    getSubjects: () => [{ id: "s1", code: "NUR1001", name: "Nursing", color: "#60a5fa" }],
    getAssessments: () => assessments,
    addSubject: async () => {},
    addAssessment: async () => {},
    formatAssignmentType,
    formatDisplayDate,
    formatTimeRange,
    isClassType,
    isGradeType,
    sortByDueDate
  }, ["renderSubjectsView"]);

  const subjectHtml = subjectsView.renderSubjectsView();
  assert.ok(subjectHtml.indexOf("Earliest") < subjectHtml.indexOf("Latest"));
  assert.match(subjectHtml, /Due 01\/06\/2026/);
  assert.match(subjectHtml, /Due 20\/06\/2026/);

  const upcomingView = await loadBrowserModule(upcomingPath, {
    getAssessments: () => assessments,
    formatDisplayDate,
    formatTimeRange,
    isBeforeToday,
    sortByDueDate
  }, ["renderUpcomingView"]);

  const upcomingHtml = upcomingView.renderUpcomingView();
  assert.ok(upcomingHtml.indexOf("Earliest") < upcomingHtml.indexOf("Latest"));
  assert.match(upcomingHtml, /01\/06\/2026/);
  assert.match(upcomingHtml, /20\/06\/2026/);
});

test("upcoming view marks items due before today", async () => {
  const now = new Date();
  const pastDate = isoDate(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  const upcomingView = await loadBrowserModule(upcomingPath, {
    getAssessments: () => [{ id: "a1", title: "Past essay", dueDate: pastDate }],
    formatDisplayDate,
    formatTimeRange,
    isBeforeToday,
    sortByDueDate
  }, ["renderUpcomingView"]);

  const html = upcomingView.renderUpcomingView();
  assert.match(html, /is-past-due/);
});

test("calendar view marks days for new assignments and items for editing", async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const view = await loadBrowserModule(calendarPath, {
    getAssessments: () => [{ id: "a1", title: "Essay", subjectId: "s1", dueDate: isoDate(currentYear, currentMonth, 24) }],
    getSubjectById: () => ({ code: "NUR1001", color: "#60a5fa" }),
    formatAssignmentType,
    formatDisplayDate,
    formatTimeRange
  }, ["navigateCalendarMonth", "renderCalendarView"]);

  const html = view.renderCalendarView();
  assert.match(html, /class="cal-weekday">Sun/);
  assert.match(html, /data-action="calendar-prev-month"/);
  assert.match(html, /data-action="calendar-next-month"/);
  assert.match(html, /data-action="calendar-today"/);
  assert.match(html, /data-action="select-calendar-date"/);
  assert.match(html, /data-action="new-assignment"/);
  assert.match(html, /data-action="edit-assignment"/);
  assert.match(html, /class="day-agenda"/);
  assert.match(html, /data-assessment-id="a1"/);
  assert.doesNotMatch(html, /prompt|onclick=/);

  view.navigateCalendarMonth(12);
  assert.match(view.renderCalendarView(), new RegExp(String(currentYear + 1)));
});

test("calendar highlights today and shows a compact count for busy days", async () => {
  const today = getTodayIsoDate();
  const view = await loadBrowserModule(calendarPath, {
    getAssessments: () => [
      { id: "a1", title: "Essay", subjectId: "s1", dueDate: today },
      { id: "a2", title: "Quiz", subjectId: "s1", dueDate: today }
    ],
    getSubjectById: () => ({ code: "NUR1001", color: "#60a5fa" }),
    formatAssignmentType,
    formatDisplayDate,
    formatTimeRange
  }, ["navigateCalendarToToday", "renderCalendarView"]);

  view.navigateCalendarToToday();
  const html = view.renderCalendarView();

  assert.match(html, /cal-cell is-today/);
  assert.match(html, /class="cal-item-count">\+2<\/div>/);
  assert.match(html, /2 items/);
});

test("calendar selected day agenda lists and adds items for that date", async () => {
  const selectedDate = "2026-06-15";
  const view = await loadBrowserModule(calendarPath, {
    getAssessments: () => [
      { id: "a1", title: "Lecture", subjectId: "s1", type: "class", dueDate: selectedDate, startTime: "09:00", endTime: "10:00", location: "Room 2" }
    ],
    getSubjectById: () => ({ code: "NUR1001", color: "#60a5fa" }),
    formatAssignmentType,
    formatDisplayDate,
    formatTimeRange
  }, ["navigateCalendarToToday", "selectCalendarDate", "renderCalendarView"]);

  view.navigateCalendarToToday();
  view.selectCalendarDate(selectedDate);
  const html = view.renderCalendarView();

  assert.match(html, /class="day-agenda"/);
  assert.match(html, /15\/06\/2026/);
  assert.match(html, /Lecture/);
  assert.match(html, /Class · NUR1001 · 09:00-10:00 · Room 2/);
  assert.match(html, /data-action="new-assignment" data-due-date="2026-06-15"/);
});

test("primary views render useful empty states", async () => {
  const subjectsView = await loadBrowserModule(subjectsPath, {
    getSubjects: () => [],
    getAssessments: () => [],
    addSubject: async () => {},
    addAssessment: async () => {},
    formatAssignmentType,
    formatDisplayDate,
    formatTimeRange,
    isClassType,
    isGradeType,
    sortByDueDate
  }, ["renderSubjectsView"]);

  const upcomingView = await loadBrowserModule(upcomingPath, {
    getAssessments: () => [],
    formatDisplayDate,
    formatTimeRange,
    isBeforeToday,
    sortByDueDate
  }, ["renderUpcomingView"]);

  const gradesView = await loadBrowserModule(gradesPath, {
    getSubjects: () => [],
    getAssessments: () => [],
    isGradeType
  }, ["renderGradesView"]);

  assert.match(subjectsView.renderSubjectsView(), /No subjects yet/);
  assert.match(upcomingView.renderUpcomingView(), /No upcoming items/);
  assert.match(gradesView.renderGradesView(), /No grades yet/);
});

test("calendar month matrix uses local dates so weekdays stay aligned", async () => {
  const view = await loadBrowserModule(calendarPath, {
    getAssessments: () => [],
    getSubjectById: () => undefined,
    formatAssignmentType,
    formatDisplayDate,
    formatTimeRange
  }, ["getMonthMatrix"]);

  const june2026 = view.getMonthMatrix(2026, 5);

  assert.equal(june2026[0], null);
  assert.equal(june2026[1], "2026-06-01");
  assert.equal(june2026[2], "2026-06-02");
  assert.equal(june2026.at(-1), "2026-06-30");
});

test("assignment modal saves new and edited assignments with normalized values", async () => {
  const added = [];
  const updated = [];
  const deleted = [];
  const assessments = {
    a1: { id: "a1", title: "Essay", subjectId: "s1", dueDate: "2026-06-01", type: "assignment", weight: 40, mark: 72 }
  };

  const modal = await loadBrowserModule(modalPath, {
    getSubjects: () => [{ id: "s1", code: "NUR1001", name: "Nursing" }],
    getAssessmentById: id => assessments[id],
    addAssessment: async assessment => added.push(assessment),
    updateAssessment: async (id, assessment) => updated.push({ id, assessment }),
    deleteAssessment: async id => deleted.push(id),
    formatAssignmentType,
    isClassType,
    isGradeType
  }, [
    "openNewAssignmentModal",
    "openEditAssignmentModal",
    "closeAssignmentModal",
    "hasAssignmentModal",
    "saveAssignmentModal",
    "deleteAssignmentModal",
    "renderAssignmentModal"
  ]);

  modal.openNewAssignmentModal({ dueDate: "2026-06-10", type: "assignment", weight: 0, mark: 0 });
  assert.equal(modal.hasAssignmentModal(), true);
  assert.match(modal.renderAssignmentModal(), /Add item/);
  assert.match(modal.renderAssignmentModal(), />Assignment<\/option>/);

  await modal.saveAssignmentModal(makeForm({
    title: "Exam",
    subjectId: "",
    type: "exam",
    dueDate: "2026-06-10",
    weight: "60",
    mark: ""
  }));
  assert.deepEqual(plain(added[0]), {
    title: "Exam",
    subjectId: null,
    type: "exam",
    dueDate: "2026-06-10",
    weight: 60,
    mark: 0
  });
  assert.equal(modal.hasAssignmentModal(), false);

  modal.openNewAssignmentModal({ dueDate: "2026-06-12", type: "class" });
  assert.match(modal.renderAssignmentModal(), /Start time/);
  assert.match(modal.renderAssignmentModal(), /Location/);
  await modal.saveAssignmentModal(makeForm({
    title: "Tutorial",
    subjectId: "s1",
    type: "class",
    dueDate: "2026-06-12",
    weight: "99",
    mark: "99",
    startTime: "09:00",
    endTime: "10:30",
    location: "Room 4"
  }));
  assert.deepEqual(plain(added[1]), {
    title: "Tutorial",
    subjectId: "s1",
    type: "class",
    dueDate: "2026-06-12",
    startTime: "09:00",
    endTime: "10:30",
    location: "Room 4"
  });

  modal.openEditAssignmentModal("a1");
  assert.match(modal.renderAssignmentModal(), /Edit item/);
  await modal.saveAssignmentModal(makeForm({
    title: "Essay final",
    subjectId: "s1",
    type: "assignment",
    dueDate: "2026-06-02",
    weight: "45",
    mark: "80"
  }));
  assert.equal(updated[0].id, "a1");
  assert.equal(updated[0].assessment.title, "Essay final");
  assert.equal(updated[0].assessment.mark, 80);

  modal.openEditAssignmentModal("a1");
  await modal.deleteAssignmentModal();
  assert.deepEqual(deleted, ["a1"]);
});

test("subject modal edits unit code and class name", async () => {
  const updated = [];
  const subject = { id: "s1", code: "NUR1001", name: "Nursing" };

  const modal = await loadBrowserModule(subjectModalPath, {
    getSubjectById: id => id === subject.id ? subject : undefined,
    updateSubject: async (id, changes) => updated.push({ id, changes })
  }, [
    "openEditSubjectModal",
    "closeSubjectModal",
    "hasSubjectModal",
    "saveSubjectModal",
    "renderSubjectModal"
  ]);

  modal.openEditSubjectModal("s1");
  assert.equal(modal.hasSubjectModal(), true);
  assert.match(modal.renderSubjectModal(), /Edit class/);
  assert.match(modal.renderSubjectModal(), /Unit code/);
  assert.match(modal.renderSubjectModal(), /Class name/);

  await modal.saveSubjectModal(makeForm({
    code: "NUR1002",
    name: "Nursing Practice"
  }));

  assert.deepEqual(plain(updated[0]), {
    id: "s1",
    changes: {
      code: "NUR1002",
      name: "Nursing Practice"
    }
  });
  assert.equal(modal.hasSubjectModal(), false);
});
