import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid, ListChecks, Map as MapIcon, Database, Cpu,
  Layers, Network, Users, Code2, ChevronDown, PanelLeftClose,
  PanelLeft, MonitorCog, BookOpen,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", icon: LayoutGrid, to: "/", end: true },
  { label: "Sheets", icon: ListChecks, to: "/sheet" },
  { label: "Roadmap", icon: MapIcon, to: "/roadmap" },
  {
    label: "Core CS", icon: BookOpen,
    children: [
      { label: "DBMS", icon: Database, to: "/corecs/dbms" },
      { label: "OS", icon: Cpu, to: "/corecs/os" },
      { label: "OOP", icon: Layers, to: "/corecs/oop" },
      { label: "CN", icon: Network, to: "/corecs/cn" },
    ],
  },
  {
    label: "Basic Coding", icon: Code2,
    children: [
      { label: "Strings & Numbers", icon: Code2, to: "/coding/basics" },
    ],
  },
  { label: "HR & Behavioral", icon: Users, to: "/hr" },
  { label: "System Design", icon: MonitorCog, to: "#", disabled: true },
];

function SideItem({ item, collapsed, level = 0 }) {
  const location = useLocation();
  const isChildActive = item.children?.some(c => location.pathname.startsWith(c.to));
  const [open, setOpen] = useState(isChildActive);

  if (item.children) {
    return (
      <div className="sidebar-group">
        <button
          className={`sidebar-item sidebar-group-btn${isChildActive ? " active" : ""}${collapsed ? " collapsed" : ""}`}
          onClick={() => !collapsed && setOpen(v => !v)}
          title={collapsed ? item.label : undefined}
        >
          <item.icon size={18} className="sidebar-icon" />
          {!collapsed && <span className="sidebar-label">{item.label}</span>}
          {!collapsed && (
            <ChevronDown
              size={13}
              className="sidebar-chevron"
              style={{ transform: open ? "rotate(180deg)" : undefined }}
            />
          )}
        </button>
        {!collapsed && open && (
          <div className="sidebar-children">
            {item.children.map(child => (
              <SideItem key={child.to} item={child} collapsed={false} level={1} />
            ))}
          </div>
        )}
        {collapsed && (
          <div className="sidebar-flyout">
            <span className="sidebar-flyout-label">{item.label}</span>
            {item.children.map(child => (
              <NavLink key={child.to} to={child.to} className="sidebar-flyout-item">
                <child.icon size={14} />
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `sidebar-item${isActive ? " active" : ""}${item.disabled ? " disabled" : ""}${collapsed ? " collapsed" : ""}`
      }
      title={collapsed ? item.label : undefined}
      onClick={e => item.disabled && e.preventDefault()}
      style={{ paddingLeft: !collapsed && level > 0 ? "12px" : undefined }}
    >
      <item.icon size={level > 0 ? 15 : 18} className="sidebar-icon" />
      {!collapsed && <span className="sidebar-label">{item.label}</span>}
      {!collapsed && item.disabled && <span className="sidebar-soon">soon</span>}
    </NavLink>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-inner">
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <SideItem key={item.label} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
