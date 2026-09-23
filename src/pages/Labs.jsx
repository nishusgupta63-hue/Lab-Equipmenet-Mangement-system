import { useState } from "react";
import { toast } from "sonner";
import { FaPlusCircle, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

import Layout from "../components/Layout";
import { PageHead } from "../components/DashboardWidgets";
import { useData } from "../context/DataContext";
import "./Table.css";

const EMPTY = { name: "", code: "", location: "", description: "" };

export default function Labs() {
  const { labs, addLab, updateLab, deleteLab, loading } = useData();

  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((old) => ({ ...old, [field]: value }));
  }

  function startEdit(lab) {
    setEditingId(lab._id);
    setForm({
      name: lab.name || "",
      code: lab.code || "",
      location: lab.location || "",
      description: lab.description || "",
    });
    setError("");
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.code.trim()) {
      setError("Laboratory name and code are required.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
      };
      if (editingId) {
  await updateLab(editingId, payload);
  setMessage("Laboratory updated.");
  toast.success("Laboratory updated successfully!");
} else {
  await addLab(payload);
  setMessage("Laboratory created.");
  toast.success("Laboratory created successfully!");
}
      setEditingId(null);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(lab) {
    if (!window.confirm(`Delete "${lab.name}"?`)) return;
    setError("");
    setMessage("");
    try {
      await deleteLab(lab._id);
      setMessage(`${lab.name} was deleted.`);
      toast.success(`${lab.name} deleted successfully!`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout title="Laboratories">
      <PageHead
        title="Laboratory Management"
        subtitle="Create and maintain the laboratories of the department."
      />

      {error && <div className="form-error">{error}</div>}
      {message && <div className="form-success">{message}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="lab-name">Laboratory Name</label>
            <input
              id="lab-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Networking Lab"
            />
          </div>

          <div className="field">
            <label htmlFor="lab-code">Lab Code</label>
            <input
              id="lab-code"
              value={form.code}
              onChange={(e) => update("code", e.target.value)}
              placeholder="NET-01"
            />
          </div>

          <div className="field">
            <label htmlFor="lab-location">Location</label>
            <input
              id="lab-location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Block B, 2nd floor"
            />
          </div>

          <div className="field full">
            <label htmlFor="lab-description">Description</label>
            <textarea
              id="lab-description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Short description of the laboratory"
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {editingId ? <FaSave /> : <FaPlusCircle />}
            {editingId ? " Save Changes" : " Add Laboratory"}
          </button>
          {editingId && (
            <button className="btn btn-light" type="button" onClick={cancelEdit}>
              <FaTimes /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-card" style={{ marginTop: 18 }}>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Laboratory</th>
                <th>Code</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {labs.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={4}>
                    {loading ? "Loading laboratories…" : "No laboratories yet."}
                  </td>
                </tr>
              ) : (
                labs.map((lab) => (
                  <tr key={lab._id}>
                    <td>
                      <div className="cell-title">{lab.name}</div>
                      <div className="cell-sub">{lab.description || "-"}</div>
                    </td>
                    <td>{lab.code}</td>
                    <td>{lab.location || "-"}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => startEdit(lab)}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(lab)}
                        >
                          <FaTrash /> Delete
                        </button>
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
