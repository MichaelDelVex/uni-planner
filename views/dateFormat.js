export function formatDisplayDate(isoDate = "") {
  const [year, month, day] = isoDate.split("-");

  if (!year || !month || !day) return isoDate;

  return `${day}/${month}/${year}`;
}

export function sortByDueDate(a, b) {
  return a.dueDate.localeCompare(b.dueDate);
}
