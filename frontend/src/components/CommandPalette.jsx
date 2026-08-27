import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  CalendarDays,
  LayoutGrid,
  ListChecks,
  Map as MapIcon,
  Search,
  Star,
  Target,
  UserRound,
} from "lucide-react";

// Global Cmd/Ctrl+K palette. Lives once in MainLayout so it's reachable from
// any page. Typing a query jumps straight to a problem search; the listed
// destinations below cover everything currently spread across the top nav,
// bottom nav, and profile quick links.
const DESTINATIONS = [
  { label: "Dashboard", path: "/", icon: LayoutGrid, keywords: "home" },
  { label: "Sheets", path: "/sheet", icon: ListChecks, keywords: "problems practice" },
  { label: "Roadmap", path: "/roadmap", icon: MapIcon, keywords: "journey path" },
  { label: "Saved problems", path: "/saved", icon: Bookmark, keywords: "bookmarks" },
  { label: "Important problems", path: "/important", icon: Star, keywords: "starred" },
  { label: "Calendar plan", path: "/calendar", icon: CalendarDays, keywords: "schedule" },
  { label: "Goal plan", path: "/goal", icon: Target, keywords: "target days" },
  { label: "Profile", path: "/profile", icon: UserRound, keywords: "account settings" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(event) {
      const isMod = event.metaKey || event.ctrlKey;
      if (isMod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      // Reset the palette's internal state each time it opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DESTINATIONS;
    return DESTINATIONS.filter(
      (d) => d.label.toLowerCase().includes(q) || d.keywords.includes(q)
    );
  }, [query]);

  function go(path) {
    setOpen(false);
    navigate(path);
  }

  function runSearch() {
    const q = query.trim();
    if (!q) return;
    go(`/sheet?search=${encodeURIComponent(q)}`);
  }

  function onKeyDownInList(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[activeIndex]) go(filtered[activeIndex].path);
      else runSearch();
    }
  }

  if (!open) return null;

  return (
    <div className="command-palette-overlay" onClick={() => setOpen(false)}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-input">
          <Search size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDownInList}
            placeholder="Jump to a page, or type to search problems…"
          />
          <kbd>Esc</kbd>
        </div>

        <div className="command-palette-list">
          {filtered.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                className={`command-palette-item ${index === activeIndex ? "active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => go(item.path)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {query.trim() && (
            <button type="button" className="command-palette-item command-palette-search-item" onClick={runSearch}>
              <Search size={16} />
              <span>Search problems for "{query.trim()}"</span>
            </button>
          )}

          {!filtered.length && !query.trim() && (
            <div className="command-palette-empty">No matches</div>
          )}
        </div>
      </div>
    </div>
  );
}
