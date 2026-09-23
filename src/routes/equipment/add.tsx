import { createFileRoute } from "@tanstack/react-router";

import RequireAuth from "../../components/RequireAuth";
import AddEquipment from "../../pages/AddEquipment";

export const Route = createFileRoute("/equipment/add")({
  head: () => ({
    meta: [
      { title: "Add Equipment | LabTrack Lab Equipment Management" },
      {
        name: "description",
        content:
          "Register new laboratory equipment with category, laboratory, subject and quantity details.",
      },
      { property: "og:title", content: "Add Equipment | LabTrack" },
      {
        property: "og:description",
        content: "Add a new item to the college laboratory inventory.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth role="teacher">
      <AddEquipment />
    </RequireAuth>
  ),
});
