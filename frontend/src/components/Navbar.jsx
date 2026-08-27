import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ search, setSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onSheetPage = location.pathname === "/sheet";

  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }

  // On the Sheet page, typing already filters live via the shared search
  // context. Anywhere else, the box does nothing until Enter — this sends
  // the query there so search feels app-wide instead of page-local.
  function handleSearchKeyDown(event) {
    if (event.key !== "Enter") return;
    const query = search?.trim();
    if (!query) return;
    if (!onSheetPage) {
      navigate(`/sheet?search=${encodeURIComponent(query)}`);
    }
  }

  const initials = (user?.name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">D</span>
          <span>
            DSA<span>Hunt</span>
          </span>
        </Link>

        <nav className="nav-links">
          {[
            ["/", "Dashboard"],
            ["/sheet", "Sheets"],
            ["/roadmap", "Roadmap"],
            ["/saved", "Saved"],
            ["/important", "Important"],
          ].map(([path, label]) => (
            <NavLink key={path} to={path} end={path === "/"}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-search">
          <Search size={16} />
          <input
            value={search || ""}
            onChange={(e) => setSearch?.(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search problem, pattern, #number… (Enter)"
            aria-label="Search problems"
          />
        </div>

        <div className="user-menu">
          <Link to="/profile" className="account-trigger" title="Open profile">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="avatar avatar-image" />
            ) : (
              <span className="avatar">{initials}</span>
            )}
            <span className="user-name">{user?.name}</span>
          </Link>

          <button
            className="icon-button"
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
