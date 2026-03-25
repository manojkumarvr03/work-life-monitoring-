import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Lightbulb, 
  BarChart3, 
  User, 
  LogOut,
  GraduationCap,
  AlarmClock
} from "lucide-react";
import API from "../../services/api";
import "./sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchProfile = () => {
      API.get("/auth/profile")
        .then((res) => {
          const user = res.data?.user || res.data;
          setUserName(user?.name || "");
          setUserRole(user?.role || "Student");
          setUserAvatar(user?.avatar || "");
        })
        .catch(() => { });
    };

    fetchProfile();

    // Listen for custom "profileUpdate" event to refresh data
    window.addEventListener("profileUpdate", fetchProfile);
    window.addEventListener("storage", (e) => {
      if (e.key === "profileUpdate") fetchProfile();
    });

    return () => {
      window.removeEventListener("profileUpdate", fetchProfile);
      window.removeEventListener("storage", fetchProfile);
    };
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
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", badge: null },
    { to: "/tracker", icon: <ClipboardList size={20} />, label: "Activity Tracker", badge: null },
    { to: "/dashboard", icon: <AlarmClock size={20} color="#f43f5e" />, label: "Alarms", badge: null }, // Visually match the target
    { to: "/schedule", icon: <Calendar size={20} />, label: "Schedule", badge: null },
    { to: "/insights", icon: <Lightbulb size={20} />, label: "Insights", badge: null },
    { to: "/reports", icon: <BarChart3 size={20} />, label: "Reports", badge: null },
    { to: "/profile", icon: <User size={20} />, label: "Profile", badge: null },
  ];

  const timeStr = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = currentTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <aside className="sidebar">
      {/* Decorative gradient line on right edge */}
      <div className="sidebar-edge-line" />

      {/* Logo / Title */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <GraduationCap size={28} color="white" />
        </div>
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
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="sidebar-avatar-img" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">
                <span className="sidebar-status-dot" />
                {userRole} — Online
              </div>
            </div>
          </div>
        )}

        <button className="logout-btn" onClick={logout}>
          <span className="logout-icon">
            <LogOut size={18} />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
