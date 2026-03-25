import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API, { changePassword } from "../services/api";
import Sidebar from "../components/Sidebar/Sidebar";
import { 
  User, 
  Mail, 
  Calendar, 
  BarChart3, 
  Lock, 
  Download, 
  LogOut, 
  Moon, 
  BookOpen,
  CheckCircle2,
  Edit3,
  Zap,
  Sparkles,
  ShieldCheck,
  Activity,
  History,
  Inbox,
  Trash2,
  Briefcase,
  ClipboardList,
  GraduationCap,
  Droplets,
  Scroll,
  Timer
} from "lucide-react";
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

  useEffect(() => {
    fetchAll();

    // Refresh if profile is updated from other components/tabs
    window.addEventListener("profileUpdate", fetchAll);
    window.addEventListener("storage", (e) => {
      if (e.key === "profileUpdate") fetchAll();
    });

    return () => {
      window.removeEventListener("profileUpdate", fetchAll);
      window.removeEventListener("storage", fetchAll);
    };
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
      showToast("Password changed successfully!");
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
      const remaining = activities.filter((a) => a._id !== id);
      setActivities(remaining);
      
      // Update stats based on what's left
      const studyHours = remaining.reduce((s, a) => s + (Number(a.studyHours || 0) + Number(a.workHours || 0)), 0);
      const avgSleep = remaining.length ? (remaining.reduce((s, a) => s + (a.sleepHours || 0), 0) / remaining.length).toFixed(1) : 0;
      setProfile((p) => ({ ...p, stats: { ...p.stats, studyHours, tasksCompleted: remaining.length, avgSleep } }));
      
      showToast("Activity deleted");
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
      showToast("Data exported successfully!");
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

  const getInsight = () => {
    if (stats.studyHours >= 50 && stats.avgSleep >= 7) return { icon: <Sparkles size={16} />, text: "Excellent academic-life balance! Keep it up!" };
    if (stats.studyHours >= 30) return { icon: <BookOpen size={16} />, text: "Great study commitment! Make sure to rest enough." };
    if (stats.avgSleep >= 8) return { icon: <Moon size={16} />, text: "Good sleep habits! Try to increase study time." };
    if (stats.tasksCompleted >= 10) return { icon: <Zap size={16} />, text: "Consistent activity tracking! Stay focused." };
    return { icon: <Activity size={16} />, text: "Keep logging your activities to track your progress!" };
  };

  const insight = getInsight();

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="dashboard-main profile-page">
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

        <motion.div className="profile-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Profile</h1>
          <p>Manage your account & view progress</p>
        </motion.div>

        <div className="profile-grid">
          {/* USER CARD */}
          <motion.div className="profile-card user-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div
              className="avatar"
              onClick={() => user.avatar && setShowImage(true)}
              style={{ cursor: user.avatar ? "pointer" : "default" }}
            >
              {user.avatar ? <img src={user.avatar} alt="Avatar" /> : user.name.charAt(0).toUpperCase()}
            </div>

            <h2>{user.name}</h2>
            <span className="user-role">Student</span>

            <div className="user-info">
              <p><Mail size={16} className="info-icon" /> <span>{user.email}</span></p>
              <p><Calendar size={16} className="info-icon" /> <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span></p>
              <p><BarChart3 size={16} className="info-icon" /> <span>Activities: {stats.tasksCompleted} logged</span></p>
            </div>

            <button className="profile-btn-gradient" onClick={() => setShowEdit(true)}>
              <Edit3 size={18} /> Edit Profile
            </button>
          </motion.div>

          {/* ACCOUNT SETTINGS */}
          <motion.div className="profile-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="card-header-icon-group">
              <Zap size={18} color="#8b5cf6" />
              <h3>Account Settings</h3>
            </div>
            <ul className="settings-list">
              <li onClick={() => setShowPwModal(true)}>
                <div className="setting-icon-box s-icon-pw"><Lock size={18} /></div>
                <div className="setting-content">
                  <h4>Change Password</h4>
                  <p>Update your account password</p>
                </div>
                <span className="setting-arrow">→</span>
              </li>
              <li onClick={() => setShowEdit(true)}>
                <div className="setting-icon-box s-icon-edit"><User size={18} /></div>
                <div className="setting-content">
                  <h4>Edit Profile</h4>
                  <p>Change name & avatar</p>
                </div>
                <span className="setting-arrow">→</span>
              </li>
              <li onClick={handleExportData}>
                <div className="setting-icon-box s-icon-export"><Download size={18} /></div>
                <div className="setting-content">
                  <h4>{exporting ? "Exporting..." : "Export My Data"}</h4>
                  <p>Download your data as JSON</p>
                </div>
                <span className="setting-arrow">↓</span>
              </li>
              <li onClick={handleLogout} style={{ borderBottom: 'none' }}>
                <div className="setting-icon-box s-icon-logout"><LogOut size={18} /></div>
                <div className="setting-content">
                  <h4>Logout</h4>
                  <p>Sign out of your account</p>
                </div>
                <span className="setting-arrow">→</span>
              </li>
            </ul>
          </motion.div>

          {/* ACADEMIC OVERVIEW */}
          <motion.div className="profile-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="card-header-icon-group">
              <BarChart3 size={18} color="#2563eb" />
              <h3>Academic Overview</h3>
            </div>
            
            <div className="academic-stats-row">
              <div className="academic-stat-box">
                <div className="icon"><BookOpen size={20} color="#3b82f6" /></div>
                <h2>{stats.studyHours}</h2>
                <span>Study Hours</span>
              </div>
              <div className="academic-stat-box">
                <div className="icon"><CheckCircle2 size={20} color="#10b981" /></div>
                <h2>{stats.tasksCompleted}</h2>
                <span>Activities</span>
              </div>
              <div className="academic-stat-box">
                <div className="icon"><Moon size={20} color="#f59e0b" /></div>
                <h2>{stats.avgSleep}</h2>
                <span>Avg Sleep</span>
              </div>
            </div>

            <div className="premium-insight">
              <Sparkles size={16} className="star-icon" />
              <span>{insight.text}</span>
            </div>
          </motion.div>
        </div>

        {/* ACTIVITY HISTORY */}
        <div className="history-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scroll size={22} color="#92400e" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Activity History</h3>
            </div>
            <span className="history-count" style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
              {activities.length} entries
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="empty-state-profile">
              <Inbox size={48} />
              <p style={{ marginTop: '12px', color: '#64748b', fontWeight: '500' }}>No activity history found</p>
            </div>
          ) : (
            <div className="history-list">
              {activities.map((a) => (
                <div key={a._id} className="history-card">
                  <div className="history-top">
                    <div className="history-date">
                      <Calendar size={14} color="#3b82f6" />
                      {new Date(a.createdAt).toLocaleString('en-US', { 
                        day: 'numeric', month: 'numeric', year: 'numeric', 
                        hour: 'numeric', minute: '2-digit', hour12: true 
                      })}
                    </div>
                    <button onClick={() => handleDeleteActivity(a._id)} className="history-delete-btn">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="history-pills">
                    {/* WORK / STUDY PILL */}
                    <div className="h-stat-pill">
                      <div className="h-pill-icon h-bg-blue">
                        {a.activityType === "Work" ? <Briefcase size={12} /> : <BookOpen size={12} />}
                      </div>
                      <span>{a.activityType === "Work" ? (a.workHours || 0) : (a.studyHours || 0)} hrs</span>
                    </div>

                    {/* SUBJECTS & CLASSES (STUDENT ONLY) */}
                    {a.activityType !== "Work" && (
                      <>
                        <div className="h-stat-pill">
                          <div className="h-pill-icon h-bg-green"><ClipboardList size={12} /></div>
                          <span>{a.subjectsCount || 0} subj</span>
                        </div>
                        <div className="h-stat-pill">
                          <div className="h-pill-icon h-bg-purple"><GraduationCap size={12} /></div>
                          <span>{a.classesAttended || 0} classes</span>
                        </div>
                      </>
                    )}

                    <div className="h-stat-pill">
                      <div className="h-pill-icon h-bg-yellow"><Moon size={12} /></div>
                      <span>{a.sleepHours || 0} hrs</span>
                    </div>

                    <div className="h-stat-pill">
                      <div className="h-pill-icon h-bg-red"><Activity size={12} /></div>
                      <span>{a.physicalActivity || 0} min</span>
                    </div>

                    <div className="h-stat-pill">
                      <div className="h-pill-icon h-bg-cyan"><Droplets size={12} /></div>
                      <span>{a.waterLiters || 0} L</span>
                    </div>

                    <div className="h-stat-pill" style={{ border: a.stressLevel > 7 ? '1px solid #fee2e2' : '' }}>
                      <div className="h-pill-icon h-bg-orange"><Zap size={12} /></div>
                      <span>{a.stressLevel || 0}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {showImage && (
          <motion.div className="image-preview-overlay" onClick={() => setShowImage(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.img src={user.avatar} className="image-preview" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} />
          </motion.div>
        )}
      </AnimatePresence>

      {showEdit && (
        <ProfileEditModal
          user={user}
          onClose={() => setShowEdit(false)}
          onUpdate={(updatedUser) => {
            setProfile({ ...profile, user: updatedUser });
            window.dispatchEvent(new Event("profileUpdate"));
            localStorage.setItem("profileUpdate", Date.now().toString());
            showToast("Profile updated successfully! ✨");
          }}
        />
      )}

      <AnimatePresence>
        {showPwModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPwModal(false)}>
            <motion.div className="modal-card pw-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <div className="pw-modal-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <ShieldCheck size={24} color="#0ea5e9" />
                <h2 style={{ margin: 0 }}>Change Password</h2>
              </div>
              {pwError && <div className="pw-error">{pwError}</div>}
              <label>Current Password</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter current password" />
              <label>New Password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Enter new password" />
              <label>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" />
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowPwModal(false)}>Cancel</button>
                <button className="save-btn" onClick={handleChangePassword} disabled={pwLoading}>{pwLoading ? "Changing..." : "Change Password"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
