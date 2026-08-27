import { useState } from "react";
import { Bookmark, NotebookPen, RotateCcw, Star, X } from "lucide-react";

// A one-time explainer for the icon-only action buttons on ProblemRow.
// Dismissing it is remembered per-browser so it doesn't nag every visit,
// but it's cheap to re-show (clear localStorage) if we change the icons later.
const STORAGE_KEY = "dsa-hunt:icon-legend-dismissed";

export default function IconLegend() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — storage may be unavailable, just skip persisting
    }
  }

  return (
    <div className="icon-legend">
      <div className="icon-legend-items">
        <span><NotebookPen size={14} /> Note</span>
        <span><Bookmark size={14} /> Save</span>
        <span><Star size={14} /> Important</span>
        <span><RotateCcw size={14} /> Needs revision</span>
        <span className="icon-legend-hint">Click the dot on the left to cycle Todo → Attempted → Solved.</span>
      </div>
      <button type="button" className="icon-button" onClick={dismiss} aria-label="Dismiss legend">
        <X size={14} />
      </button>
    </div>
  );
}
