import { Link, useNavigate } from "@tanstack/react-router";
import {
  FaFlask,
  FaThLarge,
  FaMicroscope,
  FaPlusCircle,
  FaClipboardList,
  FaListAlt,
  FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import "./Layout.css";

export default function Sidebar() {
  const { user, logout, isTeacher } = useAuth();
  const navigate = useNavigate();

  // Menu changes with the logged in role
  const teacherMenu = [
    { label: "Dashboard", icon: <FaThLarge />, to: "/dashboard" },
    { label: "Equipment", icon: <FaMicroscope />, to: "/equipment" },
    { label: "Add Equipment", icon: <FaPlusCircle />, to: "/equipment/add" },
    { label: "Laboratories", icon: <FaFlask />, to: "/labs" },
    { label: "Requests", icon: <FaClipboardList />, to: "/requests" },
  ];

  const studentMenu = [
    { label: "Dashboard", icon: <FaThLarge />, to: "/dashboard" },
    { label: "Equipment", icon: <FaMicroscope />, to: "/equipment" },
    { label: "My Requests", icon: <FaListAlt />, to: "/my-requests" },
  ];

  const menu = isTeacher ? teacherMenu : studentMenu;

  function handleLogout() {
    logout();
    navigate({ to: "/" });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <FaFlask />
        <span>LabTrack</span>
      </div>

      <nav className="sidebar-menu">
        {menu.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="sidebar-link"
            activeOptions={{ exact: item.to === "/equipment" }}
            activeProps={{ className: "sidebar-link active" }}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout {user ? "" : ""}</span>
      </button>
    </aside>
  );
}
