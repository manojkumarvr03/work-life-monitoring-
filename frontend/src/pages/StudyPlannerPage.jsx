import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Lightbulb, 
  Book, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Timer, 
  XSquare, 
  RefreshCw,
  Rocket,
  PlusSquare,
  Sparkles,
  ClipboardList,
  Target
} from "lucide-react";
import * as PlannerAPI from "../services/api";
import "../styles/planner.css";

/* ────────────────────────────────────────────────────
   HELPER: DATE FORMATTING
──────────────────────────────────────────────────── */
const formatDate = (d) => new Date(d).toISOString().split("T")[0];
const displayDate = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

/* ────────────────────────────────────────────────────
   COMPONENT: FOCUS MODE OVERLAY
──────────────────────────────────────────────────── */
const FocusMode = ({ session, onExit }) => {
  const [timeLeft, setTimeLeft] = useState(session.durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const ss = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <motion.div 
      className="focus-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button className="exit-btn" onClick={onExit} style={{ position: "absolute", top: 40, right: 40, background: "transparent", color: "white", border: "2px solid white", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", fontWeight: "bold" }}>×</button>
      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        style={{ textAlign: "center" }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, opacity: 0.6, marginBottom: 20 }}>Focusing on: {session.subjectName}</div>
        <div className="focus-timer">{mm}:{ss}</div>
        <div style={{ marginTop: 40, fontSize: 18, fontStyle: "italic", opacity: 0.8 }}>"The secret of getting ahead is getting started."</div>
      </motion.div>
    </motion.div>
  );
};

