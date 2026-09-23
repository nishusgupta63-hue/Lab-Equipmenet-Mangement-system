import { createFileRoute } from "@tanstack/react-router";

import RequireAuth from "../../components/RequireAuth";
import EquipmentPage from "../../pages/Equipment";

export const Route = createFileRoute("/equipment/")({
  head: () => ({
    meta: [
      { title: "Equipment List | LabTrack Lab Equipment Management" },
      {
        name: "description",
        content:
          "Browse, search and filter laboratory equipment by Biology, Chemistry, Physics and Electronics laboratories.",
      },
      { property: "og:title", content: "Equipment List | LabTrack" },
      {
        property: "og:description",
        content: "Search and filter college laboratory equipment inventory.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <EquipmentPage />
    </RequireAuth>
  ),
});
