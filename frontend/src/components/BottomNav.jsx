import { NavLink } from "react-router-dom";
import { LayoutGrid, ListChecks, Map as MapIcon, UserRound } from "lucide-react";

// Fixed bottom navigation shown only below the 1000px breakpoint, where
// Navbar's .nav-links (Dashboard/Sheets/Roadmap/Saved/Important) are
// hidden. Keeps the most-used destinations reachable on mobile without a
// hamburger drawer. Revision was dropped — it's now a filter inside the
// Sheet page instead of its own destination.
const ITEMS = [
  { path: "/", label: "Home", icon: LayoutGrid, end: true },
  { path: "/sheet", label: "Sheets", icon: ListChecks },
  { path: "/roadmap", label: "Roadmap", icon: MapIcon },
  { path: "/profile", label: "Profile", icon: UserRound },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map(({ path, label, icon: Icon, end }) => (
        <NavLink key={path} to={path} end={end} className="bottom-nav-item">
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
