import { useMemo, useState } from "react";
import { Bookmark, Star } from "lucide-react";

import { useProblems } from "../hooks/useProblems";
import { useOptimisticProgress } from "../hooks/useOptimisticProgress";
import ProblemRow from "../components/ProblemRow";
import NoteModal from "../components/NoteModal";
import EmptyState from "../components/EmptyState";
import { updateProgress } from "../api/progress";

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "todo", label: "Todo" },
  { value: "attempted", label: "Attempted" },
  { value: "solved", label: "Solved" },
];

export default function CollectionPage({ type }) {
  const { problems, setProblems, loading, error, refresh } = useProblems();
  const [status, setStatus] = useState("");
  const [noteFor, setNoteFor] = useState(null);

  const handleChange = useOptimisticProgress(setProblems, () => refresh());

  async function handleSaveNote(problemId, notes) {
    handleChange(problemId, { notes });
    await updateProgress(problemId, { notes });
  }

  const filtered = useMemo(() => {
    return problems
      .filter((p) => (type === "saved" ? p.progress?.saved : p.progress?.important))
      .filter((p) => !status || (p.progress?.status || "todo") === status)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [problems, type, status]);

  const title = type === "saved" ? "Saved problems" : "Important problems";
  const Icon = type === "saved" ? Bookmark : Star;

  if (loading) {
    return (
      <div className="content-loader">
        <div className="spinner" />
        Loading collection…
      </div>
    );
  }

  return (
    <div className="container collection">
      <div className="page-title">
        <div>
          <p className="eyebrow">YOUR LIBRARY</p>
          <h1>{title}</h1>
          <p>{filtered.length} problems in this collection.</p>
        </div>
        <Icon size={24} />
      </div>

      <div className="sheet-toolbar" style={{ marginBottom: "16px" }}>
        <select
          className="filter-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
        >
          {STATUSES.map((item) => (
            <option key={item.value || "all"} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="error-card">{error}</div>
      ) : filtered.length ? (
        <div className="collection-list">
          {filtered.map((p) => (
            <ProblemRow key={p._id} problem={p} onChange={handleChange} onOpenNote={setNoteFor} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Icon}
          title={type === "saved" ? "No saved problems yet" : "No important problems yet"}
          description={
            type === "saved"
              ? "Bookmark problems from any sheet so you can find them again quickly."
              : "Star problems you want to prioritize or revisit before an interview."
          }
          actionTo="/sheet"
          actionLabel="Browse problems"
        />
      )}

      <NoteModal key={noteFor?._id} problem={noteFor} onSave={handleSaveNote} onClose={() => setNoteFor(null)} />
    </div>
  );
}
