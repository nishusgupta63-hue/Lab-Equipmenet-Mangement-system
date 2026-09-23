import { createFileRoute } from "@tanstack/react-router";

import RequireAuth from "../components/RequireAuth";
import MyRequests from "../pages/MyRequests";

export const Route = createFileRoute("/my-requests")({
  head: () => ({
    meta: [
      { title: "My Requests | LabTrack Lab Equipment Management" },
      {
        name: "description",
        content:
          "Track the status of your laboratory equipment requests: pending, approved, rejected or returned.",
      },
      { property: "og:title", content: "My Requests | LabTrack" },
      {
        property: "og:description",
        content: "Follow your lab equipment requests from pending to returned.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth role="student">
      <MyRequests />
    </RequireAuth>
  ),
});
