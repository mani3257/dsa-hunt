import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Trash2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { getCalendarPlan, saveCalendarPlan, deleteCalendarPlan } from "../api/calendar";
import { getStats } from "../api/stats";
import { updateProgress } from "../api/progress";
import SheetSelector from "../components/SheetSelector";
import Accordion from "../components/Accordion";
import DifficultyBadge from "../components/DifficultyBadge";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const [params] = useSearchParams();
  const [plan, setPlan] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Setup form state
  const [sheet, setSheet] = useState(params.get("sheet") || "neetcode150");
  const [categories, setCategories] = useState([]); // empty = all
  const [startDate, setStartDate] = useState(todayISO());
  const [pacingMode, setPacingMode] = useState("days"); // "days" | "perDay"
  const [totalDays, setTotalDays] = useState(60);
  const [problemsPerDay, setProblemsPerDay] = useState(3);
  const [level, setLevel] = useState("Beginner");

  // Month-grid navigation
  const [viewDate, setViewDate] = useState(new Date());
  const [highlightDay, setHighlightDay] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [planData, statsData] = await Promise.all([getCalendarPlan(), getStats()]);
      setPlan(planData);
      setStats(statsData);
      setError("");
      if (planData.plan) setViewDate(new Date(planData.plan.startDate + "T00:00:00Z"));
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to load your calendar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetch-on-mount: intentional data sync with the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const availableCategories = useMemo(
    () => Object.keys(stats?.categories?.[sheet] || {}),
    [stats, sheet]
  );

  const dayByDate = useMemo(() => {
    const map = new Map();
    (plan?.days || []).forEach((d) => map.set(d.date, d));
    return map;
  }, [plan]);

  const monthCells = useMemo(() => {
    const year = viewDate.getUTCFullYear();
    const month = viewDate.getUTCMonth();
    const firstOfMonth = new Date(Date.UTC(year, month, 1));
    const startWeekday = firstOfMonth.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(Date.UTC(year, month, d)).toISOString().slice(0, 10));
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

  function jumpToDay(dateStr) {
    setHighlightDay(dateStr);
    requestAnimationFrame(() => {
      document
        .getElementById(`calendar-day-${dateStr}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function toggleCategory(name) {
    setCategories((current) =>
      current.includes(name) ? current.filter((c) => c !== name) : [...current, name]
    );
  }

  async function handleStart() {
    setSaving(true);
    try {
      const payload = {
        sheet,
        categories,
        startDate,
        level,
        ...(pacingMode === "perDay"
          ? { problemsPerDay: Number(problemsPerDay) }
          : { totalDays: Number(totalDays) }),
      };
      const data = await saveCalendarPlan(payload);
      setPlan(data);
      setViewDate(new Date(startDate + "T00:00:00Z"));
      setShowSetup(false);
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
      setPlan(await deleteCalendarPlan());
      setCategories([]);
    } finally {
      setSaving(false);
    }
  }

  async function markSolved(problemId) {
    setPlan((current) => {
      if (!current?.days) return current;
      const days = current.days.map((d) => ({
        ...d,
        problems: d.problems.map((p) => (p._id === problemId ? { ...p, status: "solved" } : p)),
        solved: d.problems.some((p) => p._id === problemId) ? d.solved + 1 : d.solved,
      }));
      return { ...current, days };
    });
    try {
      await updateProgress(problemId, { status: "solved" });
    } catch (err) {
      console.error("Failed to mark solved:", err);
    }
  }

  function dayStatusLabel(dateStr) {
    if (dateStr === todayISO()) return "Today";
    return dateStr < todayISO() ? "Past" : "Upcoming";
  }

  if (loading) {
    return (
      <div className="content-loader">
        <div className="spinner" />
        Loading your calendar…
      </div>
    );
  }

  const setupForm = (
    <>
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

      <label className="goal-field-label">Plan by</label>
      <div className="goal-level-toggle">
        <button type="button" className={pacingMode === "days" ? "active" : ""} onClick={() => setPacingMode("days")}>
          Number of days
        </button>
        <button type="button" className={pacingMode === "perDay" ? "active" : ""} onClick={() => setPacingMode("perDay")}>
          Problems per day
        </button>
      </div>

      {pacingMode === "days" ? (
        <>
          <label className="goal-field-label">Number of days (7–365)</label>
          <input
            type="number"
            min={7}
            max={365}
            className="goal-input"
            value={totalDays}
            onChange={(e) => setTotalDays(e.target.value)}
          />
        </>
      ) : (
        <>
          <label className="goal-field-label">Problems per day</label>
          <input
            type="number"
            min={1}
            max={50}
            className="goal-input"
            value={problemsPerDay}
            onChange={(e) => setProblemsPerDay(e.target.value)}
          />
          <p className="goal-setup-sub">We'll work out how many days that plan takes.</p>
        </>
      )}

      <label className="goal-field-label">Level</label>
      <div className="goal-level-toggle">
        <button type="button" className={level === "Beginner" ? "active" : ""} onClick={() => setLevel("Beginner")}>
          Beginner
        </button>
        <button type="button" className={level === "Pro" ? "active" : ""} onClick={() => setLevel("Pro")}>
          Pro Level
        </button>
      </div>
    </>
  );

  return (
    <div className="container goal-page">
      <div className="page-title">
        <div>
          <p className="eyebrow">STAY ON TRACK</p>
          <h1>Calendar</h1>
          <p>Pick a sheet, set a pace, and get a day-by-day plan.</p>
        </div>
        <CalendarDays size={24} />
      </div>

      {error && <div className="error-card">{error}</div>}

      {!plan?.plan ? (
        <div className="panel goal-empty">
          <CalendarDays size={30} />
          <h2>No plan set up yet</h2>
          <p>Pick a sheet, a pace, and a start date to get a personalized day-by-day roadmap.</p>
          <button className="primary-button" onClick={() => setShowSetup(true)}>Set your roadmap</button>
        </div>
      ) : (
        <>
          <div className="panel goal-progress-panel">
            <div>
              <p className="eyebrow">PROGRESS</p>
              <h2>Day {plan.currentDay}/{plan.plan.totalDays}</h2>
            </div>
            <div className="goal-progress-bar">
              <span style={{ width: `${(plan.currentDay / plan.plan.totalDays) * 100}%` }} />
            </div>
            <button className="secondary-button" onClick={handleReset} disabled={saving}>
              <Trash2 size={14} /> Reset plan
            </button>
          </div>

          <div className="panel goal-month-panel">
            <div className="goal-calendar-nav">
              <button className="icon-button" onClick={() => changeMonth(-1)}>‹</button>
              <strong>{MONTH_NAMES[viewDate.getUTCMonth()]} {viewDate.getUTCFullYear()}</strong>
              <button className="icon-button" onClick={() => changeMonth(1)}>›</button>
            </div>

            <div className="goal-month-grid">
              {WEEKDAYS.map((w) => (
                <div className="goal-weekday" key={w}>{w}</div>
              ))}

              {monthCells.map((dateStr, i) => {
                if (!dateStr) return <div className="goal-month-cell empty" key={`empty-${i}`} />;
                const day = dayByDate.get(dateStr);
                const isToday = dateStr === todayISO();
                const complete = day && day.total > 0 && day.solved >= day.total;

                return (
                  <button
                    type="button"
                    key={dateStr}
                    className={`goal-month-cell ${day ? "has-plan" : ""} ${isToday ? "today" : ""} ${complete ? "complete" : ""}`}
                    onClick={() => day && jumpToDay(dateStr)}
                    disabled={!day}
                  >
                    <span className="goal-month-cell-date">{Number(dateStr.slice(-2))}</span>
                    {day && (
                      <>
                        <span className="goal-month-cell-day">Day {day.dayNumber}</span>
                        {day.topic && <span className="goal-month-cell-topic">{day.topic}</span>}
                        <span className="goal-month-cell-status">{dayStatusLabel(dateStr)}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="goal-day-stream">
            {plan.days.map((day) => (
              <div id={`calendar-day-${day.date}`} key={day.date}>
                <Accordion
                  title={`Day ${day.dayNumber}`}
                  subtitle={day.date}
                  solved={day.solved}
                  total={day.total}
                  defaultOpen={day.dayNumber === plan.currentDay}
                  forceOpen={highlightDay === day.date}
                >
                  {day.problems.length ? (
                    <div className="goal-day-list">
                      {day.problems.map((p) => (
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
                    <p className="goal-setup-sub" style={{ padding: "12px 16px" }}>Nothing scheduled for this day.</p>
                  )}
                </Accordion>
              </div>
            ))}
          </div>
        </>
      )}

      {showSetup && (
        <div className="modal-overlay" onClick={() => setShowSetup(false)}>
          <div className="modal-card goal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">SET ROADMAP</p>
                <h3>Customise your journey, track results with ease</h3>
              </div>
              <button className="icon-button" onClick={() => setShowSetup(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {setupForm}

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowSetup(false)}>Cancel</button>
              <button className="primary-button" onClick={handleStart} disabled={saving}>
                {saving ? "Starting…" : "Start your journey"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
