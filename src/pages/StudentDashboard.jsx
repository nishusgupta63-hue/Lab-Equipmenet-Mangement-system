import { Link } from "@tanstack/react-router";
import {
  FaMicroscope,
  FaClipboardList,
  FaCheckCircle,
  FaHourglassHalf,
  FaSearch,
} from "react-icons/fa";

import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { PageHead, StatCard } from "../components/DashboardWidgets";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import "./Table.css";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { equipments, requests } = useData();

  // The backend already returns only this student's requests.
  const myRequests = requests;
  const approved = myRequests.filter((r) => r.status === "Approved");
  const pending = myRequests.filter((r) => r.status === "Pending");
  const availableUnits = equipments.reduce((sum, e) => sum + e.availableQuantity, 0);

  return (
    <Layout title="Student Dashboard">
      <PageHead
        title={`Welcome back, ${user?.name || "Student"}`}
        subtitle="Browse laboratory equipment and track your requests."
      />

      <div className="stats-grid">
        <StatCard icon={<FaMicroscope />} value={availableUnits} label="Units Available" />
        <StatCard icon={<FaClipboardList />} value={myRequests.length} label="My Requests" />
        <StatCard icon={<FaCheckCircle />} value={approved.length} label="Approved" />
        <StatCard icon={<FaHourglassHalf />} value={pending.length} label="Pending" />
      </div>

      <div className="toolbar">
        <Link className="btn btn-primary" to="/equipment">
          <FaSearch /> Browse Equipment
        </Link>
        <Link className="btn btn-light" to="/my-requests">
          <FaClipboardList /> My Requests
        </Link>
      </div>

      <div className="panel">
        <h4>My Recent Requests</h4>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Laboratory</th>
                <th>Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={4}>
                    You have not requested any equipment yet.
                  </td>
                </tr>
              ) : (
                myRequests.slice(0, 5).map((r) => (
                  <tr key={r._id}>
                    <td className="cell-title">{r.equipmentName}</td>
                    <td>{r.laboratory}</td>
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
    </Layout>
  );
}
