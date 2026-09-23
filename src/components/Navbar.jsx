import { FaBell, FaCog } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import "./Layout.css";

export default function Navbar({ title }) {
  const { user } = useAuth();
  const initial = user?.name ? user.name.charAt(0) : "U";

  return (
    <header className="navbar">
      <h3>{title}</h3>

      <div className="navbar-right">
        <FaBell className="navbar-icon" />
        <FaCog className="navbar-icon" />

        <div className="navbar-user">
          <div className="navbar-avatar">{initial}</div>
          <div className="navbar-user-info">
            <div className="navbar-user-name">{user?.name || "Guest"}</div>
            <div className="navbar-user-role">{user?.role || "-"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
