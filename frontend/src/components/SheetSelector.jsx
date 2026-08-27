import { SHEETS } from "../utils/sheets";

// Only lists sheets with real, verified problem data — pending sheets
// (Striver A2Z, Striver 79) intentionally don't appear here, since selecting
// them anywhere problems are expected would just show an empty page.
export default function SheetSelector({ value, onChange }) {
  return (
    <div className="sheet-selector">
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Select problem sheet">
        {SHEETS.map((sheet) => (
          <option key={sheet.value} value={sheet.value}>{sheet.label}</option>
        ))}
      </select>
    </div>
  );
}
