import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar/Sidebar";
import API from "../services/api";
import "../styles/dashboard.css";

const TrackerPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({
    studyHours: "",
    sleepHours: "",
    physicalActivity: "",
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

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSubmit = async () => {
    if (!form.studyHours && !form.sleepHours) {
      showToast("Please fill at least Study or Sleep hours", "error");
      return;
    }
    setSaving(true);
    try {
      await API.post("/activities", { ...form, stressLevel: Number(form.stressLevel) });
      setForm({ studyHours: "", sleepHours: "", physicalActivity: "", stressLevel: 5 });
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
        <motion.h1
          className="page-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          📝 Activity Tracker
        </motion.h1>

        <div className="tracker-grid">
          {/* ===== FORM ===== */}
          <motion.div
            className="tracker-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3>📋 Log Today's Activity</h3>

            <div className="input-group">
              <span className="input-icon">📘</span>
              <input
                type="number"
                placeholder="Study Hours (e.g. 3)"
                value={form.studyHours}
                min="0"
                max="24"
                onChange={(e) => setForm({ ...form, studyHours: e.target.value })}
              />
            </div>

            <div className="input-group">
              <span className="input-icon">😴</span>
              <input
                type="number"
                placeholder="Sleep Hours (e.g. 7)"
                value={form.sleepHours}
                min="0"
                max="24"
                onChange={(e) => setForm({ ...form, sleepHours: e.target.value })}
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🏃</span>
              <input
                type="number"
                placeholder="Physical Activity (minutes)"
                value={form.physicalActivity}
                min="0"
                onChange={(e) => setForm({ ...form, physicalActivity: e.target.value })}
              />
            </div>

            {/* Stress Slider */}
            <div className="stress-section">
              <div className="stress-value-label">
                <span>⚡ Stress Level</span>
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

            <button onClick={handleSubmit} disabled={saving} className="save-activity-btn">
              {saving ? (
                <span className="btn-loading">
                  <span className="auth-spinner" /> Saving...
                </span>
              ) : (
                "💾 Save Activity"
              )}
            </button>
          </motion.div>

          {/* ===== RECENT 2 HISTORY ===== */}
          <motion.div
            className="tracker-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3>🕐 Recent Activity</h3>

            {recentActivities.length === 0 && (
              <div className="empty-state-tracker">
                <div className="empty-icon-big">📊</div>
                <p>No activity logged yet.</p>
                <p className="empty-sub">Log your first entry to start tracking! 💪</p>
              </div>
            )}

            {recentActivities.map((a, idx) => (
              <motion.div
                className="activity-item"
                key={a._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <div className="activity-date">
                  {new Date(a.createdAt).toLocaleDateString("en-GB", {
                    weekday: "short", day: "numeric", month: "short"
                  })}
                </div>
                <div className="activity-stats">
                  <span>📘 {a.studyHours || 0}h study</span>
                  <span>😴 {a.sleepHours || 0}h sleep</span>
                  <span>🏃 {a.physicalActivity || 0}min</span>
                  <span style={{ borderColor: getStressColor(a.stressLevel) }}>
                    ⚡ {a.stressLevel || 0}/10
                  </span>
                </div>
              </motion.div>
            ))}

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
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
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
