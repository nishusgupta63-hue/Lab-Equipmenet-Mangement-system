import { useNavigate } from "@tanstack/react-router";

import Layout from "../components/Layout";
import EquipmentForm from "../components/EquipmentForm";
import { PageHead } from "../components/DashboardWidgets";
import { useData } from "../context/DataContext";

export default function EditEquipment({ id }) {
  const { equipments, updateEquipment } = useData();
  const navigate = useNavigate();

  const item = equipments.find((e) => e._id === id);

  if (!item) {
    return (
      <Layout title="Edit Equipment">
        <PageHead title="Equipment not found" subtitle="This item may have been deleted." />
        <button className="btn btn-primary" onClick={() => navigate({ to: "/equipment" })}>
          Back to Equipment
        </button>
      </Layout>
    );
  }

  function handleSubmit(values) {
    updateEquipment(id, values);
    navigate({ to: "/equipment" });
  }

  return (
    <Layout title="Edit Equipment">
      <PageHead title={`Edit ${item.name}`} subtitle="Update the equipment details." />
      <EquipmentForm
        initialValues={item}
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: "/equipment" })}
        submitLabel="Save Changes"
      />
    </Layout>
  );
}
