import assert from "node:assert/strict";
import test from "node:test";
import { loadBrowserModule, makeForm } from "./helpers/moduleLoader.mjs";

const subjectsPath = new URL("../views/subjectsView.js", import.meta.url);
const calendarPath = new URL("../views/calendarView.js", import.meta.url);
const modalPath = new URL("../views/assignmentModal.js", import.meta.url);
const subjectModalPath = new URL("../views/subjectModal.js", import.meta.url);

function plain(value) {
  return JSON.parse(JSON.stringify(value));
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
    addAssessment: async assessment => addedAssessments.push(assessment)
  }, ["renderSubjectsView", "addSubjectFromForm", "addAssignmentFromForm"]);

  const html = view.renderSubjectsView();
  assert.match(html, /data-form="subject"/);
  assert.match(html, /data-form="assignment-quick-add"/);
  assert.match(html, /data-action="edit-subject"/);
  assert.match(html, /data-action="edit-assignment"/);
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
});

test("calendar view marks days for new assignments and items for editing", async () => {
  const view = await loadBrowserModule(calendarPath, {
    getAssessments: () => [{ id: "a1", title: "Essay", subjectId: "s1", dueDate: "2026-05-24" }],
    getSubjectById: () => ({ color: "#60a5fa" })
  }, ["renderCalendarView"]);

  const html = view.renderCalendarView();
  assert.match(html, /class="cal-weekday">Sun/);
  assert.match(html, /data-action="new-assignment"/);
  assert.match(html, /data-action="edit-assignment"/);
  assert.match(html, /data-assessment-id="a1"/);
  assert.doesNotMatch(html, /prompt|onclick=/);
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
    deleteAssessment: async id => deleted.push(id)
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
