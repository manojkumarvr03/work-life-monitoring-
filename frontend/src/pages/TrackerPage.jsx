import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Book, 
  Briefcase, 
  ClipboardList, 
  GraduationCap, 
  Moon, 
  Droplets, 
  Activity, 
  Beef, 
  Zap, 
  Star, 
  LayoutDashboard,
  BarChart3
} from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";
import API from "../services/api";
import "../styles/dashboard.css";

const TrackerPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [userRole, setUserRole] = useState("Student");
  const [form, setForm] = useState({
    activityType: "Study",
    studyHours: "",
    workHours: "",
    subjectsCount: "",
    classesAttended: "",
    sleepHours: "",
    physicalActivity: "",
    waterLiters: "",
    foodProtein: "",
    stressLevel: 5,
  });
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchActivities = async () => {
    try {
      const res = await API.get("/activities");
      setActivities(res.data);
    } catch (err) {
      console.error("Failed to load activities", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      const role = res.data.user?.role || "Student";
      setUserRole(role);
      setForm(prev => ({ ...prev, activityType: role === "Employee" ? "Work" : "Study" }));
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchActivities();
  }, []);

  const handleSubmit = async () => {
    if (form.activityType === "Study" && !form.studyHours) {
      showToast("Please fill Study hours", "error");
      return;
    }
    if (form.activityType === "Work" && !form.workHours) {
      showToast("Please fill Work hours", "error");
      return;
    }

    // Ensure life fields are filled
    if (!form.sleepHours || !form.waterLiters || !form.physicalActivity || !form.foodProtein.trim()) {
      showToast("Please complete the Life Monitor sections too!", "error");
      return;
    }

    setSaving(true);
    try {
      await API.post("/activities", { ...form, stressLevel: Number(form.stressLevel) });
      setForm({
        activityType: form.activityType,
        studyHours: "",
        workHours: "",
        subjectsCount: "",
        classesAttended: "",
        sleepHours: "",
        physicalActivity: "",
        waterLiters: "",
        foodProtein: "",
        stressLevel: 5,
      });
      await fetchActivities();
      showToast("✅ Activity logged successfully!");
    } catch (err) {
      console.error("Save failed", err);
      showToast("Failed to save activity", "error");
    } finally {
      setSaving(false);
    }
  };

  const recentActivities = activities.slice(0, 2); // Show only 2 recent

  const getStressColor = (level) => {
    if (level <= 3) return "#10b981";
    if (level <= 6) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="app-shell">
      <Sidebar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={`toast ${toast.type}`}>{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="dashboard-main">
        <div className="tracker-header">
          <motion.h1
            className="page-title glow-text"
          >
            <ClipboardList size={32} style={{ marginRight: 12, verticalAlign: 'bottom', color: '#0ea5e9' }} />
            Activity Tracker
          </motion.h1>
        </div>
        <div className="tracker-grid">
          {/* ===== FORM CONTAINER ===== */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", gridColumn: "1 / -1" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>

              {/* === WORK / STUDY TRACKER === */}
              <motion.div
                className="tracker-card glass-card"
              >
                <div className="card-header-icon-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  {userRole === "Employee" ? <Briefcase size={20} color="#0ea5e9" /> : <Book size={20} color="#0ea5e9" />}
                  <h3 className="glow-text" style={{ marginBottom: 0 }}>{userRole === "Employee" ? "Work Monitor" : "Study Monitor"}</h3>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  {userRole === "Employee" ? "Track your professional hours." : "Track your academic progress."}
                </p>

                {userRole === "Employee" && (
                  <div className="input-with-icon" style={{ marginTop: "12px" }}>
                    <Briefcase size={18} />
                    <input
                      className="modern-input"
                      type="number"
                      placeholder="Work Hours (e.g. 5)"
                      value={form.workHours}
                      min="0"
                      max="24"
                      onChange={(e) => setForm({ ...form, workHours: e.target.value })}
                    />
                  </div>
                )}

                {userRole === "Student" && (
                  <>
                    <div className="input-with-icon" style={{ marginTop: "12px" }}>
                      <Book size={18} />
                      <input
                        className="modern-input"
                        type="number"
                        placeholder="Study Hours (e.g. 5)"
                        value={form.studyHours}
                        min="0"
                        max="24"
                        onChange={(e) => setForm({ ...form, studyHours: e.target.value })}
                      />
                    </div>

                    <div className="input-with-icon">
                      <ClipboardList size={18} />
                      <input
                        className="modern-input"
                        type="number"
                        placeholder="Number of Subjects Studied (e.g. 3)"
                        value={form.subjectsCount || ""}
                        min="0"
                        onChange={(e) => setForm({ ...form, subjectsCount: e.target.value })}
                      />
                    </div>

                    <div className="input-with-icon">
                      <GraduationCap size={18} />
                      <input
                        className="modern-input"
                        type="number"
                        placeholder="Classes Attended (Number)"
                        value={form.classesAttended || ""}
                        min="0"
                        onChange={(e) => setForm({ ...form, classesAttended: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Stress Slider on the Left */}
                <div className="stress-section" style={{ marginTop: "32px" }}>
                  <div className="stress-value-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} /> Stress Level</span>
                    <span style={{ color: getStressColor(form.stressLevel) }}>{form.stressLevel}/10</span>
                  </div>
                  <input
                    type="range"
                    className="stress-slider"
                    min="1"
                    max="10"
                    value={form.stressLevel}
                    onChange={(e) => setForm({ ...form, stressLevel: e.target.value })}
                  />
                  <div className="stress-labels">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </motion.div>

              {/* === LIFE TRACKER === */}
              <motion.div
                className="tracker-card glass-card"
              >
                <div className="card-header-icon-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Activity size={20} color="#10b981" />
                  <h3 className="glow-text" style={{ marginBottom: 0 }}>Life Monitor</h3>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>Track your wellness, health, and personal life.</p>

                <div className="input-with-icon">
                  <Moon size={18} />
                  <input
                    className="modern-input"
                    type="number"
                    placeholder="Sleep Hours (e.g. 7)"
                    value={form.sleepHours}
                    min="0"
                    max="24"
                    onChange={(e) => setForm({ ...form, sleepHours: e.target.value })}
                  />
                </div>

                <div className="input-with-icon">
                  <Droplets size={18} />
                  <input
                    className="modern-input"
                    type="number"
                    placeholder="Water Drink (Liters)"
                    value={form.waterLiters}
                    min="0"
                    onChange={(e) => setForm({ ...form, waterLiters: e.target.value })}
                  />
                </div>

                <div className="input-with-icon">
                  <Activity size={18} />
                  <input
                    className="modern-input"
                    type="number"
                    placeholder="Physical Activity (minutes)"
                    value={form.physicalActivity}
                    min="0"
                    onChange={(e) => setForm({ ...form, physicalActivity: e.target.value })}
                  />
                </div>

                <div className="input-with-icon">
                  <Beef size={18} />
                  <input
                    className="modern-input"
                    type="text"
                    placeholder="Food / Protein Intake (e.g. 50g Chicken)"
                    value={form.foodProtein}
                    onChange={(e) => setForm({ ...form, foodProtein: e.target.value })}
                  />
                </div>
              </motion.div>
            </div>

            {/* SAVE BUTTON */}
            <motion.div
              style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}
            >
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="save-activity-btn"
                style={{ maxWidth: "340px" }}
              >
                {saving ? (
                  <span className="btn-loading">
                    <span className="auth-spinner" /> Saving...
                  </span>
                ) : (
                  <>
                    <Star size={20} style={{ marginRight: 8 }} />
                    Log Today's Progress
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* ===== RECENT 2 HISTORY ===== */}
          <motion.div
            className="tracker-card glass-card"
            style={{ gridColumn: "1 / -1" }}
          >
            <div className="card-header-icon-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <LayoutDashboard size={20} color="#0ea5e9" />
              <h3 className="glow-text" style={{ marginBottom: 0 }}>Recent Activity Tracking</h3>
            </div>

            {recentActivities.length === 0 && (
              <div className="empty-state-tracker">
                <div className="empty-icon-big"><BarChart3 size={48} /></div>
                <p>No activity logged yet.</p>
                <p className="empty-sub">Log your first entry to start tracking!</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {recentActivities.map((a, idx) => (
                <motion.div
                  className="modern-activity-item"
                  data-type={a.activityType}
                  key={a._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.08 }}
                >
                  <div className="activity-date">
                    {new Date(a.createdAt).toLocaleDateString("en-GB", {
                      weekday: "short", day: "numeric", month: "short"
                    })}
                  </div>
                  <div className="activity-stats">
                    <span style={{ background: a.activityType === "Work" ? "rgba(245, 158, 11, 0.15)" : "rgba(14, 165, 233, 0.15)", display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {a.activityType === "Work" ? <><Briefcase size={12} /> {a.workHours || 0}h work</> : <><Book size={12} /> {a.studyHours || 0}h study</>}
                    </span>
                    {a.subjectsCount > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ClipboardList size={12} /> {a.subjectsCount} subjects</span>}
                    {a.classesAttended > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><GraduationCap size={12} /> {a.classesAttended} classes</span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Moon size={12} /> {a.sleepHours || 0}h sleep</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={12} /> {a.physicalActivity || 0}min exercise</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Droplets size={12} /> {a.waterLiters || 0}L water</span>
                    <span style={{ borderColor: getStressColor(a.stressLevel), display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={12} /> {a.stressLevel || 0}/10 stress
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {activities.length > 2 && (
              <button
                onClick={() => navigate("/profile")}
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid rgba(14,165,233,0.2)",
                  background: "rgba(14,165,233,0.06)",
                  color: "#38bdf8",
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.target.style.background = "rgba(14,165,233,0.12)"; }}
                onMouseLeave={(e) => { e.target.style.background = "rgba(14,165,233,0.06)"; }}
              >
                View All {activities.length} Activities in Profile →
              </button>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TrackerPage;
