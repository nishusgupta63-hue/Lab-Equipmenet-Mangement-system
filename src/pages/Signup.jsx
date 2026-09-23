import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FaFlask,
  FaEnvelope,
  FaLock,
  FaUser,
  FaIdBadge,
  FaKey,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import labImage from "../assets/lab-illustration.png";
import "./Login.css";

const TABS = [
  { id: "student", label: "Student" },
  { id: "teacher", label: "Teacher" },
];

const EMPTY = {
  name: "",
  identifier: "",
  email: "",
  password: "",
  confirmPassword: "",
  teacherRegistrationCode: "",
};

export default function Signup() {
  const { registerStudent, registerTeacher } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("student");
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isTeacher = tab === "teacher";

  function update(field, value) {
    setForm((old) => ({ ...old, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email and password are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (isTeacher && !form.teacherRegistrationCode.trim()) {
      setError("The Teacher Registration Code is required.");
      return;
    }

    setBusy(true);
    try {
      if (isTeacher) {
        await registerTeacher({
          name: form.name.trim(),
          teacherId: form.identifier.trim() || undefined,
          email: form.email.trim(),
          password: form.password,
          teacherRegistrationCode: form.teacherRegistrationCode.trim(),
        });
      } else {
        await registerStudent({
          name: form.name.trim(),
          studentId: form.identifier.trim() || undefined,
          email: form.email.trim(),
          password: form.password,
        });
      }

      try {
        window.sessionStorage.setItem(
          "labbuddy_notice",
          "Account created successfully. Please sign in.",
        );
      } catch {
        /* ignore */
      }
      navigate({ to: "/" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="login-brand">
          <FaFlask />
          <span>LabTrack</span>
        </div>

        <h1>Lab Equipment Management System</h1>
        <p>
          Create your account to request laboratory equipment or to manage the
          department inventory.
        </p>

        <img
          className="login-illustration"
          src={labImage}
          alt="Laboratory equipment illustration"
          width={1024}
          height={1024}
        />
      </section>

      <section className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Create account</h2>
          <p className="subtitle">Choose the type of account you need.</p>

          <div className="login-tabs" role="tablist">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={"login-tab" + (tab === item.id ? " login-tab-active" : "")}
                onClick={() => {
                  setTab(item.id);
                  setError("");
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <div className="input-wrap">
              <FaUser />
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="identifier">{isTeacher ? "Teacher ID" : "Student ID"}</label>
            <div className="input-wrap">
              <FaIdBadge />
              <input
                id="identifier"
                type="text"
                placeholder={isTeacher ? "TCH-101" : "IT-2026-045"}
                value={form.identifier}
                onChange={(e) => update("identifier", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrap">
              <FaEnvelope />
              <input
                id="email"
                type="email"
                placeholder="you@college.edu"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
  <label htmlFor="password">Password</label>
  <div className="input-wrap">
    <FaLock />
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      value={form.password}
      onChange={(e) => update("password", e.target.value)}
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      style={{
        background: "none",
        border: "none",
        padding: "0",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
      }}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
</div>
<div className="form-group">
  <label htmlFor="confirmPassword">Confirm password</label>
  <div className="input-wrap">
    <FaLock />
    <input
      id="confirmPassword"
      type={showConfirmPassword ? "text" : "password"}
      placeholder="••••••••"
      value={form.confirmPassword}
      onChange={(e) => update("confirmPassword", e.target.value)}
    />
    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      aria-label={
        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
      }
      style={{
        background: "none",
        border: "none",
        padding: "0",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
      }}
    >
      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
</div>

          {isTeacher && (
            <div className="form-group">
              <label htmlFor="teacherRegistrationCode">Teacher Registration Code</label>
              <div className="input-wrap">
                <FaKey />
                <input
                  id="teacherRegistrationCode"
                  type="password"
                  placeholder="Provided by the department"
                  value={form.teacherRegistrationCode}
                  onChange={(e) => update("teacherRegistrationCode", e.target.value)}
                />
              </div>
            </div>
          )}

          <button className="login-btn" type="submit" disabled={busy}>
            <FaUserPlus />
            {busy ? " Creating account…" : " Create Account"}
          </button>

          <p className="login-switch">
            Already have an account? <Link to="/">Sign In</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
