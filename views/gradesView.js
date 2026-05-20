import { getSubjects, getAssessments } from "../core/store.js";

export function renderGradesView() {
  const subjects = getSubjects();
  const assessments = getAssessments();

  function calc(subjectId) {
    const items = assessments.filter(a => a.subjectId === subjectId);

    let total = 0;
    items.forEach(a => {
      if (a.weight && a.mark) {
        total += (a.weight * a.mark) / 100;
      }
    });

    return total.toFixed(1);
  }

  return `
    <h2>Grades</h2>

    ${subjects.map(s => `
      <div class="card">
        <strong>${s.code}</strong>
        <div>${calc(s.id)}%</div>
      </div>
    `).join("")}
  `;
}