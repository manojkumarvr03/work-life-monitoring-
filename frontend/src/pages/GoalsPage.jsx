import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import API from "../services/api";
import "../styles/goals.css";

const GoalsPage = () => {
    const [goals, setGoals] = useState([]);
    const [form, setForm] = useState({ title: "", description: "", targetDate: "" });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchGoals = async () => {
        try {
            const res = await API.get("/goals");
            setGoals(res.data);
        } catch {
            showToast("Failed to load goals", "error");
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchGoals();
    }, []);

    const createGoal = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        try {
            const res = await API.post("/goals", form);
            setGoals((prev) => [res.data, ...prev]);
            setForm({ title: "", description: "", targetDate: "" });
            showToast(`🎯 Goal "${res.data.title}" created!`);
        } catch {
            showToast("Failed to create goal", "error");
        }
    };

    const updateProgress = async (id, progress) => {
        try {
            const res = await API.put(`/goals/${id}`, { progress });
            setGoals((prev) => prev.map((g) => (g._id === id ? res.data : g)));
        } catch {
            showToast("Failed to update progress", "error");
        }
    };

    const toggleComplete = async (id, completed) => {
        try {
            const res = await API.put(`/goals/${id}`, {
                completed: !completed,
                progress: !completed ? 100 : undefined,
            });
            setGoals((prev) => prev.map((g) => (g._id === id ? res.data : g)));
            showToast(!completed ? "🏆 Goal Completed! Congrats!" : "↩️ Goal reopened", !completed ? "success" : "info");
        } catch {
            showToast("Failed to update goal", "error");
        }
    };

    const deleteGoal = async (id, title) => {
        try {
            await API.delete(`/goals/${id}`);
            setGoals((prev) => prev.filter((g) => g._id !== id));
            showToast(`🗑️ "${title}" deleted`, "info");
        } catch {
            showToast("Failed to delete goal", "error");
        }
    };

    const daysLeft = (targetDate) => {
        if (!targetDate) return null;
        const diff = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <div className="app-shell">
            <Sidebar />

            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>{toast.message}</div>
                </div>
            )}

            <main className="dashboard-main goals-page">
                {/* Header */}
                <div className="goals-header">
                    <div className="goals-header-text">
                        <h1>🎯 Academic Goals</h1>
                        <p>Set targets, track progress, and crush your goals</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="dashboard-grid" style={{ marginBottom: "28px" }}>
                    <div className="card" style={{ textAlign: "center" }}>
                        <h3>Total Goals</h3>
                        <div className="stat-box" style={{ border: "none", background: "none" }}>
                            <h2>{goals.length}</h2>
                            <span>Created</span>
                        </div>
                    </div>
                    <div className="card" style={{ textAlign: "center" }}>
                        <h3>Completed</h3>
                        <div className="stat-box" style={{ border: "none", background: "none" }}>
                            <h2>{goals.filter((g) => g.completed).length}</h2>
                            <span>Achieved 🏆</span>
                        </div>
                    </div>
                    <div className="card" style={{ textAlign: "center" }}>
                        <h3>In Progress</h3>
                        <div className="stat-box" style={{ border: "none", background: "none" }}>
                            <h2>{goals.filter((g) => !g.completed).length}</h2>
                            <span>Active 🔥</span>
                        </div>
                    </div>
                </div>

                {/* Add Goal Form */}
                <div className="add-goal-form">
                    <h3>➕ Set New Goal</h3>
                    <form onSubmit={createGoal}>
                        <div className="goal-form-grid">
                            <input
                                type="text"
                                placeholder="Goal title (e.g., Score 90% in Math)"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                            <input
                                type="date"
                                placeholder="Target date"
                                value={form.targetDate}
                                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                            />
                        </div>
                        <textarea
                            placeholder="Description (optional) — what does success look like?"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <button type="submit" className="add-goal-btn">
                            🎯 Add Goal
                        </button>
                    </form>
                </div>

                {/* Goals List */}
                {loading ? (
                    <p className="empty-text">Loading goals...</p>
                ) : (
                    <div className="goals-list">
                        {goals.length === 0 ? (
                            <div className="goals-empty">
                                <div className="empty-icon">🎯</div>
                                <p>No goals yet. Set your first academic goal above!</p>
                            </div>
                        ) : (
                            goals.map((goal) => {
                                const days = daysLeft(goal.targetDate);
                                return (
                                    <div key={goal._id} className={`goal-card ${goal.completed ? "completed" : ""}`}>
                                        <div className="goal-card-top">
                                            <div>
                                                <div className="goal-title">{goal.title}</div>
                                                {goal.description && (
                                                    <div className="goal-desc">{goal.description}</div>
                                                )}
                                                <div className="goal-meta">
                                                    {goal.completed && (
                                                        <span className="goal-tag completed-tag">✅ Completed</span>
                                                    )}
                                                    {days !== null && !goal.completed && (
                                                        <span className={`goal-tag ${days < 0 ? "completed-tag" : ""}`}>
                                                            {days < 0
                                                                ? `${Math.abs(days)}d overdue`
                                                                : days === 0
                                                                    ? "Due today!"
                                                                    : `${days}d remaining`}
                                                        </span>
                                                    )}
                                                    {goal.targetDate && (
                                                        <span className="goal-tag" style={{ background: "rgba(14,165,233,0.1)", color: "#38bdf8", borderColor: "rgba(14,165,233,0.2)" }}>
                                                            📅 {new Date(goal.targetDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Section */}
                                        <div className="goal-progress-section">
                                            <div className="goal-progress-header">
                                                <span className="goal-progress-label">Progress</span>
                                                <span className="goal-progress-value">{goal.progress}%</span>
                                            </div>
                                            <div className="progress-bar-track">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: `${goal.progress}%` }}
                                                />
                                            </div>
                                            {!goal.completed && (
                                                <input
                                                    type="range"
                                                    className="progress-slider"
                                                    min="0"
                                                    max="100"
                                                    value={goal.progress}
                                                    onChange={(e) => updateProgress(goal._id, parseInt(e.target.value))}
                                                />
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="goal-actions">
                                            <button
                                                className={`goal-complete-btn ${goal.completed ? "completed-btn" : ""}`}
                                                onClick={() => toggleComplete(goal._id, goal.completed)}
                                            >
                                                {goal.completed ? "↩️ Reopen Goal" : "🏆 Mark as Complete"}
                                            </button>
                                            <button
                                                className="goal-delete-btn"
                                                onClick={() => deleteGoal(goal._id, goal.title)}
                                                title="Delete goal"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GoalsPage;
