import { useMemo, useState } from "react";
import { FaSearch, FaCheck, FaTimes, FaUndoAlt } from "react-icons/fa";

import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { PageHead } from "../components/DashboardWidgets";
import { useData } from "../context/DataContext";
import "./Table.css";

const STATUSES = ["All", "Pending", "Approved", "Rejected", "Returned"];

export default function Requests() {
  const { requests, approveRequest, rejectRequest, acceptReturn, loading, error: dataError } =
    useData();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const list = useMemo(() => {
    const text = search.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesStatus = status === "All" || r.status === status;
      const matchesText =
  !text ||
  r.equipmentName.toLowerCase().includes(text) ||
  r.studentName.toLowerCase().includes(text) ||
  r.studentEmail.toLowerCase().includes(text) ||
  r.laboratory.toLowerCase().includes(text);
      return matchesStatus && matchesText;
    });
  }, [requests, search, status]);

  const [busyId, setBusyId] = useState("");

 async function run(action, request, successText) {
  setBusyId(request._id);

  try {
    await action(request._id);
    setError("");
    setMessage(successText);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  } catch (err) {
    setMessage("");
    setError(err.message);
  } finally {
    setBusyId("");
  }
}

  return (
    <Layout title="Requests">
      <PageHead
        title="Equipment Requests"
        subtitle="Approve, reject and accept returned laboratory equipment."
      />

      {(error || dataError) && <div className="form-error">{error || dataError}</div>}
      {message && <div className="form-success">{message}</div>}

      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            placeholder="Search by student or equipment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s}
            </option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Equipment</th>
                <th>Laboratory</th>
                <th>Qty</th>
                <th>Purpose</th>
<th>Requested On</th>
<th>Action Date</th>
<th>Status</th>
<th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={9}>
                    {loading ? "Loading requests…" : "No requests found."}
                  </td>
                </tr>
              ) : (
                list.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="cell-title">{r.studentName}</div>
                      <div className="cell-sub">{r.studentEmail}</div>
                    </td>
                    <td className="cell-title">{r.equipmentName}</td>
                    <td>{r.laboratory}</td>
                    <td>{r.quantity}</td>
                   <td>
  <div className="cell-sub">
    {r.purpose || "-"}
  </div>
</td>

<td>
  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
</td>

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

<td>
                      <div className="row-actions">
                        {r.status === "Pending" && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              disabled={busyId === r._id}
                              onClick={() =>
                                run(approveRequest, r, "Request approved and equipment issued.")
                              }
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              disabled={busyId === r._id}
                              onClick={() => run(rejectRequest, r, "Request rejected.")}
                            >
                              <FaTimes /> Reject
                            </button>
                          </>
                        )}

                        {r.status === "Approved" && (
                          <button
                            className="btn btn-sm btn-info"
                            disabled={busyId === r._id}
                            onClick={() =>
                              run(acceptReturn, r, "Return accepted, stock updated.")
                            }
                          >
                            <FaUndoAlt /> Accept Return
                          </button>
                        )}

                        {(r.status === "Rejected" || r.status === "Returned") && (
                          <span className="cell-sub">No action needed</span>
                        )}
                      </div>
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
