// =========================
// STORAGE
// =========================

let subjects = JSON.parse(localStorage.getItem("subjects") || "[]");
let assessments = JSON.parse(localStorage.getItem("assessments") || "[]");

function save() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("assessments", JSON.stringify(assessments));
  render();
}

// =========================
// SUBJECTS
// =========================

function addSubject() {
  const code = document.getElementById("subjectCode").value.trim();
  const name = document.getElementById("subjectName").value.trim();

  if (!code || !name) return;

  subjects.push({
    id: Date.now(),
    code,
    name
  });

  document.getElementById("subjectCode").value = "";
  document.getElementById("subjectName").value = "";

  save();
}

// =========================
// ASSESSMENTS
// =========================

function addAssessment() {
  const title = document.getElementById("title").value.trim();
  const subjectId = document.getElementById("subjectSelect").value;
  const dueDate = document.getElementById("dueDate").value;

  const weight = parseFloat(document.getElementById("weight").value || 0);
  const mark = parseFloat(document.getElementById("mark").value || 0);

  if (!title || !subjectId || !dueDate) return;

  assessments.push({
    id: Date.now(),
    title,
    subjectId,
    dueDate,
    weight,
    mark
  });

  document.getElementById("title").value = "";
  document.getElementById("dueDate").value = "";
  document.getElementById("weight").value = "";
  document.getElementById("mark").value = "";

  save();
}

// =========================
// GRADE CALC
// =========================

function calculateGrade(subjectId) {
  const items = assessments.filter(a => a.subjectId == subjectId);

  let total = 0;

  items.forEach(a => {
    if (a.weight && a.mark) {
      total += (a.weight * a.mark) / 100;
    }
  });

  return total.toFixed(2);
}

// =========================
// RENDER
// =========================

function renderSubjects() {
  const el = document.getElementById("subjects");

  el.innerHTML = subjects.map(s => `
    <div class="item">
      <strong>${s.code}</strong><br/>
      <span class="muted">${s.name}</span>
    </div>
  `).join("");
}

function renderSubjectDropdown() {
  const el = document.getElementById("subjectSelect");

  el.innerHTML = subjects.map(s =>
    `<option value="${s.id}">
      ${s.code} - ${s.name}
    </option>`
  ).join("");
}

function renderAssessments() {
  const el = document.getElementById("assessments");

  el.innerHTML = assessments.map(a => {
    const subject = subjects.find(s => s.id == a.subjectId);

    return `
      <div class="item">
        <strong>${a.title}</strong><br/>
        <span class="muted">
          ${subject ? subject.code : "Unknown"} · Due ${a.dueDate}
        </span><br/>
        <span class="muted">
          Weight: ${a.weight}% · Mark: ${a.mark}%
        </span>
      </div>
    `;
  }).join("");
}

function render() {
  renderSubjects();
  renderSubjectDropdown();
  renderAssessments();
}

// =========================
// INIT
// =========================

render();