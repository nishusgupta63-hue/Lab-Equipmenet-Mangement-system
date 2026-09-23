import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FaSearch,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";

import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { PageHead } from "../components/DashboardWidgets";
import { useAuth } from "../context/AuthContext";
import {
  useData,
  equipmentStatus,
  CATEGORIES,
  EQUIPMENT_STATUSES,
} from "../context/DataContext";
import "./Table.css";

export default function Equipment() {
  const { isTeacher } = useAuth();
  const { equipments, labs, loadEquipment, deleteEquipment, createRequest } = useData();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [labId, setLabId] = useState("All");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [requestItem, setRequestItem] = useState(null); // equipment being requested
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Search and filters are executed by the backend (/api/equipment).
  useEffect(() => {
    const filters = {
      search: search.trim() || undefined,
      lab: labId === "All" ? undefined : labId,
      category: category === "All" ? undefined : category,
      status: status === "All" ? undefined : status,
    };

    const timer = setTimeout(() => {
      setBusy(true);
      loadEquipment(filters)
        .then(() => setError(""))
        .catch((err) => setError(err.message))
        .finally(() => setBusy(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, labId, category, status, loadEquipment]);

  const list = equipments;

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name}" from the equipment list?`)) return;
    try {
      await deleteEquipment(item._id);
      setMessage(`${item.name} was deleted.`);

setTimeout(() => {
  setMessage("");
}, 4000);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitRequest(e) {
  e.preventDefault();

  setError("");
  setMessage("");

  if (!quantity || Number(quantity) < 1) {
    setError("Quantity is required.");
    return;
  }

  if (!purpose.trim()) {
    setError("Purpose/Description is required.");
    return;
  }

  if (Number(quantity) > requestItem.availableQuantity) {
    setError(`Only ${requestItem.availableQuantity} item(s) are available.`);
    return;
  }

  try {
    await createRequest({
      equipment: requestItem,
      quantity: Number(quantity),
      purpose: purpose.trim(),
    });

    setRequestItem(null);
    setQuantity(1);
    setPurpose("");
    setError("");
    setMessage("Your request has been sent to the lab teacher.");

setTimeout(() => {
  setMessage("");
}, 4000);
  } catch (err) {
    setError(err.message || "Failed to send request.");
  }
}


  return (
    <Layout title="Equipment">
      <PageHead
        title="Laboratory Equipment"
        subtitle="Department of Information Technology · all laboratory equipment."
      />

      {message && <div className="form-success">{message}</div>}
      
      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            placeholder="Search by name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={labId}
          onChange={(e) => setLabId(e.target.value)}
          aria-label="Filter by laboratory"
        >
          <option value="All">All Laboratories</option>
          {labs.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="All">All Statuses</option>
          {EQUIPMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {isTeacher && (
          <Link className="btn btn-primary" to="/equipment/add">
            <FaPlusCircle /> Add Equipment
          </Link>
        )}
      </div>


      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Category</th>
                <th>Laboratory</th>
                <th>Qty</th>
                <th>Available</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={7}>
                    {busy ? "Loading equipment…" : "No equipment found."}
                  </td>
                </tr>

              ) : (
                list.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="cell-title">{item.name}</div>
                      <div className="cell-sub">{item.equipmentId}</div>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.laboratory}</td>
                    <td>{item.quantity}</td>
                    <td>{item.availableQuantity}</td>
                    <td>
                      <StatusBadge status={equipmentStatus(item)} />
                    </td>
                    <td>
                      <div className="row-actions">
                        {isTeacher ? (
                          <>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() =>
                                navigate({
                                  to: "/equipment/edit/$id",
                                  params: { id: item._id },
                                })
                              }
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(item)}
                            >
                              <FaTrash /> Delete
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-sm btn-info"
                            disabled={item.availableQuantity === 0}
                           onClick={() => {
  setError("");
  setRequestItem(item);
}}
                          >
                            <FaPaperPlane /> Request
                          </button>
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

      {/* Simple request popup for students */}
      {requestItem && (
        <div className="modal-backdrop" onClick={() => setRequestItem(null)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitRequest}
          >
            <h3>Request Equipment</h3>
            <p className="modal-sub">
              {requestItem.name} · {requestItem.availableQuantity} available
            </p>

            <div className="field">
              <label htmlFor="req-qty">Quantity</label>
              <input
                id="req-qty"
                type="number"
                min="1"
                max={requestItem.availableQuantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label htmlFor="req-purpose">Purpose</label>
              <textarea
                id="req-purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Experiment or practical name"
              />
            </div>
            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                <FaPaperPlane /> Send Request
              </button>
              <button
                className="btn btn-light"
                type="button"
                onClick={() => setRequestItem(null)}
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
