import "../pages/Dashboard.css";

// Small reusable pieces shared by all three dashboards

export function StatCard({ icon, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export function ActivityList({ items }) {
  return (
    <div className="panel">
      <h4>Recent Activity</h4>
      {items.map((item, index) => (
        <div className="activity-item" key={index}>
          <div className="activity-dot">{item.icon}</div>
          <div>
            <div className="activity-text">{item.text}</div>
            <div className="activity-time">{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuickActions({ actions }) {
  return (
    <div className="panel">
      <h4>Quick Actions</h4>
      <div className="quick-actions">
        {actions.map((action, index) => (
          <button className="quick-btn" key={index} type="button">
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PageHead({ title, subtitle }) {
  return (
    <div className="page-head">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}
