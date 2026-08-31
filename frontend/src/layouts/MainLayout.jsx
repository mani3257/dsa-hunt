import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  const [search, setSearch] = useState("");
  const location = useLocation();
  const isSheet = location.pathname === "/sheet";

  useEffect(() => {
    if (!isSheet) setSearch("");
  }, [location.pathname, isSheet]);

  return (
    <div className="app-shell">
      <Navbar search={search} setSearch={setSearch} />

      <div className="app-body">
        <Sidebar />
        <main className="page-shell">
          <Outlet context={{ search, setSearch }} />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
