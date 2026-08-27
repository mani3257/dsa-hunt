import { useEffect, useMemo, useState } from "react";
import { Calendar, Check, Trash2 } from "lucide-react";

import { getGoal, saveGoal, deleteGoal } from "../api/goal";
import { getStats } from "../api/stats";
import { updateProgress } from "../api/progress";
import SheetSelector from "../components/SheetSelector";
import DifficultyBadge from "../components/DifficultyBadge";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function GoalPage() {
  const [goal, setGoal] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Form state (shown when there's no active plan)
  const [sheet, setSheet] = useState("neetcode150");
  const [categories, setCategories] = useState([]); // empty = all
  const [startDate, setStartDate] = useState(todayISO());
  const [totalDays, setTotalDays] = useState(60);
  const [level, setLevel] = useState("Beginner");

  // Calendar view state
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [goalData, statsData] = await Promise.all([getGoal(), getStats()]);
      setGoal(goalData);
      setStats(statsData);
      setError("");

      if (goalData.plan) {
        const start = new Date(goalData.plan.startDate + "T00:00:00Z");
        setViewDate(start);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to load your goal plan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetch-on-mount: intentional data sync with the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const availableCategories = useMemo(() => {
    return Object.keys(stats?.categories?.[sheet] || {});
  }, [stats, sheet]);

  function toggleCategory(name) {
    setCategories((current) =>
      current.includes(name) ? current.filter((c) => c !== name) : [...current, name]
    );
  }

  async function handleStart() {
    setSaving(true);
    try {
      const data = await saveGoal({ sheet, categories, startDate, totalDays: Number(totalDays), level });
      setGoal(data);
      setViewDate(new Date(startDate + "T00:00:00Z"));
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to save your plan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      const data = await deleteGoal();
      setGoal(data);
      setSelectedDay(null);
      setCategories([]);
    } finally {
      setSaving(false);
    }
  }

  async function markSolved(problemId) {
    setGoal((current) => {
      if (!current?.days) return current;
      const days = current.days.map((d) => ({
        ...d,
        problems: d.problems.map((p) =>
          p._id === problemId ? { ...p, status: "solved" } : p
        ),
      }));
      return { ...current, days };
    });
    setSelectedDay((current) =>
      current
        ? { ...current, problems: current.problems.map((p) => (p._id === problemId ? { ...p, status: "solved" } : p)) }
        : current
    );
    try {
      await updateProgress(problemId, { status: "solved" });
    } catch (err) {
      console.error("Failed to mark solved:", err);
    }
  }

  const dayByDate = useMemo(() => {
    const map = new Map();
    (goal?.days || []).forEach((d) => map.set(d.date, d));
    return map;
  }, [goal]);

  const monthCells = useMemo(() => {
    const year = viewDate.getUTCFullYear();
    const month = viewDate.getUTCMonth();
    const firstOfMonth = new Date(Date.UTC(year, month, 1));
    const startWeekday = firstOfMonth.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(Date.UTC(year, month, d));
      cells.push(date.toISOString().slice(0, 10));
    }
    return cells;
  }, [viewDate]);

  function changeMonth(delta) {
    setViewDate((current) => {
      const next = new Date(current);
      next.setUTCMonth(next.getUTCMonth() + delta);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="content-loader">
        <div className="spinner" />
        Loading your goal plan…
      </div>
    );
  }

  return (
    <div className="container goal-page">
      <div className="page-title">
        <div>
          <p className="eyebrow">STAY ON TRACK</p>
          <h1>Goal calendar</h1>
          <p>Pick a sheet, set a timeline, and get a day-by-day plan.</p>
        </div>
        <Calendar size={24} />
      </div>

      {error && <div className="error-card">{error}</div>}

      {!goal?.plan ? (
        <div className="panel goal-setup">
          <h2>Set your roadmap</h2>
          <p className="goal-setup-sub">Pick your preferred topics and a timeline for a personalized plan.</p>

          <label className="goal-field-label">Sheet</label>
          <SheetSelector value={sheet} onChange={(v) => { setSheet(v); setCategories([]); }} />

          <label className="goal-field-label">Topics</label>
          <div className="goal-category-picker">
            {availableCategories.length ? (
              availableCategories.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`goal-chip ${categories.includes(c) ? "active" : ""}`}
                  onClick={() => toggleCategory(c)}
                >
                  {c}
                </button>
              ))
            ) : (
              <span className="goal-setup-sub">Loading topics…</span>
            )}
          </div>
          <p className="goal-setup-sub">
            {categories.length ? `${categories.length} topic(s) selected` : "None selected = all topics"}
          </p>

          <label className="goal-field-label">Start date</label>
          <input
            type="date"
            className="goal-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <label className="goal-field-label">Number of days (7–365)</label>
          <input
            type="number"
            min={7}
            max={365}
            className="goal-input"
            value={totalDays}
            onChange={(e) => setTotalDays(e.target.value)}
          />

          <label className="goal-field-label">Level</label>
          <div className="goal-level-toggle">
            <button
              type="button"
              className={level === "Beginner" ? "active" : ""}
              onClick={() => setLevel("Beginner")}
            >
              Beginner
            </button>
            <button
              type="button"
              className={level === "Pro" ? "active" : ""}
              onClick={() => setLevel("Pro")}
            >
              Pro Level
            </button>
          </div>

          <button className="primary-button goal-start-button" onClick={handleStart} disabled={saving}>
            {saving ? "Starting…" : "Start your journey"}
          </button>
        </div>
      ) : (
        <>
          <div className="panel goal-progress-panel">
            <div>
              <p className="eyebrow">PROGRESS</p>
              <h2>Day {goal.currentDay}/{goal.plan.totalDays}</h2>
            </div>
            <div className="goal-progress-bar">
              <span style={{ width: `${(goal.currentDay / goal.plan.totalDays) * 100}%` }} />
            </div>
            <button className="secondary-button" onClick={handleReset} disabled={saving}>
              <Trash2 size={14} /> Reset plan
            </button>
          </div>

          <div className="panel goal-calendar-panel">
            <div className="goal-calendar-nav">
              <button className="icon-button" onClick={() => changeMonth(-1)}>‹</button>
              <strong>{MONTH_NAMES[viewDate.getUTCMonth()]} {viewDate.getUTCFullYear()}</strong>
              <button className="icon-button" onClick={() => changeMonth(1)}>›</button>
            </div>

            <div className="goal-calendar-grid">
              {WEEKDAYS.map((w) => (
                <div className="goal-weekday" key={w}>{w}</div>
              ))}

              {monthCells.map((dateStr, i) => {
                if (!dateStr) return <div className="goal-cell empty" key={`empty-${i}`} />;
                const day = dayByDate.get(dateStr);
                const isToday = dateStr === todayISO();
                const isSelected = selectedDay?.date === dateStr;

                return (
                  <button
                    type="button"
                    key={dateStr}
                    className={`goal-cell ${day ? "has-plan" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => day && setSelectedDay(day)}
                    disabled={!day}
                  >
                    <span className="goal-cell-date">{Number(dateStr.slice(-2))}</span>
                    {day && (
                      <>
                        <span className="goal-cell-day">Day {day.dayNumber}</span>
                        <span className="goal-cell-count">{day.solved}/{day.total}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <div className="panel goal-day-detail">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">DAY {selectedDay.dayNumber}</p>
                  <h2>{selectedDay.date}</h2>
                </div>
                <span>{selectedDay.solved}/{selectedDay.total} solved</span>
              </div>

              {selectedDay.problems.length ? (
                <div className="goal-day-list">
                  {selectedDay.problems.map((p) => (
                    <div className="goal-day-row" key={p._id}>
                      <button
                        type="button"
                        className={`status-dot ${p.status}`}
                        onClick={() => p.status !== "solved" && markSolved(p._id)}
                        title="Mark solved"
                      >
                        {p.status === "solved" && <Check size={12} />}
                      </button>
                      <a href={p.link} target="_blank" rel="noreferrer" className="problem-title">
                        {p.title}
                      </a>
                      <DifficultyBadge difficulty={p.difficulty} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="goal-setup-sub">No problems scheduled for this day.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
