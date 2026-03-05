import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar/Sidebar";
import API from "../services/api";
import { changePassword } from "../services/api";
import ProfileEditModal from "../components/Profile/ProfileEditModal";
import "../styles/profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [toast, setToast] = useState(null);

  // Password modal
  const [showPwModal, setShowPwModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  // Export data
  const [exporting, setExporting] = useState(false);

  /* ======= TOAST ======= */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ======= FETCH DATA ======= */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const profileRes = await API.get("/auth/profile");
        const activityRes = await API.get("/activities");
        setProfile(profileRes.data);
        setActivities(activityRes.data);
      } catch (err) {
        console.error("Profile fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* ======= CHANGE PASSWORD ======= */
  const handleChangePassword = async () => {
    setPwError("");

    if (!currentPw || !newPw || !confirmPw) {
      setPwError("All fields are required");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match");
      return;
    }

    try {
      setPwLoading(true);
      await changePassword({ currentPassword: currentPw, newPassword: newPw });
      setShowPwModal(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      showToast("Password changed successfully! 🔒");
    } catch (err) {
      setPwError(err.response?.data?.message || "Password change failed");
    } finally {
      setPwLoading(false);
    }
  };

  /* ======= DELETE ACTIVITY ======= */
  const handleDeleteActivity = async (id) => {
    try {
      await API.delete(`/activities/${id}`);
      setActivities((prev) => prev.filter((a) => a._id !== id));
      // Update stats
      const remaining = activities.filter((a) => a._id !== id);
      const studyHours = remaining.reduce((s, a) => s + (a.studyHours || 0), 0);
      const avgSleep = remaining.length ? (remaining.reduce((s, a) => s + (a.sleepHours || 0), 0) / remaining.length).toFixed(1) : 0;
      setProfile((p) => ({ ...p, stats: { ...p.stats, studyHours, tasksCompleted: remaining.length, avgSleep } }));
      showToast("Activity deleted ✓");
    } catch (err) {
      showToast("Failed to delete", "error");
    }
  };

  /* ======= EXPORT DATA ======= */
  const handleExportData = () => {
    setExporting(true);
    try {
      const data = {
        profile: { name: profile.user.name, email: profile.user.email, joinedAt: profile.user.createdAt },
        stats: profile.stats,
        activities: activities.map((a) => ({
          date: new Date(a.createdAt).toLocaleString(),
          studyHours: a.studyHours,
          sleepHours: a.sleepHours,
          physicalActivity: a.physicalActivity,
          stressLevel: a.stressLevel,
        })),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `profile_data_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Data exported successfully! 📁");
    } catch {
      showToast("Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  /* ======= LOGOUT ======= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  /* ======= LOADING ======= */
  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-loading">
            <div className="loading-spinner" />
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile?.user) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-loading">
            <p>Unable to load profile. Please try again.</p>
            <button className="edit-btn" onClick={() => window.location.reload()}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  const { user, stats } = profile;

  // Dynamic insight based on stats
  const getInsight = () => {
    if (stats.studyHours >= 50 && stats.avgSleep >= 7) return "🌟 Excellent academic-life balance! Keep it up!";
    if (stats.studyHours >= 30) return "📚 Great study commitment! Make sure to rest enough.";
    if (stats.avgSleep >= 8) return "😴 Good sleep habits! Try to increase study time.";
    if (stats.tasksCompleted >= 10) return "🔥 Consistent activity tracking! Stay focused.";
    return "💪 Keep logging your activities to track your progress!";
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="dashboard-main profile-page">
        {/* TOAST */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className={`profile-toast ${toast.type}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <motion.div className="profile-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Profile</h1>
          <p>Manage your account & view progress</p>
        </motion.div>

        {/* ================= TOP GRID ================= */}
        <div className="profile-grid">
          {/* USER CARD */}
          <motion.div className="profile-card user-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div
              className="avatar"
              onClick={() => user.avatar && setShowImage(true)}
              style={{ cursor: user.avatar ? "pointer" : "default" }}
              title={user.avatar ? "Click to view full image" : ""}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Profile Avatar" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <h2>{user.name}</h2>
            <span className="user-role">Student</span>

            <div className="user-info">
              <p><span className="info-icon">📧</span> <strong>Email:</strong> {user.email}</p>
              <p><span className="info-icon">📅</span> <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              <p><span className="info-icon">📊</span> <strong>Activities:</strong> {stats.tasksCompleted} logged</p>
            </div>

            <button className="edit-btn" onClick={() => setShowEdit(true)}>
              ✏️ Edit Profile
            </button>
          </motion.div>

          {/* ACCOUNT SETTINGS — ALL WORKING */}
          <motion.div className="profile-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3>⚙️ Account Settings</h3>
            <ul className="settings-list">
              <li onClick={() => { setShowPwModal(true); setPwError(""); }}>
                <span className="setting-icon">🔐</span>
                <div>
                  <div className="setting-title">Change Password</div>
                  <div className="setting-desc">Update your account password</div>
                </div>
                <span className="setting-arrow">→</span>
              </li>

              <li onClick={() => setShowEdit(true)}>
                <span className="setting-icon">👤</span>
                <div>
                  <div className="setting-title">Edit Profile</div>
                  <div className="setting-desc">Change name & avatar</div>
                </div>
                <span className="setting-arrow">→</span>
              </li>

              <li onClick={handleExportData}>
                <span className="setting-icon">📁</span>
                <div>
                  <div className="setting-title">{exporting ? "Exporting..." : "Export My Data"}</div>
                  <div className="setting-desc">Download all your data as JSON</div>
                </div>
                <span className="setting-arrow">↓</span>
              </li>

              <li onClick={handleLogout} className="setting-danger">
                <span className="setting-icon">🚪</span>
                <div>
                  <div className="setting-title">Logout</div>
                  <div className="setting-desc">Sign out of your account</div>
                </div>
                <span className="setting-arrow">→</span>
              </li>
            </ul>
          </motion.div>

          {/* ACADEMIC OVERVIEW */}
          <motion.div className="profile-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3>📊 Academic Overview</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon-box stat-study">📘</div>
                <h2>{stats.studyHours}</h2>
                <span>Study Hours</span>
              </div>
              <div className="stat-item">
                <div className="stat-icon-box stat-tasks">✅</div>
                <h2>{stats.tasksCompleted}</h2>
                <span>Activities</span>
              </div>
              <div className="stat-item">
                <div className="stat-icon-box stat-sleep">😴</div>
                <h2>{stats.avgSleep}</h2>
                <span>Avg Sleep</span>
              </div>
            </div>

            <p className="insight">{getInsight()}</p>
          </motion.div>
        </div>

        {/* ================= ACTIVITY HISTORY ================= */}
        <motion.div className="profile-history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="history-header">
            <h3>📜 Activity History</h3>
            <span className="history-count">{activities.length} entries</span>
          </div>

          {activities.length === 0 ? (
            <div className="empty-state-profile">
              <div className="empty-icon-big">📭</div>
              <p>No activity history yet</p>
              <p className="empty-sub">Start logging activities to see them here</p>
              <button className="edit-btn" style={{ maxWidth: 200, margin: "16px auto 0" }} onClick={() => navigate("/tracker")}>
                📝 Log Activity
              </button>
            </div>
          ) : (
            <div className="history-list">
              {activities.map((a) => (
                <motion.div
                  className="history-card"
                  key={a._id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className="history-card-top">
                    <div className="history-date">
                      📅 {new Date(a.createdAt).toLocaleString()}
                    </div>
                    <button
                      className="history-delete-btn"
                      onClick={() => handleDeleteActivity(a._id)}
                      title="Delete this activity"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="history-stats">
                    <span className="h-stat"><span className="h-icon">📘</span> {a.studyHours || 0} hrs</span>
                    <span className="h-stat"><span className="h-icon">😴</span> {a.sleepHours || 0} hrs</span>
                    <span className="h-stat"><span className="h-icon">🏃</span> {a.physicalActivity || 0} min</span>
                    <span className={`h-stat stress-${a.stressLevel <= 3 ? "low" : a.stressLevel <= 6 ? "mid" : "high"}`}>
                      <span className="h-icon">⚡</span> {a.stressLevel || 0}/10
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* ================= FULL IMAGE MODAL ================= */}
      <AnimatePresence>
        {showImage && (
          <motion.div
            className="image-preview-overlay"
            onClick={() => setShowImage(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={user.avatar}
              alt="Full Profile"
              className="image-preview"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {showEdit && (
        <ProfileEditModal
          user={user}
          onClose={() => setShowEdit(false)}
          onUpdate={(updatedUser) => {
            setProfile({ ...profile, user: updatedUser });
            showToast("Profile updated successfully! ✨");
          }}
        />
      )}

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      <AnimatePresence>
        {showPwModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPwModal(false)}
          >
            <motion.div
              className="modal-card pw-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>🔐 Change Password</h2>

              {pwError && (
                <div className="pw-error">{pwError}</div>
              )}

              <label>Current Password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
              />

              <label>New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
              />

              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
              />

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowPwModal(false)} disabled={pwLoading}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleChangePassword} disabled={pwLoading}>
                  {pwLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
