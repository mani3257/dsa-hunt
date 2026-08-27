import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { getRevisionProblems, markProblemRevised } from "../api/revision";
import DifficultyBadge from "../components/DifficultyBadge";
import EmptyState from "../components/EmptyState";

const DIFFICULTIES = ["", "Easy", "Medium", "Hard"];

export default function RevisionPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [difficulty, setDifficulty] = useState("");

  async function load() {
    setLoading(true);
    try {
      setItems(await getRevisionProblems());
      setError("");
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Unable to load your revision queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetch-on-mount: intentional data sync with the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  // Optimistic: remove the card immediately, sync in the background.
  // Only re-fetch the full list if the request actually fails.
  async function revised(id) {
    setItems((current) => current.filter((p) => p._id !== id));
    try {
      await markProblemRevised(id);
    } catch (err) {
      console.error("Failed to mark revised:", err);
      load();
    }
  }

  const filtered = useMemo(
    () => items.filter((p) => !difficulty || p.difficulty === difficulty),
    [items, difficulty]
  );

  return (
    <div className="container collection">
      <div className="page-title">
        <div>
          <p className="eyebrow">SPACED REVISION</p>
          <h1>Revision queue</h1>
          <p>Problems you marked for another pass.</p>
        </div>
        <RotateCcw size={24} />
      </div>

      <div className="sheet-toolbar" style={{ marginBottom: "16px" }}>
        <select
          className="filter-select"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
          aria-label="Filter by difficulty"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d || "all"} value={d}>{d || "All difficulties"}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="content-loader small">
          <div className="spinner" />
          Loading…
        </div>
      ) : error ? (
        <div className="error-card">{error}</div>
      ) : filtered.length ? (
        <div className="revision-list">
          {filtered.map((p) => (
            <div className="revision-card" key={p._id}>
              <div>
                <span className="revision-meta">{p.category} · {p.pattern}</span>
                <h3>{p.title}</h3>
                <DifficultyBadge difficulty={p.difficulty} />
                <p>{p.progress?.notes || "No revision note added."}</p>
              </div>
              <button className="secondary-button" onClick={() => revised(p._id)}>
                <CheckCircle2 size={16} /> Mark revised
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="Revision queue is clear"
          description="Nice work. Mark a problem as needing revision when you want it back here."
          actionTo="/sheet"
          actionLabel="Browse problems"
        />
      )}
    </div>
  );
}
