import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams, Link } from "react-router-dom";
import { CalendarDays, Search, Shuffle, Target } from "lucide-react";

import { useProblems } from "../hooks/useProblems";
import { useOptimisticProgress } from "../hooks/useOptimisticProgress";
import SheetSelector from "../components/SheetSelector";
import ProblemRow from "../components/ProblemRow";
import Accordion from "../components/Accordion";
import NoteModal from "../components/NoteModal";
import EmptyState from "../components/EmptyState";
import { updateProgress } from "../api/progress";

const DIFFICULTIES = [
  { value: "", label: "All difficulties" },
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "todo", label: "Todo" },
  { value: "attempted", label: "Attempted" },
  { value: "solved", label: "Solved" },
];

const REVISION_OPTIONS = [
  { value: "", label: "All problems" },
  { value: "due", label: "Needs revision" },
  { value: "saved", label: "Saved" },
  { value: "important", label: "Important" },
];

export default function SheetPage() {
  const { search, setSearch } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [noteFor, setNoteFor] = useState(null);

  const sheet = params.get("sheet") || "neetcode150";
  const activeCategory = params.get("category") || "";
  const difficulty = params.get("difficulty") || "";
  const status = params.get("status") || "";
  const revisionFilter = params.get("revision") || "";

  // NOTE: search is intentionally excluded from useProblems params.
  // Passing search there would trigger a full API refetch on every keystroke.
  // Instead we fetch all problems for the sheet+difficulty combo and filter
  // client-side — search is fast enough over the typical sheet sizes (≤250).
  const { problems, setProblems, loading, error, refresh } = useProblems({
    sheet,
    difficulty,
  });

  const handleChange = useOptimisticProgress(setProblems, () => refresh());

  async function handleSaveNote(problemId, notes) {
    handleChange(problemId, { notes });
    await updateProgress(problemId, { notes });
  }

  useEffect(() => {
    const urlSearch = params.get("search") || "";
    if (urlSearch !== search) setSearch(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const normalizedProblems = useMemo(() => {
    return problems.map((problem) => {
      const placement = problem.placements?.find((item) => item.sheet === sheet);
      return {
        ...problem,
        difficulty: problem.difficulty || placement?.difficulty || "Unknown",
        category: problem.category || placement?.category || "Uncategorized",
        displayOrder: problem.displayOrder ?? placement?.order ?? problem.order ?? 0,
      };
    });
  }, [problems, sheet]);

  const filteredProblems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedProblems.filter((problem) => {
      if (status && (problem.progress?.status || "todo") !== status) return false;

      if (revisionFilter === "due" && !problem.progress?.needsRevision) return false;
      if (revisionFilter === "saved" && !problem.progress?.saved) return false;
      if (revisionFilter === "important" && !problem.progress?.important) return false;

      if (!query) return true;

      const searchable = [problem.title, problem.category, problem.difficulty, problem.slug]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [normalizedProblems, search, status, revisionFilter]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const problem of filteredProblems) {
      const category = problem.category || "Uncategorized";
      if (!map.has(category)) map.set(category, []);
      map.get(category).push(problem);
    }
    return [...map.entries()].sort(
      (a, b) => (a[1][0]?.displayOrder ?? 0) - (b[1][0]?.displayOrder ?? 0)
    );
  }, [filteredProblems]);

  const solved = normalizedProblems.filter((p) => p.progress?.status === "solved").length;
  const attempted = normalizedProblems.filter((p) => p.progress?.status === "attempted").length;

  const byDifficulty = useMemo(() => {
    const buckets = { Easy: { solved: 0, total: 0 }, Medium: { solved: 0, total: 0 }, Hard: { solved: 0, total: 0 } };
    for (const problem of normalizedProblems) {
      const bucket = buckets[problem.difficulty];
      if (!bucket) continue;
      bucket.total++;
      if (problem.progress?.status === "solved") bucket.solved++;
    }
    return buckets;
  }, [normalizedProblems]);

  function changeSheet(nextSheet) {
    setSearch("");
    const next = new URLSearchParams();
    next.set("sheet", nextSheet);
    setParams(next);
  }

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  function handleSearchChange(value) {
    // Only update local state, not URL.
    // Pushing to URL triggers useEffect->setSearch->re-render on every keystroke (the refresh bug).
    setSearch(value);
  }

  function goToRandomProblem() {
    const pool = filteredProblems.filter((p) => (p.progress?.status || "todo") !== "solved");
    const source = pool.length ? pool : filteredProblems;
    if (!source.length) return;
    const pick = source[Math.floor(Math.random() * source.length)];
    updateParam("category", pick.category);
    setTimeout(() => {
      document
        .getElementById(`category-${pick.category}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  if (loading) {
    return (
      <div className="content-loader">
        <div className="spinner" />
        Loading your sheet…
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-card">{error}</div>
      </div>
    );
  }

  return (
    <div className="sheet-layout container">
      <div className="sheet-head">
        <div>
          <p className="eyebrow">PROBLEM SHEETS</p>
          <h1>Practice with intent.</h1>
          <p>Work through each category at your own pace, track it as you go.</p>
        </div>

        <div className="sheet-head-actions">
          <SheetSelector value={sheet} onChange={changeSheet} />
          <Link to={`/calendar?sheet=${sheet}`} className="secondary-button" title="Plan a day-by-day calendar for this sheet">
            <CalendarDays size={15} /> Calendar
          </Link>
          <button className="secondary-button" onClick={goToRandomProblem} title="Jump to a random unsolved problem">
            <Shuffle size={15} /> Random problem
          </button>
        </div>
      </div>

      <div className="stat-grid difficulty-stats">
        <div className="stat-card difficulty-stat easy">
          <span>Easy</span>
          <strong>{byDifficulty.Easy.solved}/{byDifficulty.Easy.total}</strong>
        </div>
        <div className="stat-card difficulty-stat medium">
          <span>Medium</span>
          <strong>{byDifficulty.Medium.solved}/{byDifficulty.Medium.total}</strong>
        </div>
        <div className="stat-card difficulty-stat hard">
          <span>Hard</span>
          <strong>{byDifficulty.Hard.solved}/{byDifficulty.Hard.total}</strong>
        </div>
      </div>

      <div className="progress-strip">
        <div>
          <Target size={16} />
          <span>{solved} solved</span>
        </div>
        <div>
          <span>{attempted} attempted</span>
        </div>
        <div>
          <span>{normalizedProblems.length - solved - attempted} remaining</span>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${normalizedProblems.length ? (solved / normalizedProblems.length) * 100 : 0}%` }} />
        </div>
      </div>

      <section className="problem-content">
        <div className="sheet-toolbar">
          <div className="inline-search">
            <Search size={15} />
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search problem, category or #number…"
            />
          </div>

          <select
            className="filter-select"
            value={difficulty}
            onChange={(event) => updateParam("difficulty", event.target.value)}
            aria-label="Filter by difficulty"
          >
            {DIFFICULTIES.map((item) => (
              <option key={item.value || "all"} value={item.value}>{item.label}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={revisionFilter}
            onChange={(event) => updateParam("revision", event.target.value)}
            aria-label="Filter by revision"
          >
            {REVISION_OPTIONS.map((item) => (
              <option key={item.value || "all"} value={item.value}>{item.label}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={status}
            onChange={(event) => updateParam("status", event.target.value)}
            aria-label="Filter by status"
          >
            {STATUSES.map((item) => (
              <option key={item.value || "all"} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        {grouped.map(([category, items]) => {
          const solvedInCategory = items.filter((p) => p.progress?.status === "solved").length;

          return (
            <div id={`category-${category}`} key={category}>
              <Accordion
                title={category}
                solved={solvedInCategory}
                total={items.length}
                defaultOpen={false}
                forceOpen={Boolean(search.trim()) || activeCategory === category}
              >
                {items.map((problem) => (
                  <ProblemRow
                    key={problem._id}
                    problem={problem}
                    onChange={handleChange}
                    onOpenNote={setNoteFor}
                  />
                ))}
              </Accordion>
            </div>
          );
        })}

        {!grouped.length && (
          <EmptyState
            icon={Search}
            title="No problems found"
            description={
              revisionFilter === "due"
                ? "Nothing here needs revision right now — with the current sheet and difficulty filter."
                : difficulty || status
                ? "No problems match your current filters."
                : "Try a different problem name, category, or number."
            }
          />
        )}
      </section>

      <NoteModal key={noteFor?._id} problem={noteFor} onSave={handleSaveNote} onClose={() => setNoteFor(null)} />
    </div>
  );
}