/* ────────────────────────────────────────────────────
   MAIN PAGE: STUDY PLANNER
──────────────────────────────────────────────────── */
const StudyPlannerPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [view, setView] = useState("today"); // "today" | "week"
  const [availableHours, setAvailableHours] = useState(6);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [progress, setProgress] = useState(null);
  const [insights, setInsights] = useState([]);
  
  // Form State
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: "", priority: "Medium", deadline: "", dailyHours: 2, color: "#0ea5e9" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [subjRes, sessRes, progRes, insightRes] = await Promise.all([
        PlannerAPI.getPlannerSubjects(),
        PlannerAPI.getPlannerSessions(selectedDate),
        PlannerAPI.getPlannerProgress(),
        PlannerAPI.getPlannerInsights()
      ]);
      setSubjects(subjRes.data);
      setSessions(sessRes.data);
      setProgress(progRes.data);
      setInsights(insightRes.data);
    } catch (err) {
      console.error("Fetch Data Error:", err);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await PlannerAPI.addPlannerSubject(newSubject);
      setNewSubject({ name: "", priority: "Medium", deadline: "", dailyHours: 2, color: "#0ea5e9" });
      setShowAddSubject(false);
      fetchInitialData();
    } catch (err) { console.error(err); }
  };

  const handleGeneratePlan = async () => {
    try {
      await PlannerAPI.generatePlannerPlan({ availableHoursPerDay: Number(availableHours) });
      fetchInitialData();
    } catch (err) { alert(err.response?.data?.message || "Generation failed"); }
  };

  const updateStatus = async (id, status) => {
    try {
      await PlannerAPI.updatePlannerSessionStatus(id, status);
      // update locally for speed
      setSessions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
      // then refresh totals
      const pRes = await PlannerAPI.getPlannerProgress();
      setProgress(pRes.data);
    } catch (err) { console.error(err); }
  };

  const startFocus = (sess) => {
    setActiveSession(sess);
    setIsFocusMode(true);
  };

  return (
    <div className="dashboard-main planner-container">
      <AnimatePresence>
        {isFocusMode && <FocusMode session={activeSession} onExit={() => setIsFocusMode(false)} />}
      </AnimatePresence>

      <header className="planner-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '4px', background: 'var(--accent-primary)', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI ASSISTANT</span>
        </div>
        <h1>Study Management Planner</h1>
        <p>Intelligent timetable system based on your academic deadlines and goals.</p>
      </header>

      <div className="planner-grid">
        {/* SIDEBAR: SUBJECTS & PROGRESS */}
        <aside className="planner-sidebar">
          {/* PROGRESS CARD */}
          <div className="card glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <BarChart3 size={18} color="#0ea5e9" />
              <h3 style={{ margin: 0 }}>Weekly Progress</h3>
            </div>
            {progress ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: "#0ea5e9" }}>{progress.completionRate}%</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 20 }}>Completion Rate</div>
                
                <div style={{ height: 10, background: "#f1f5f9", borderRadius: 5, overflow: "hidden", marginBottom: 24 }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.completionRate}%` }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #0ea5e9, #2563eb)" }}
                  />
                </div>

                <div className="stats-grid">
                  <div>
                    <h2>{progress.completed}</h2>
                    <span>Done</span>
                  </div>
                  <div>
                    <h2>{progress.pending}</h2>
                    <span>Pending</span>
                  </div>
                  <div>
                    <h2>{Math.round(progress.focusMin/60)}h</h2>
                    <span>Focus</span>
                  </div>
                </div>
              </div>
            ) : <p>Loading data...</p>}
          </div>

          {/* INSIGHTS */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Lightbulb size={18} color="#f59e0b" />
              <h3 style={{ margin: 0 }}>AI Planner Insights</h3>
            </div>
            {insights.length > 0 ? insights.map((insight, idx) => (
              <div key={idx} className={`insight-card ${insight.type}`}>
                <div style={{ fontSize: 24 }}>{insight.emoji}</div>
                <div className="insight-text">{insight.message}</div>
              </div>
            )) : <p style={{ color: "#94a3b8", fontSize: 14 }}>All caught up! Your schedule looks balanced.</p>}
          </div>

          {/* SUBJECTS LIST */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Book size={18} color="#3b82f6" />
                <h3 style={{ margin: 0 }}>My Subjects</h3>
              </div>
              <button onClick={() => setShowAddSubject(!showAddSubject)} className="btn-status" style={{ padding: '4px 8px' }}><Plus size={14} /></button>
            </div>

            {showAddSubject && (
              <form className="subject-form card" onSubmit={handleCreateSubject} style={{ marginBottom: 24, padding: 16, border: "1px solid #e2e8f0" }}>
                <input required placeholder="Subject Name" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} />
                <div style={{ display: "flex", gap: 10 }}>
                  <select value={newSubject.priority} onChange={e => setNewSubject({...newSubject, priority: e.target.value})} style={{ flex: 1 }}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                  <input type="date" required value={newSubject.deadline} onChange={e => setNewSubject({...newSubject, deadline: e.target.value})} style={{ flex: 1.5 }} />
                </div>
                <button className="btn-generate" type="submit" style={{ padding: "10px", fontSize: 13, borderRadius: 10 }}>Add Subject</button>
              </form>
            )}

            <div className="subjects-list">
              {subjects.length > 0 ? subjects.map(s => (
                <div key={s._id} className="subject-item">
                  <div className="subject-info">
                    <div className="subject-color-dot" style={{ background: s.color }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className="subject-name">{s.name}</span>
                      <span className="subject-meta">{s.priority} • Due {new Date(s.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={async () => { if(window.confirm("Remove subject?")) { await PlannerAPI.deletePlannerSubject(s._id); fetchInitialData(); } }} className="btn-status" style={{ border: "none", color: "#94a3b8" }}>×</button>
                </div>
              )) : <p className="empty-text">No subjects added yet.</p>}
            </div>

            <div className="planner-settings card" style={{ marginTop: 20, padding: 16, background: "rgba(148, 163, 184, 0.05)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 12, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Rocket size={14} /> <span>Planner Settings</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#1e293b" }}>Daily Study Hours:</span>
                <input 
                  type="number" 
                  min="1" max="16" 
                  value={availableHours} 
                  onChange={e => setAvailableHours(parseInt(e.target.value))} 
                  style={{ width: 60, padding: "4px 8px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, textAlign: "center" }}
                />
              </div>
            </div>

            <button className="btn-generate" style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleGeneratePlan}>
              <RefreshCw size={14} /> Re-generate AI Schedule
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT: TIMETABLE */}
        <main className="planner-main">
          <div className="schedule-controls">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color="#0ea5e9" />
                <h3 style={{ margin: 0 }}>{displayDate(selectedDate)}</h3>
              </div>
              <input type="date" className="date-picker-minimal" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); PlannerAPI.getPlannerSessions(e.target.value).then(res => setSessions(res.data)); }} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 8px", fontSize: 13, color: "#64748b" }} />
            </div>
            <div className="view-toggle">
              <button 
                className={view === "today" ? "active" : ""} 
                onClick={() => { setView("today"); PlannerAPI.getPlannerSessions(selectedDate).then(res => setSessions(res.data)); }}
              >
                Today
              </button>
              <button 
                className={view === "week" ? "active" : ""} 
                onClick={() => { setView("week"); PlannerAPI.getPlannerWeekSessions().then(res => setSessions(res.data)); }}
              >
                7 Days
              </button>
            </div>
          </div>

          <div className="day-slots">
            {sessions.length > 0 ? (
              // Group sessions by date for display
              Object.entries(
                sessions.reduce((acc, s) => {
                  const d = formatDate(s.date);
                  if (!acc[d]) acc[d] = [];
                  acc[d].push(s);
                  return acc;
                }, {})
              ).map(([date, daySessions]) => (
                <div key={date} style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="#64748b" />
                      <h4 style={{ margin: 0, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{displayDate(date)}</h4>
                    </div>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }}></div>
                  </div>
                  {daySessions.map(sess => (
                    <motion.div 
                      key={sess._id} 
                      className={`session-slot ${sess.isBreak ? 'is-break' : ''} ${sess.status === "completed" ? "completed" : sess.status === "skipped" ? "skipped" : ""}`}
                      style={{ "--subj-color": sess.subjectColor, marginBottom: 8 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="slot-time">{sess.startTime}</div>
                      <div className="slot-content">
                        <div className="slot-title">{sess.subjectName || "Study Session"}</div>
                        <div className="slot-sub">
                          {sess.status === "completed" ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}><CheckCircle size={12} /> Completed</span>
                          ) : sess.status === "skipped" ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e11d48' }}><XSquare size={12} /> Missed</span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Timer size={12} /> {sess.durationMinutes} min session</span>
                          )}
                          {sess.rescheduledFrom && " • Rescheduled"}
                        </div>
                      </div>
                      <div className="slot-actions">
                        {!sess.isBreak && sess.status === "pending" && (
                          <>
                            <button className="btn-status" onClick={() => startFocus(sess)} title="Focus Mode"><Timer size={14} /></button>
                            <button className="btn-status completed" onClick={() => updateStatus(sess._id, "completed")} title="Mark as Done"><CheckCircle size={14} /></button>
                            <button className="btn-status skipped" onClick={() => updateStatus(sess._id, "skipped")} title="Skip Session"><XSquare size={14} /></button>
                          </>
                        )}
                        {sess.status !== "pending" && (
                          <button className="btn-status" onClick={() => updateStatus(sess._id, "pending")} title="Undo"><RefreshCw size={14} /></button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: "80px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 20, display: 'flex', justifyContent: 'center' }}><Calendar size={64} color="#e2e8f0" /></div>
                <h3 style={{ color: "#1e293b" }}>No active study schedule</h3>
                <p style={{ color: "#94a3b8", maxWidth: 400, margin: "0 auto" }}>Add your subjects and click the "Generate" button above to let AI build your perfect study plan based on your deadlines.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudyPlannerPage;
