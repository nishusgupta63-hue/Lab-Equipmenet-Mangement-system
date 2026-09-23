import { createFileRoute } from "@tanstack/react-router";

import Signup from "../pages/Signup";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account | LabTrack Lab Equipment Management" },
      {
        name: "description",
        content:
          "Create a LabTrack student or teacher account to request and manage college laboratory equipment.",
      },
      { property: "og:title", content: "Create Account | LabTrack" },
      {
        property: "og:description",
        content: "Register as a student or teacher to use the lab equipment system.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Signup,
});
