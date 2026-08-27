export default function StatCard({ label, value, sub, icon: Icon }) {
  return <div className="stat-card"><div className="stat-icon"><Icon size={18}/></div><div><span>{label}</span><strong>{value}</strong>{sub && <small>{sub}</small>}</div></div>;
}
