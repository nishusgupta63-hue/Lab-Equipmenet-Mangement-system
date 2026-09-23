import { useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";

import { CATEGORIES, DEPARTMENT, useData } from "../context/DataContext";
import "../pages/Table.css";

/**
 * Reusable form used by both Add Equipment and Edit Equipment pages.
 */
export default function EquipmentForm({ initialValues, onSubmit, onCancel, submitLabel }) {
  const { labs } = useData();
  const [form, setForm] = useState({
    equipmentId: "",
    name: "",
    category: CATEGORIES[0],
    labId: "",
    description: "",
    quantity: 1,
    ...initialValues,
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.equipmentId.trim() || !form.name.trim()) {
      setError("Equipment ID and Equipment Name are required.");
      return;
    }
    if (Number(form.quantity) < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    if (!form.labId) {
      setError("Please choose a laboratory.");
      return;
    }

    setError("");
    onSubmit({ ...form, quantity: Number(form.quantity) });
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="equipmentId">Equipment ID</label>
          <input
            id="equipmentId"
            name="equipmentId"
            value={form.equipmentId}
            onChange={handleChange}
            placeholder="EQ-1010"
          />
        </div>

        <div className="field">
          <label htmlFor="name">Equipment Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Digital Multimeter"
          />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="department">Department</label>
          <input id="department" name="department" value={DEPARTMENT} readOnly />
        </div>

        <div className="field">
          <label htmlFor="labId">Laboratory</label>
          <select id="labId" name="labId" value={form.labId} onChange={handleChange}>
            <option value="">Select a laboratory</option>
            {labs.map((lab) => (
              <option key={lab._id} value={lab._id}>
                {lab.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="quantity">Total Quantity</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange}
          />
        </div>

        <div className="field full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description of the equipment"
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit">
          <FaSave /> {submitLabel || "Save Equipment"}
        </button>
        <button className="btn btn-light" type="button" onClick={onCancel}>
          <FaTimes /> Cancel
        </button>
      </div>
    </form>
  );
}
