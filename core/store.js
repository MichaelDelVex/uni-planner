let subjects = JSON.parse(localStorage.getItem("subjects") || "[]");
let assessments = JSON.parse(localStorage.getItem("assessments") || "[]");

function save() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("assessments", JSON.stringify(assessments));
}

function getSubject(subjectId) {
  return subjects.find(s => s.id === subjectId);
}

export function getAssessments() {
  return assessments;
}

export function addSubject(subject) {
  subjects.push(subject);
  save();
}

export function addAssessment(a) {
  assessments.push(a);
  save();
}

export function updateAssessment(id, updated) {
  assessments = assessments.map(a =>
    a.id === id ? { ...a, ...updated } : a
  );
  save();
}