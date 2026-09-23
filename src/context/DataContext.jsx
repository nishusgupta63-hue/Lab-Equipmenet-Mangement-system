import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

/**
 * DataContext talks to the Express + MongoDB backend.
 * There is no local demo data any more: the backend is the only source of truth.
 */

const DataContext = createContext(null);

export const DEPARTMENT = "Department of Information Technology";

export const CATEGORIES = [
  "Instrument",
  "Glassware",
  "Chemical",
  "Electronic Kit",
  "Tool",
  "Computer Accessory",
];

export const EQUIPMENT_STATUSES = ["Available", "Low Stock", "Out of Stock"];

// Status is calculated by the backend and simply read here.
export function equipmentStatus(item) {
  return item?.status || "Available";
}

// Map a backend equipment document onto the field names the UI already uses.
function mapEquipment(item) {
  const lab = item.lab && typeof item.lab === "object" ? item.lab : null;
  return {
    _id: item._id,
    equipmentId: item.equipmentId,
    name: item.name,
    category: item.category,
    description: item.description || "",
    labId: lab ? lab._id : item.lab,
    laboratory: lab ? lab.name : "",
    labCode: lab ? lab.code : "",
    quantity: item.totalQuantity,
    availableQuantity: item.availableQuantity,
    status: item.status,
  };
}

function mapRequest(item) {
  const student = item.student && typeof item.student === "object" ? item.student : null;
  const equipment =
    item.equipment && typeof item.equipment === "object" ? item.equipment : null;
  const lab =
    equipment && equipment.lab && typeof equipment.lab === "object"
      ? equipment.lab
      : null;

  return {
    _id: item._id,
    equipmentId: equipment ? equipment._id : item.equipment,
    equipmentCode: equipment ? equipment.equipmentId : "",
    equipmentName: equipment ? equipment.name : "Equipment removed",
    laboratory: lab ? lab.name : "-",
    studentId: student ? student._id : item.student,
    studentName: student ? student.name : "Student",
    studentEmail: student ? student.email : "",
    quantity: item.quantity,
    purpose: item.purpose,
    status: item.status,
    createdAt: item.createdAt || item.requestDate, 
approvedDate: item.approvedDate, 
rejectedDate: item.rejectedDate,
returnedDate: item.returnedDate, 
  };
}

export function DataProvider({ children }) {
  const { user, isTeacher } = useAuth();

  const [labs, setLabs] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- LOADERS ---------------- */

  const loadLabs = useCallback(async () => {
    const result = await api("/labs");
    setLabs(result.data || []);
    return result.data || [];
  }, []);

  const loadEquipment = useCallback(async (filters = {}) => {
    const result = await api("/equipment", { params: filters });
    const mapped = (result.data || []).map(mapEquipment);
    setEquipments(mapped);
    return mapped;
  }, []);

  const loadRequests = useCallback(async () => {
    const path = isTeacher ? "/requests" : "/requests/my";
    const result = await api(path);
    const mapped = (result.data || []).map(mapRequest);
    setRequests(mapped);
    return mapped;
  }, [isTeacher]);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadLabs(), loadEquipment(), loadRequests()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, loadLabs, loadEquipment, loadRequests]);

  // Load everything once a user is signed in, clear it on logout.
  useEffect(() => {
    if (!user) {
      setLabs([]);
      setEquipments([]);
      setRequests([]);
      setError("");
      return;
    }
    refreshAll();
  }, [user, refreshAll]);

  /* ---------------- LABS ---------------- */

  const addLab = useCallback(
    async (data) => {
      await api("/labs", { method: "POST", body: data });
      await loadLabs();
    },
    [loadLabs],
  );

  const updateLab = useCallback(
    async (id, data) => {
      await api(`/labs/${id}`, { method: "PATCH", body: data });
      await loadLabs();
    },
    [loadLabs],
  );

  const deleteLab = useCallback(
    async (id) => {
      await api(`/labs/${id}`, { method: "DELETE" });
      await loadLabs();
    },
    [loadLabs],
  );

  /* ---------------- EQUIPMENT ---------------- */

  const addEquipment = useCallback(
    async (values) => {
      await api("/equipment", {
        method: "POST",
        body: {
          name: values.name,
          equipmentId: values.equipmentId,
          category: values.category,
          description: values.description,
          lab: values.labId,
          totalQuantity: Number(values.quantity),
        },
      });
      await loadEquipment();
    },
    [loadEquipment],
  );

  const updateEquipment = useCallback(
    async (id, values) => {
      // Issued units are owned by the request workflow, so only the
      // total quantity is ever sent from the form.
      await api(`/equipment/${id}`, {
        method: "PATCH",
        body: {
          name: values.name,
          equipmentId: values.equipmentId,
          category: values.category,
          description: values.description,
          lab: values.labId,
          totalQuantity: Number(values.quantity),
        },
      });
      await loadEquipment();
    },
    [loadEquipment],
  );

  const deleteEquipment = useCallback(
    async (id) => {
      await api(`/equipment/${id}`, { method: "DELETE" });
      await loadEquipment();
    },
    [loadEquipment],
  );

  const fetchEquipment = useCallback(async (id) => {
    const result = await api(`/equipment/${id}`);
    return mapEquipment(result.data);
  }, []);

  /* ---------------- REQUESTS ---------------- */

  const createRequest = useCallback(
    async ({ equipment, quantity, purpose }) => {
      await api("/requests", {
        method: "POST",
        body: {
          equipment: equipment._id,
          quantity: Number(quantity),
          purpose,
        },
      });
      await Promise.all([loadRequests(), loadEquipment()]);
    },
    [loadRequests, loadEquipment],
  );

  const actOnRequest = useCallback(
    async (id, action) => {
      await api(`/requests/${id}/${action}`, { method: "PATCH" });
      // Quantities live on the backend, so both lists are reloaded.
      await Promise.all([loadRequests(), loadEquipment()]);
    },
    [loadRequests, loadEquipment],
  );

  const approveRequest = useCallback((id) => actOnRequest(id, "approve"), [actOnRequest]);
  const rejectRequest = useCallback((id) => actOnRequest(id, "reject"), [actOnRequest]);
  const acceptReturn = useCallback((id) => actOnRequest(id, "return"), [actOnRequest]);

  const value = useMemo(
    () => ({
      labs,
      equipments,
      requests,
      loading,
      error,
      refreshAll,
      loadLabs,
      loadEquipment,
      loadRequests,
      addLab,
      updateLab,
      deleteLab,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      fetchEquipment,
      createRequest,
      approveRequest,
      rejectRequest,
      acceptReturn,
    }),
    [
      labs,
      equipments,
      requests,
      loading,
      error,
      refreshAll,
      loadLabs,
      loadEquipment,
      loadRequests,
      addLab,
      updateLab,
      deleteLab,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      fetchEquipment,
      createRequest,
      approveRequest,
      rejectRequest,
      acceptReturn,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
