export function formatDisplayDate(isoDate = "") {
  const [year, month, day] = isoDate.split("-");

  if (!year || !month || !day) return isoDate;

  return `${day}/${month}/${year}`;
}

export function sortByDueDate(a, b) {
  return a.dueDate.localeCompare(b.dueDate);
}

export function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isBeforeToday(isoDate = "") {
  return isoDate < getTodayIsoDate();
}

export function formatAssignmentType(type = "") {
  if (!type) return "";

  return `${type.slice(0, 1).toUpperCase()}${type.slice(1)}`;
}
