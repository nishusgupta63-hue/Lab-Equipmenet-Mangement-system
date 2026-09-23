import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "../context/AuthContext";

/**
 * Simple route guard.
 * Sends visitors back to the login page and can also block a role.
 */
export default function RequireAuth({ children, role = "" }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/" });
    else if (role && user.role !== role) navigate({ to: "/dashboard" });
  }, [loading, user, role, navigate]);

  if (loading || !user) return null;
  if (role && user.role !== role) return null;

  return children;
}
