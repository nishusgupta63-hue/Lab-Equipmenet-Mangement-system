import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FaFlask,
  FaEnvelope,
  FaLock,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import labImage from "../assets/lab-illustration.png";
import "./Login.css";

const LABS = [
  "Biology Lab",
  "Chemistry Lab",
  "Physics Lab",
  "Electronics / CE Lab",
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // A successful sign up sends the user back here with a short message.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem("labbuddy_notice");
      if (saved) {
        setNotice(saved);
        window.sessionStorage.removeItem("labbuddy_notice");
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login({ email, password });
      // The backend decides the role; the dashboard renders the right view.
      navigate({ to: "/dashboard" });
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
          Track, request and manage laboratory equipment across every campus lab
          from one simple dashboard.
        </p>

        <img
          className="login-illustration"
          src={labImage}
          alt="Laboratory equipment illustration"
          width={1024}
          height={1024}
        />

        <div className="login-labs">
          {LABS.map((lab) => (
            <span className="login-lab-chip" key={lab}>
              {lab}
            </span>
          ))}
        </div>
      </section>

      <section className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <p className="subtitle">Welcome back! Please enter your details.</p>

          {notice && <div className="login-notice">{notice}</div>}
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
  <label htmlFor="email">Email</label>
  <div className="input-wrap">
    <FaEnvelope />
    <input
      id="email"
      type="email"
      placeholder="you@college.edu"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
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
      value={password}
      onChange={(e) => setPassword(e.target.value)}
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

          <button className="login-btn" type="submit" disabled={busy}>
            <FaSignInAlt />
            {busy ? " Signing in…" : " Sign In"}
          </button>

          <p className="login-switch">
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
