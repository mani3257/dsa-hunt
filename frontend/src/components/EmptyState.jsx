import { Link } from "react-router-dom";

// Reusable empty state — replaces the ad-hoc <div className="empty-card">
// blocks that used a leftover blue-gray palette instead of the app's
// warm theme tokens. Icon is optional; actionTo/actionLabel render a CTA
// link when both are provided.
export default function EmptyState({ icon: Icon, title, description, actionTo, actionLabel }) {
  return (
    <div className="empty-state">
      {Icon && (
        <span className="empty-state-icon">
          <Icon size={22} />
        </span>
      )}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actionTo && actionLabel && (
        <Link to={actionTo} className="secondary-button">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
