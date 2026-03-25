import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";
import "../../styles/auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Password strength calculator
  const getPasswordStrength = () => {
    const pwd = form.password;
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, label: "Weak", color: "#f43f5e" };
    if (score <= 2) return { level: 2, label: "Fair", color: "#f97316" };
    if (score <= 3) return { level: 3, label: "Good", color: "#fbbf24" };
    if (score <= 4) return { level: 4, label: "Strong", color: "#10b981" };
    return { level: 5, label: "Very Strong", color: "#22d3ee" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form);
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      if (message.toLowerCase().includes("already")) {
        setTimeout(() => navigate("/"), 2000);
      }
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
            Start Your <span className="text-gradient">Academic Journey</span> Today
          </h1>
          <p className="auth-showcase-desc">
            Join thousands of students who have transformed their study habits and achieved a healthier work-life balance.
          </p>

          {/* Benefits list */}
          <div className="auth-benefits">
            {[
              { icon: "✅", text: "Free forever — no hidden fees" },
              { icon: "📊", text: "AI-powered personalized insights" },
              { icon: "📅", text: "Intelligent schedule planning" },

            ].map((b, i) => (
              <div key={i} className="auth-benefit-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="auth-benefit-icon">{b.icon}</span>
                <span className="auth-benefit-text">{b.text}</span>
              </div>
            ))}
          </div>


        </div>
      </div>

      {/* RIGHT — Register card */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-logo-badge">✨</div>

          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join the academic excellence community</p>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">⚠️</span> {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <span className="auth-field-icon">👤</span>
              <input
                className="auth-input"
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                required
                id="register-name"
              />
            </div>

            <div className="auth-field">
              <span className="auth-field-icon">👤</span>
              <select
                className="auth-input"
                name="role"
                value={form.role}
                onChange={handleChange}
                style={{ cursor: "pointer" }}
              >
                <option value="Student">Student</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            <div className="auth-field">
              <span className="auth-field-icon">📧</span>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
                id="register-email"
              />
            </div>

            <div className="auth-field">
              <span className="auth-field-icon">🔒</span>
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create password"
                value={form.password}
                onChange={handleChange}
                required
                id="register-password"
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

            {/* Password strength */}
            {form.password && (
              <div className="password-strength">
                <div className="strength-bar-track">
                  <div
                    className="strength-bar-fill"
                    style={{
                      width: `${(strength.level / 5) * 100}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}

            <button
              className={`auth-btn register-btn btn-glow ${loading ? "auth-btn-loading" : ""}`}
              type="submit"
              disabled={loading}
              id="register-submit"
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>Create Account <span className="btn-arrow">→</span></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/" className="auth-footer-link">Sign in</Link>
          </div>

          <div className="auth-badges">
            <span className="auth-badge">🔒 Encrypted</span>
            <span className="auth-badge">⚡ Instant Setup</span>
            <span className="auth-badge">🌍 Global</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
