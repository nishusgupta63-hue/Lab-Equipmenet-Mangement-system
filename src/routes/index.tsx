import { createFileRoute } from "@tanstack/react-router";
import Login from "../pages/Login";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In | LabTrack Lab Equipment Management" },
      {
        name: "description",
        content:
          "Sign in to LabTrack to request, track and manage college laboratory equipment across Biology, Chemistry, Physics and Electronics labs.",
      },
      { property: "og:title", content: "Sign In | LabTrack Lab Equipment Management" },
      {
        property: "og:description",
        content:
          "Sign in to LabTrack to request, track and manage college laboratory equipment across Biology, Chemistry, Physics and Electronics labs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});
