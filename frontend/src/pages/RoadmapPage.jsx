import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Map as MapIcon } from "lucide-react";

import { getStats } from "../api/stats";
import SheetSelector from "../components/SheetSelector";
import EmptyState from "../components/EmptyState";
import { SHEET_LABELS } from "../utils/sheets";

// Node x/y positions for a winding vertical path. Cycles if a sheet has
// more categories than positions defined here.
const POSITIONS = [
  { x: 50, y: 8 },
  { x: 76, y: 22 },
  { x: 50, y: 36 },
  { x: 24, y: 50 },
  { x: 50, y: 64 },
  { x: 76, y: 78 },
  { x: 50, y: 92 },
];

export default function RoadmapPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const sheet = params.get("sheet") || "neetcode150";

  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    getStats()
      .then((data) => mounted && setStats(data))
      .catch((err) => mounted && setError(err.response?.data?.error || err.message));
    return () => {
      mounted = false;
    };
  }, []);

  const categories = stats?.categories?.[sheet];

  const nodes = useMemo(() => {
    const entries = Object.entries(categories || {});
    return entries.map(([name, value], index) => {
      const pos = POSITIONS[index % POSITIONS.length];
      const rowOffset = Math.floor(index / POSITIONS.length) * 100;
      return {
        name,
        total: value.total,
        solved: value.solved,
        x: pos.x,
        y: pos.y + rowOffset,
      };
    });
  }, [categories]);

  useEffect(() => {
    // Default-select the first node once category data has loaded.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (nodes.length && !selected) setSelected(nodes[0].name);
  }, [nodes, selected]);

  function isLocked(index) {
    if (index === 0) return false;
    const prev = nodes[index - 1];
    return prev.total > 0 && prev.solved < prev.total;
  }

  const selectedNode = nodes.find((n) => n.name === selected);
  const height = nodes.length ? (Math.max(...nodes.map((n) => n.y)) + 12) * 3.2 : 400;

  function changeSheet(nextSheet) {
    setSelected(null);
    setParams({ sheet: nextSheet });
  }

  function openCategory() {
    if (!selectedNode) return;
    navigate(`/sheet?sheet=${sheet}&category=${encodeURIComponent(selectedNode.name)}`);
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-card">{error}</div>
      </div>
    );
  }

  return (
    <div className="container roadmap-page">
      <div className="page-title">
        <div>
          <p className="eyebrow">YOUR JOURNEY</p>
          <h1>Roadmap</h1>
          <p>Work through categories in order — each one unlocks the next.</p>
        </div>
        <SheetSelector value={sheet} onChange={changeSheet} />
      </div>

      {!stats ? (
        <div className="content-loader small">
          <div className="spinner" />
          Loading roadmap…
        </div>
      ) : !nodes.length ? (
        <EmptyState
          icon={MapIcon}
          title="Nothing to show yet"
          description="This sheet doesn't have any categories to map."
        />
      ) : (
        <>
          <div className="roadmap-canvas" style={{ height }}>
            <svg width="100%" height="100%" viewBox={`0 0 100 ${height / 3.2}`} preserveAspectRatio="none">
              {nodes.slice(1).map((node, i) => {
                const prev = nodes[i];
                return (
                  <line
                    key={node.name}
                    x1={prev.x}
                    y1={prev.y}
                    x2={node.x}
                    y2={node.y}
                    stroke="var(--line)"
                    strokeWidth="0.6"
                    strokeDasharray="1.5 1.5"
                  />
                );
              })}
            </svg>

            {nodes.map((node, index) => {
              const locked = isLocked(index);
              const percentage = node.total ? Math.round((node.solved / node.total) * 100) : 0;
              const complete = node.total > 0 && node.solved >= node.total;
              const isSelected = selected === node.name;

              return (
                <button
                  key={node.name}
                  type="button"
                  className={`roadmap-node ${locked ? "locked" : complete ? "complete" : node.solved > 0 ? "progress" : "next"} ${isSelected ? "selected" : ""}`}
                  style={{ left: `${node.x}%`, top: `${(node.y / (height / 3.2)) * 100}%` }}
                  onClick={() => !locked && setSelected(node.name)}
                  disabled={locked}
                  title={locked ? "Locked — finish the previous category first" : node.name}
                >
                  <span className="roadmap-node-ring" style={{ "--pct": `${percentage}%` }} />
                  <span className="roadmap-node-label">{node.name.length > 10 ? node.name.slice(0, 9) + "…" : node.name}</span>
                </button>
              );
            })}
          </div>

          {selectedNode && (
            <div className="panel roadmap-detail">
              <div>
                <p className="eyebrow">{SHEET_LABELS[sheet]}</p>
                <h2>{selectedNode.name}</h2>
                <p>{selectedNode.solved} of {selectedNode.total} solved</p>
              </div>
              <button className="primary-button" onClick={openCategory}>
                <MapIcon size={15} /> Open category
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
