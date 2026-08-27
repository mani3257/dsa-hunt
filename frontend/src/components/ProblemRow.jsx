import {
  Bookmark,
  Check,
  ExternalLink,
  NotebookPen,
  RotateCcw,
  Star,
} from "lucide-react";

import DifficultyBadge from "./DifficultyBadge";

const statusCycle = {
  todo: "attempted",
  attempted: "solved",
  solved: "todo",
};

// `onChange(problemId, patch)` is expected to update local state instantly
// (optimistic) and sync to the server in the background — see
// useOptimisticProgress. This component never triggers a full-list refetch.
export default function ProblemRow({ problem, onChange, onOpenNote }) {
  const progress = problem.progress || {
    status: "todo",
    saved: false,
    important: false,
    needsRevision: false,
    notes: "",
  };

  const status = progress.status || "todo";
  const difficulty = problem.difficulty || "Unknown";
  const displayOrder = problem.displayOrder ?? problem.order ?? "";
  const hasNote = Boolean(progress.notes?.trim());

  function changeStatus() {
    onChange?.(problem._id, { status: statusCycle[status] });
  }

  function toggleField(field) {
    onChange?.(problem._id, { [field]: !progress[field] });
  }

  return (
    <div className="problem-row">
      <span className="problem-number">{displayOrder}</span>

      <button
        type="button"
        className={`status-dot ${status}`}
        onClick={changeStatus}
        title={`Status: ${status}`}
        aria-label={`Change status for ${problem.title}`}
      >
        {status === "solved" && <Check size={12} />}
        {status === "attempted" && <span />}
      </button>

      <a
        className="problem-title"
        href={problem.link}
        target="_blank"
        rel="noreferrer"
        title={problem.title}
      >
        {problem.title}
        <ExternalLink size={12} />
      </a>

      <DifficultyBadge difficulty={difficulty} />

      <div className="problem-actions">
        <button
          type="button"
          className={hasNote ? "active teal" : ""}
          onClick={() => onOpenNote?.(problem)}
          title={hasNote ? "Edit note" : "Add note"}
        >
          <NotebookPen size={15} />
        </button>

        <button
          type="button"
          className={progress.saved ? "active teal" : ""}
          onClick={() => toggleField("saved")}
          title="Save problem"
        >
          <Bookmark size={15} />
        </button>

        <button
          type="button"
          className={progress.important ? "active amber" : ""}
          onClick={() => toggleField("important")}
          title="Mark important"
        >
          <Star size={15} />
        </button>

        <button
          type="button"
          className={progress.needsRevision ? "active purple" : ""}
          onClick={() => toggleField("needsRevision")}
          title="Needs revision"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
}
