import { Link } from "@tanstack/react-router";
import { FaSearch } from "react-icons/fa";
import { useMemo, useState } from "react";

import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { PageHead } from "../components/DashboardWidgets";
import { useData } from "../context/DataContext";
import "./Table.css";

export default function MyRequests() {
  const { requests, loading, error } = useData();
  const [search, setSearch] = useState("");

  // Show only the logged in student's requests
  const list = useMemo(() => {
    const text = search.trim().toLowerCase();
    return requests.filter(
      (r) => !text || r.equipmentName.toLowerCase().includes(text),
    );
  }, [requests, search]);

  return (
    <Layout title="My Requests">
      <PageHead
        title="My Equipment Requests"
        subtitle="Track the status of every request you have sent."
      />

      {error && <div className="form-error">{error}</div>}

      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            placeholder="Search my requests"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link className="btn btn-primary" to="/equipment">
          Request New Equipment
        </Link>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Laboratory</th>
                <th>Qty</th>
                <th>Purpose</th>
                <th>Requested On</th>
<th>Action Date</th>
<th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={7}>
                    {loading
                      ? "Loading your requests…"
                      : "You have not requested any equipment yet."}
                  </td>
                </tr>
              ) : (
                list.map((r) => (
                  <tr key={r._id}>
                    <td className="cell-title">{r.equipmentName}</td>
                    <td>{r.laboratory}</td>
                    <td>{r.quantity}</td>
                    <td>{r.purpose || "-"}</td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
<td>
  {r.status === "Approved" && r.approvedDate
    ? new Date(r.approvedDate).toLocaleString()
    : r.status === "Rejected" && r.rejectedDate
      ? new Date(r.rejectedDate).toLocaleString()
      : r.status === "Returned" && r.returnedDate
        ? new Date(r.returnedDate).toLocaleString()
        : "-"}
</td>

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
