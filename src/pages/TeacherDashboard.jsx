import { Link } from "@tanstack/react-router";
import {
  FaMicroscope,
  FaClipboardList,
  FaHourglassHalf,
  FaCheckCircle,
  FaPlusCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { PageHead, StatCard } from "../components/DashboardWidgets";
import { useAuth } from "../context/AuthContext";
import { useData, equipmentStatus } from "../context/DataContext";
import "./Table.css";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { equipments, requests, labs, loading, error } = useData();

  const totalEquipment = equipments.length;
  const totalUnits = equipments.reduce((sum, e) => sum + (e.quantity || 0), 0);
  const issuedUnits = equipments.reduce(
    (sum, e) => sum + ((e.quantity || 0) - (e.availableQuantity || 0)),
    0,
  );
  const pending = requests.filter((r) => r.status === "Pending");
  const approved = requests.filter((r) => r.status === "Approved");
  const lowStock = equipments.filter(
    (e) => e.status === "Out of Stock" || e.status === "Low Stock",
  );

  return (
    <Layout title="Teacher Dashboard">
      <PageHead
        title={`Welcome, ${user?.name || "Teacher"}`}
        subtitle={`Managing ${labs.length} laborator${labs.length === 1 ? "y" : "ies"} · ${approved.length} item${approved.length === 1 ? "" : "s"} currently issued.`}
      />

      {error && <div className="form-error">{error}</div>}
      {loading && <div className="cell-sub">Loading latest data…</div>}

      <div className="stats-grid">
        <StatCard icon={<FaMicroscope />} value={totalEquipment} label="Equipment Items" />
        <StatCard icon={<FaCheckCircle />} value={totalUnits} label="Total Units" />
        <StatCard icon={<FaClipboardList />} value={issuedUnits} label="Issued Units" />
        <StatCard icon={<FaHourglassHalf />} value={pending.length} label="Pending Requests" />
      </div>


      <div className="toolbar">
        <Link className="btn btn-primary" to="/equipment/add">
          <FaPlusCircle /> Add Equipment
        </Link>
        <Link className="btn btn-light" to="/requests">
          <FaClipboardList /> Review Requests
        </Link>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h4>Pending Requests</h4>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Equipment</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td className="empty-row" colSpan={4}>
                      No pending requests right now.
                    </td>
                  </tr>
                ) : (
                  pending.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div className="cell-title">{r.studentName}</div>
                        <div className="cell-sub">{r.studentEmail}</div>
                      </td>
                      <td>
                        <div className="cell-title">{r.equipmentName}</div>
                        <div className="cell-sub">{r.laboratory}</div>
                      </td>
                      <td>{r.quantity}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <h4>Stock Alerts</h4>
          {lowStock.length === 0 ? (
            <p className="cell-sub">All equipment has healthy stock levels.</p>
          ) : (

            lowStock.map((item) => (
              <div className="activity-item" key={item._id}>
                <div className="activity-dot">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <div className="activity-text">{item.name}</div>
                  <div className="activity-time">
                    {item.laboratory} · <StatusBadge status={equipmentStatus(item)} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
