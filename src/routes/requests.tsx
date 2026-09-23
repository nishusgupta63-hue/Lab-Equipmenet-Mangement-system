import { createFileRoute } from "@tanstack/react-router";

import RequireAuth from "../components/RequireAuth";
import Requests from "../pages/Requests";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Equipment Requests | LabTrack Lab Equipment Management" },
      {
        name: "description",
        content:
          "Review student equipment requests: approve, reject and accept returned laboratory equipment.",
      },
      { property: "og:title", content: "Equipment Requests | LabTrack" },
      {
        property: "og:description",
        content: "Approve, reject and accept returns for lab equipment requests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth role="teacher">
      <Requests />
    </RequireAuth>
  ),
});
