import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { api, clearToken, getToken, setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the stored JWT on every page load.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const result = await api("/auth/me");
        if (!cancelled) setUser(result.user);
      } catch {
        clearToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Any 401 from the API clears the session.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }
    window.addEventListener("labbuddy:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("labbuddy:unauthorized", handleUnauthorized);
  }, []);

  const applySession = useCallback((result) => {
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const result = await api("/auth/login", {
        method: "POST",
        auth: false,
        body: { email, password },
      });
      return applySession(result);
    },
    [applySession],
  );

  const registerStudent = useCallback(
    async ({ name, email, password, studentId }) => {
      const result = await api("/auth/register", {
        method: "POST",
        auth: false,
        body: { name, email, password, studentId },
      });
      // Registration never signs the user in: they return to the sign in page.
      return result.user;
    },
    [],
  );

  const registerTeacher = useCallback(
    async ({ name, email, password, teacherId, teacherRegistrationCode }) => {
      const result = await api("/auth/register-teacher", {
        method: "POST",
        auth: false,
        body: { name, email, password, teacherId, teacherRegistrationCode },
      });
      return result.user;
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // Role always comes from the backend, never from a form field.
  const isTeacher = user?.role === "teacher";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isTeacher,
        login,
        registerStudent,
        registerTeacher,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
