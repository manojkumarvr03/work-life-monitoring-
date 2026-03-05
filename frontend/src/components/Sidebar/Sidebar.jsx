import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";
import "./sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    API.get("/auth/profile")
      .then((res) => setUserName(res.data?.name || res.data?.user?.name || "Student"))
      .catch(() => { });
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { to: "/dashboard", icon: "📊", label: "Dashboard", badge: null },
    { to: "/tracker", icon: "📝", label: "Activity Tracker", badge: null },
    { to: "/goals", icon: "🎯", label: "Goals", badge: null },
    { to: "/reports", icon: "📈", label: "Reports", badge: null },
    { to: "/profile", icon: "👤", label: "Profile", badge: null },
  ];

  const timeStr = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = currentTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <aside className="sidebar">
      {/* Decorative gradient line on right edge */}
      <div className="sidebar-edge-line" />

      {/* Logo / Title */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">🎓</div>
        <div className="sidebar-logo-group">
          <span className="sidebar-brand">Work–Life</span>
          <span className="sidebar-brand-sub">Monitor</span>
        </div>
      </div>

      {/* Clock */}
      <div className="sidebar-clock">
        <span className="sidebar-clock-time">{timeStr}</span>
        <span className="sidebar-clock-date">{dateStr}</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map(({ to, icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
            {badge && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-user-footer">
        {userName && (
          <div className="sidebar-user-info">
            <div className="sidebar-avatar-circle">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">
                <span className="sidebar-status-dot" />
                Student — Online
              </div>
            </div>
          </div>
        )}

        <button className="logout-btn" onClick={logout}>
          <span className="logout-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
