import { useNavigate } from "@tanstack/react-router";

import Layout from "../components/Layout";
import EquipmentForm from "../components/EquipmentForm";
import { PageHead } from "../components/DashboardWidgets";
import { useData } from "../context/DataContext";

export default function AddEquipment() {
  const { addEquipment } = useData();
  const navigate = useNavigate();

  function handleSubmit(values) {
    addEquipment(values);
    navigate({ to: "/equipment" });
  }

  return (
    <Layout title="Add Equipment">
      <PageHead
        title="Add New Equipment"
        subtitle="Register a new item in the laboratory inventory."
      />
      <EquipmentForm
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: "/equipment" })}
        submitLabel="Add Equipment"
      />
    </Layout>
  );
}
