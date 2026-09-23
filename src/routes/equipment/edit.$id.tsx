import { createFileRoute } from "@tanstack/react-router";

import RequireAuth from "../../components/RequireAuth";
import EditEquipment from "../../pages/EditEquipment";

export const Route = createFileRoute("/equipment/edit/$id")({
  head: () => ({
    meta: [
      { title: "Edit Equipment | LabTrack Lab Equipment Management" },
      {
        name: "description",
        content:
          "Update laboratory equipment details such as name, category, laboratory, subject and quantity.",
      },
      { property: "og:title", content: "Edit Equipment | LabTrack" },
      {
        property: "og:description",
        content: "Edit an existing laboratory equipment record.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditEquipmentRoute,
});

function EditEquipmentRoute() {
  const { id } = Route.useParams();
  return (
    <RequireAuth role="teacher">
      <EditEquipment id={id} />
    </RequireAuth>
  );
}
