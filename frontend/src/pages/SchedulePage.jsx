import React, { useEffect, useState } from "react";
import { 
    Calendar, 
    Plus, 
    Clock, 
    Type, 
    FileText, 
    Trash2, 
    Book, 
    PenTool, 
    Coffee, 
    Star,
    Bell
} from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";
import API from "../services/api";
import "../styles/schedule.css";

const SchedulePage = () => {
    const [schedules, setSchedules] = useState([]);
    const [form, setForm] = useState({
        title: "",
        type: "class",
        date: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "10:00",
        description: ""
    });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/schedules?date=${selectedDate}`);
            setSchedules(res.data.data);
        } catch {
            showToast("Failed to load schedule", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [selectedDate]);

    const createSchedule = async (e) => {
        e.preventDefault();
        
        // Time matching notification check
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const todayStr = now.toISOString().split('T')[0];
        
        if (form.date === todayStr && currentTime > form.startTime) {
            showToast("⚠️ Task should not be in the past time. Event not added.", "warning");
            return; // Block addition
        }

        try {
            const res = await API.post("/schedules", form);
            // If the created schedule matches the selected date, add it to the view
            if (res.data.data.date.split('T')[0] === selectedDate) {
                setSchedules((prev) => [...prev, res.data.data].sort((a, b) => a.startTime.localeCompare(b.startTime)));
            }
            setForm({
                title: "",
                type: "class",
                date: selectedDate,
                startTime: "",
                endTime: "",
                description: ""
            });
            showToast(`Event "${res.data.data.title}" added to schedule!`);
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to add schedule item", "error");
        }
    };

    const checkOnTimeStatus = (item) => {
        if (!item.completed || !item.completedAt) return true;

        const compDate = new Date(item.completedAt);
        const taskDate = new Date(item.date);

        const compDateStr = compDate.toISOString().split('T')[0];
        const taskDateStr = taskDate.toISOString().split('T')[0];

        if (compDateStr < taskDateStr) return true;
        if (compDateStr > taskDateStr) return false;

        // Same day: compare time
        const compTime = compDate.getHours() * 60 + compDate.getMinutes();
        const [endH, endM] = item.endTime.split(':').map(Number);
        const endTimeTotal = endH * 60 + endM;

        return compTime <= endTimeTotal;
    };

    const toggleComplete = async (id, completed) => {
        try {
            const nextStatus = !completed;
            const res = await API.put(`/schedules/${id}`, { completed: nextStatus });
            const updatedItem = res.data.data;
            setSchedules((prev) => prev.map((s) => (s._id === id ? updatedItem : s)));

            if (nextStatus) {
                const isOnTime = checkOnTimeStatus(updatedItem);
                if (isOnTime) {
                    showToast("Great job! Completed successfully.");
                } else {
                    showToast("⚠️ You need to perform good.", "warning");
                }
            }
        } catch {
            showToast("Failed to update status", "error");
        }
    };

    const deleteSchedule = async (id) => {
        try {
            await API.delete(`/schedules/${id}`);
            setSchedules((prev) => prev.filter((s) => s._id !== id));
            showToast("Event deleted", "info");
        } catch {
            showToast("Failed to delete event", "error");
        }
    };

    const [alarmSound, setAlarmSound] = useState(null);
    const [playedAlarms, setPlayedAlarms] = useState(new Set());

    // Effect to check for end times every minute
    useEffect(() => {
        const checkEndTimes = () => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const todayStr = now.toISOString().split('T')[0];

            schedules.forEach(item => {
                const itemDateStr = item.date.split('T')[0];
                if (itemDateStr === todayStr && item.endTime === currentTime && !item.completed && !playedAlarms.has(item._id)) {
                    if (alarmSound) {
                        const audio = new Audio(alarmSound);
                        audio.play().catch(e => console.error("Audio play failed:", e));
                    }
                    showToast(`Time's up for: ${item.title}`, "info");
                    setPlayedAlarms(prev => {
                        const next = new Set(prev);
                        next.add(item._id);
                        return next;
                    });
                }
            });
        };

        const interval = setInterval(checkEndTimes, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [schedules, alarmSound, playedAlarms]);

    const handleSoundChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAlarmSound(url);
            showToast("🎵 Alarm sound set successfully!");
        }
    };

    const getTypeColorAndIcon = (type) => {
        switch (type) {
            case "class": return { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", icon: <Book size={16} /> };
            case "assignment": return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: <PenTool size={16} /> };
            case "break": return { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", icon: <Coffee size={16} /> };
            case "personal": return { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)", icon: <Star size={16} /> };
            default: return { color: "#6b7280", bg: "rgba(107, 114, 128, 0.1)", icon: <Calendar size={16} /> };
        }
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

            <main className="dashboard-main schedule-page">
                {/* Header */}
                <div className="schedule-header">
                    <div className="schedule-header-text">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <Calendar size={32} color="#0ea5e9" />
                            <h1 style={{ margin: 0 }}>Daily Schedule</h1>
                        </div>
                        <p>Plan your day, organize classes, and manage your time effectively.</p>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="schedule-layout">
                    {/* Left Column: Form & Calendar */}
                    <div className="schedule-left">
                        <div className="add-schedule-form">
                            <div className="card-header-with-icon">
                                <Plus size={20} color="#0ea5e9" />
                                <h3>Add to Schedule</h3>
                            </div>

                            <form onSubmit={createSchedule}>
                                <div className="form-group row">
                                    <div className="input-group">
                                        <label><FileText size={14} style={{ marginRight: 6 }} /> Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Biology Lab 101"
                                            required
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label><Type size={14} style={{ marginRight: 6 }} /> Type</label>
                                        <select
                                            value={form.type}
                                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        >
                                            <option value="class">Class</option>
                                            <option value="assignment">Assignment</option>
                                            <option value="break">Break</option>
                                            <option value="personal">Personal</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <div className="input-group">
                                        <label><Calendar size={14} style={{ marginRight: 6 }} /> Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={form.date}
                                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <div className="input-group">
                                        <label><Clock size={14} style={{ marginRight: 6 }} /> Starts At</label>
                                        <input
                                            type="time"
                                            required
                                            value={form.startTime}
                                            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label><Clock size={14} style={{ marginRight: 6 }} /> Ends At</label>
                                        <input
                                            type="time"
                                            required
                                            value={form.endTime}
                                            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label><FileText size={14} style={{ marginRight: 6 }} /> Description (Optional)</label>
                                    <textarea
                                        placeholder="Add context or notes"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <button type="submit" className="add-schedule-btn">Add Event</button>
                            </form>
                        </div>

                        {/* Alarm Settings */}
                        <div className="add-schedule-form" style={{ marginTop: '20px' }}>
                            <div className="card-header-with-icon">
                                <Bell size={20} color="#0ea5e9" />
                                <h3>Alarm Sound</h3>
                            </div>
                            <div className="form-group">
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                    Choose a custom sound to play when your session ends.
                                </p>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleSoundChange}
                                    style={{ fontSize: '12px' }}
                                />
                                {alarmSound && <p style={{ fontSize: '12px', color: 'var(--accent-primary)', marginTop: '8px' }}>✅ Custom sound loaded</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Planner Timeline */}
                    <div className="schedule-right">
                        <div className="timeline-header">
                            <div className="date-selector">
                                <label>View Schedule For:</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-state">Loading schedule...</div>
                        ) : schedules.length > 0 ? (
                            <div className="timeline-container">
                                {schedules.map((item) => {
                                    const { color, bg, icon } = getTypeColorAndIcon(item.type);
                                    return (
                                        <div key={item._id} className={`timeline-card ${item.completed ? 'completed' : ''}`}>
                                            <div className="timeline-time">
                                                <span className="start">{item.startTime}</span>
                                                <span className="end">{item.endTime}</span>
                                            </div>
                                            <div className="timeline-content" style={{ borderLeft: `4px solid ${color}` }}>
                                                <div className="content-header">
                                                    <div className="content-title">
                                                        <span className="type-icon" style={{ background: bg, color: color }}>
                                                            {icon}
                                                        </span>
                                                        <div className="title-wrapper">
                                                            <span className={`title-text ${item.completed ? 'strike' : ''}`}>{item.title}</span>
                                                            {item.completed && (
                                                                <span className={`completion-msg ${checkOnTimeStatus(item) ? 'on-time' : 'late'}`}>
                                                                    {checkOnTimeStatus(item) ? 'Great job! Completed successfully.' : 'You need to perform better.'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="content-actions">
                                                        {!item.completed && (
                                                            <button
                                                                className="status-btn"
                                                                onClick={() => toggleComplete(item._id, item.completed)}
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                        <button
                                                            className="del-btn"
                                                            onClick={() => deleteSchedule(item._id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {item.description && <p className="content-desc">{item.description}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-schedule-state">
                                <h3>No events for this date!</h3>
                                <p>Your schedule is clear. Enjoy your free time or add new tasks.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SchedulePage;
