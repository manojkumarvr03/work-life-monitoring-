import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/auth.css";

const FEATURES = [
  { icon: "📊", title: "Smart Analytics", desc: "AI-powered insights into your study patterns and productivity" },
  { icon: "🎯", title: "Goal Tracking", desc: "Set, track, and achieve your academic goals effortlessly" },

  { icon: "📈", title: "Balance Score", desc: "Real-time work-life balance scoring with recommendations" },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();

  // Rotate featured highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Animated orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      {/* LEFT — Feature showcase */}
      <div className="auth-showcase">
        <div className="auth-showcase-content">
          <div className="auth-showcase-logo">
            <span className="auth-logo-icon">🎓</span>
            <span className="auth-logo-text">Academic Balance</span>
          </div>
          <h1 className="auth-showcase-title">
            Master Your Academic <span className="text-gradient">Work-Life Balance</span>
          </h1>
          <p className="auth-showcase-desc">
            Track study habits, monitor wellness, and achieve your academic goals with AI-powered insights.
          </p>

          {/* Feature carousel */}
          <div className="auth-features-carousel">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`auth-feature-item ${i === activeFeature ? "active" : ""}`}
              >
                <span className="auth-feature-icon">{f.icon}</span>
                <div>
                  <div className="auth-feature-title">{f.title}</div>
                  <div className="auth-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="auth-stats-row">
            <div className="auth-stat">
              <span className="auth-stat-number">10K+</span>
              <span className="auth-stat-label">Students</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-number">95%</span>
              <span className="auth-stat-label">Improved Focus</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-number">4.9★</span>
              <span className="auth-stat-label">Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Login card */}
      <div className="auth-form-side">
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo-badge">🎓</div>

          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your journey</p>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">⚠️</span> {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <span className="auth-field-icon">📧</span>
              <input
                className="auth-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="login-email"
              />
            </div>

            <div className="auth-field">
              <span className="auth-field-icon">🔒</span>
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="login-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              className={`auth-btn login-btn btn-glow ${loading ? "auth-btn-loading" : ""}`}
              type="submit"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>Sign In <span className="btn-arrow">→</span></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register" className="auth-footer-link">Create one free</Link>
          </div>

          {/* Feature badges */}
          <div className="auth-badges">
            <span className="auth-badge">🔒 Secure</span>
            <span className="auth-badge">⚡ Fast</span>
            <span className="auth-badge">📊 Smart</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
