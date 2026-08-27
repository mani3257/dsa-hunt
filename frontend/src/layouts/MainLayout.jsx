import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

export default function MainLayout() {
  const [search, setSearch] = useState("");
  const location = useLocation();
  const isSheet = location.pathname === "/sheet";

  useEffect(() => {
    // Clear the shared search box when leaving the sheet page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isSheet) setSearch("");
  }, [location.pathname, isSheet]);

  return (
    <div className="app-shell">
      <Navbar search={search} setSearch={setSearch} />

      <div className="app-body">
        <main className="page-shell">
          <Outlet context={{ search, setSearch }} />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
