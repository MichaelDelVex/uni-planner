export const SUBJECT_COLORS = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#fb7185",
  "#38bdf8",
  "#4ade80",
  "#f472b6",
  "#c084fc",
  "#fb923c",
  "#facc15"
];

export function renderColorOptions(selectedColor = SUBJECT_COLORS[0]) {
  return `
    <div class="color-picker" role="radiogroup" aria-label="Class color">
      ${SUBJECT_COLORS.map(color => `
        <label class="color-option" title="${color}">
          <input type="radio" name="color" value="${color}" ${color === selectedColor ? "checked" : ""} />
          <span class="color-swatch" style="--swatch-color: ${color}"></span>
        </label>
      `).join("")}
    </div>
  `;
}
