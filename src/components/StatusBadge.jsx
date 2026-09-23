import "../pages/Table.css";

// Small reusable badge used for equipment status and request status
export default function StatusBadge({ status }) {
  const className = "badge badge-" + String(status).toLowerCase().replace(/\s+/g, "-");
  return <span className={className}>{status}</span>;
}
