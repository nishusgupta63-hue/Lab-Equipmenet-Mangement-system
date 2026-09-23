import { createFileRoute } from "@tanstack/react-router";

import RequireAuth from "../components/RequireAuth";
import Labs from "../pages/Labs";

export const Route = createFileRoute("/labs")({
  head: () => ({
    meta: [
      { title: "Laboratories | LabTrack Lab Equipment Management" },
      {
        name: "description",
        content:
          "Create, update and remove the laboratories used for equipment tracking in the department.",
      },
      { property: "og:title", content: "Laboratories | LabTrack" },
      {
        property: "og:description",
        content: "Manage the department laboratories used for equipment tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth role="teacher">
      <Labs />
    </RequireAuth>
  ),
});
