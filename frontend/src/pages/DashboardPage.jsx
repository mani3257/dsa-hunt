import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Blocks,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Cpu,
  Flame,
  Layers,
  Map as MapIcon,
  MonitorCog,
  RotateCcw,
  Users,
  Code2,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getStats } from "../api/stats";
import { getActivity } from "../api/activity";
import StatCard from "../components/StatCard";
import StreakCalendar from "../components/StreakCalendar";
import { SHEETS, PENDING_SHEETS } from "../utils/sheets";

const CATEGORY_TILES = [
  { id: "dsa-sheets", label: "DSA Sheets", icon: Blocks, color: "coral" },
  { id: "core-cs", label: "Core CS", icon: Cpu, color: "mint" },
  { id: "hr", label: "HR & Behavioral", icon: Users, color: "amber" },
  { id: "basic-coding", label: "Basic Coding", icon: Code2, color: "sky" },
  { id: "system-design", label: "System Design", icon: MonitorCog, color: "sky" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getStats()
      .then((data) => mounted && setStats(data))
      .catch(
        (err) =>
          mounted &&
          setError(err.response?.data?.error || err.message || "Unable to load dashboard.")
      );

    getActivity(365)
      .then((data) => mounted && setActivity(data))
      .catch(() => {}); // Streak is a nice-to-have — never block the dashboard on it.

    return () => {
      mounted = false;
    };
  }, []);

  // Categories with a meaningful sample size (>=3 problems) and low
  // completion, worst first. Reuses the same stats.categories.neetcode150
  // data already powering the "Category Pulse" panel below — no new
  // endpoint needed.
  const weakAreas = useMemo(() => {
    const source = stats?.categories?.neetcode150 || {};
    return Object.entries(source)
      .map(([name, value]) => ({
        name,
        ...value,
        percentage: value.total ? (value.solved / value.total) * 100 : 0,
      }))
      .filter((entry) => entry.total >= 3 && entry.percentage < 40)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 4);
  }, [stats]);

  if (!stats && !error) {
    return (
      <div className="content-loader">
        <div className="spinner" />
        <span>Building your dashboard…</span>
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
    <div className="container dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">YOUR INTERVIEW PREP</p>
          <h1>Make progress measurable.</h1>
          <p>One workspace for patterns, problems, revisions, and the small wins that compound.</p>
        </div>
      </section>

      <section className="category-tiles">
        {CATEGORY_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <a href={`#${tile.id}`} className={`category-tile ${tile.color}`} key={tile.id}>
              <span className="category-tile-icon">
                <Icon size={22} />
              </span>
              <span>{tile.label}</span>
            </a>
          );
        })}
      </section>

      <section className="stat-grid">
        <StatCard label="Solved" value={stats.solved} sub="Across your sheets" icon={CheckCircle2} />
        <StatCard label="Attempted" value={stats.attempted} sub="Keep pushing" icon={Flame} />
        <StatCard label="Saved" value={stats.saved} sub="Your shortlist" icon={Bookmark} />
        <StatCard label="Revision queue" value={stats.needsRevision} sub="Needs another pass" icon={RotateCcw} />
      </section>

      <section className="panel streak-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">CONSISTENCY</p>
            <h2>Solve streak</h2>
          </div>
          <div className="streak-numbers">
            <div>
              <strong>{activity?.currentStreak ?? "—"}</strong>
              <span>current streak</span>
            </div>
            <div>
              <strong>{activity?.longestStreak ?? "—"}</strong>
              <span>longest streak</span>
            </div>
            <Link to="/calendar" className="icon-button" title="Plan your calendar">
              <CalendarDays size={18} />
            </Link>
          </div>
        </div>

        {activity ? (
          <StreakCalendar days={activity.days} rangeDays={365} />
        ) : (
          <div className="content-loader small">
            <div className="spinner" />
          </div>
        )}
      </section>

      <section className="sheet-library" id="dsa-sheets">
        <div className="panel-head">
          <div>
            <p className="eyebrow">DSA SHEETS</p>
            <h2>Pick up where you left off</h2>
          </div>
          <Layers size={19} />
        </div>

        <div className="sheet-card-grid">
          {SHEETS.map((sheetMeta) => {
            const sheetStats = stats.sheets?.[sheetMeta.value] || { total: 0, solved: 0 };
            const percentage = sheetStats.total ? Math.round((sheetStats.solved / sheetStats.total) * 100) : 0;

            return (
              <div className="sheet-card" key={sheetMeta.value}>
                <div>
                  <h3>{sheetMeta.label}</h3>
                  <p>{sheetMeta.description}</p>
                </div>

                <div className="bar">
                  <span style={{ width: `${percentage}%` }} />
                </div>

                <div className="sheet-card-footer">
                  <span>{sheetStats.solved}/{sheetStats.total} solved</span>
                  <div className="sheet-card-actions">
                    <Link to={`/roadmap?sheet=${sheetMeta.value}`} className="icon-button" title="View roadmap">
                      <MapIcon size={16} />
                    </Link>
                    <Link to={`/sheet?sheet=${sheetMeta.value}`} className="secondary-button">
                      Open
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {PENDING_SHEETS.map((sheetMeta) => (
            <div className="sheet-card sheet-card-pending" key={sheetMeta.value}>
              <div>
                <div className="sheet-card-pending-head">
                  <h3>{sheetMeta.label}</h3>
                  <span className="pending-badge">Data pending</span>
                </div>
                <p>{sheetMeta.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sheet-library" id="core-cs">
        <div className="panel-head">
          <div>
            <p className="eyebrow">CORE CS</p>
            <h2>Core CS Subjects</h2>
          </div>
        </div>

        <div className="sheet-card-grid">
          {[
            { label: "DBMS", desc: "Keys, Normalization, SQL, ACID, Transactions.", count: "26 Q&As", to: "/corecs/dbms" },
            { label: "OS", desc: "Processes, Scheduling, Deadlock, Memory.", count: "11 Q&As", to: "/corecs/os" },
            { label: "OOP", desc: "Pillars, Inheritance, Polymorphism, Design.", count: "11 Q&As", to: "/corecs/oop" },
            { label: "CN", desc: "OSI, TCP/IP, Protocols, HTTP, Handshake.", count: "13 Q&As", to: "/corecs/cn" },
          ].map((subject) => (
            <Link to={subject.to} className="sheet-card" style={{ textDecoration: "none" }} key={subject.label}>
              <div>
                <div className="sheet-card-pending-head">
                  <h3>{subject.label}</h3>
                  <span className="pending-badge" style={{ background: "rgba(var(--accent-rgb),0.15)", color: "var(--accent)", borderColor: "var(--accent)" }}>{subject.count}</span>
                </div>
                <p>{subject.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="sheet-library" id="hr">
        <div className="panel-head">
          <div>
            <p className="eyebrow">INTERVIEW PREP</p>
            <h2>HR & Behavioral Questions</h2>
          </div>
          <Users size={20} style={{ color: "var(--muted)" }} />
        </div>
        <div className="sheet-card-grid">
          <Link to="/hr" className="sheet-card" style={{ textDecoration: "none" }}>
            <div>
              <div className="sheet-card-pending-head">
                <h3>HR Questions</h3>
                <span className="pending-badge" style={{ background: "rgba(var(--accent-rgb),0.15)", color: "var(--accent)", borderColor: "var(--accent)" }}>25 Q&As</span>
              </div>
              <p>Tell me about yourself, strengths, weaknesses, goals, and more.</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="sheet-library" id="basic-coding">
        <div className="panel-head">
          <div>
            <p className="eyebrow">CODING PRACTICE</p>
            <h2>Basic Coding Problems</h2>
          </div>
          <Code2 size={20} style={{ color: "var(--muted)" }} />
        </div>
        <div className="sheet-card-grid">
          <Link to="/coding/basics" className="sheet-card" style={{ textDecoration: "none" }}>
            <div>
              <div className="sheet-card-pending-head">
                <h3>Strings, Numbers & Arrays</h3>
                <span className="pending-badge" style={{ background: "rgba(var(--accent-rgb),0.15)", color: "var(--accent)", borderColor: "var(--accent)" }}>40 Problems</span>
              </div>
              <p>Java & Python solutions — editable code, copy-paste ready.</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="sheet-library" id="system-design">
        <div className="panel-head">
          <div>
            <p className="eyebrow">CORE CS</p>
            <h2>System Design</h2>
          </div>
        </div>

        <div className="sheet-card-grid">
          <Link to="/system-design" className="sheet-card" style={{ textDecoration: "none" }}>
            <div>
              <div className="sheet-card-pending-head">
                <h3>System Design Course</h3>
                <span className="pending-badge" style={{ background: "rgba(var(--accent-rgb),0.15)", color: "var(--accent)", borderColor: "var(--accent)" }}>18 Topics</span>
              </div>
              <p>Requirements, Scalability, CAP, Microservices, Real-world problems & more.</p>
            </div>
          </Link>
        </div>
      </section>

      {weakAreas.length > 0 && (
        <section className="panel weak-areas-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">NEEDS ATTENTION</p>
              <h2>Weak areas</h2>
            </div>
            <AlertTriangle size={19} />
          </div>

          <div className="weak-area-list">
            {weakAreas.map((area) => (
              <Link
                to={`/sheet?sheet=neetcode150&category=${encodeURIComponent(area.name)}`}
                className="weak-area-row"
                key={area.name}
              >
                <div>
                  <span>{area.name}</span>
                  <small>{area.solved}/{area.total} solved{area.attempted ? ` · ${area.attempted} attempted` : ""}</small>
                </div>
                <div className="bar">
                  <span style={{ width: `${area.percentage}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">CATEGORY PULSE</p>
            <h2>NeetCode 150</h2>
          </div>
          <BarChart3 size={19} />
        </div>

        <div className="category-list">
          {Object.entries(stats.categories?.neetcode150 || {})
            .slice(0, 8)
            .map(([name, value]) => {
              const categoryPercentage = value.total ? (value.solved / value.total) * 100 : 0;
              return (
                <div className="category-row" key={name}>
                  <div>
                    <span>{name}</span>
                    <small>{value.solved}/{value.total}</small>
                  </div>
                  <div className="bar">
                    <span style={{ width: `${categoryPercentage}%` }} />
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
}
