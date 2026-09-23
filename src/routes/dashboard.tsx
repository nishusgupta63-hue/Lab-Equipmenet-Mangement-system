import { createFileRoute } from "@tanstack/react-router";

import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import TeacherDashboard from "../pages/TeacherDashboard";
import StudentDashboard from "../pages/StudentDashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | LabTrack Lab Equipment Management" },
      {
        name: "description",
        content:
          "Role based dashboard showing laboratory equipment statistics, pending requests and quick actions for teachers and students.",
      },
      { property: "og:title", content: "Dashboard | LabTrack" },
      {
        property: "og:description",
        content: "Equipment statistics, requests and quick actions for your lab role.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <RequireAuth>
      <RoleDashboard />
    </RequireAuth>
  );
}

function RoleDashboard() {
  const { isTeacher } = useAuth();
  return isTeacher ? <TeacherDashboard /> : <StudentDashboard />;
}
