import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import BalanceScoreCard from "../../components/Dashboard/BalanceScoreCard";
import WeeklyChart from "../../components/Analytics/WeeklyChart";
import "../../styles/dashboard.css";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Education is the most powerful weapon you can use to change the world.", author: "Nelson Mandela" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
];

/* ===================================================
   SMART SUGGESTION ENGINE
   Generates personalized suggestions based on user data
   =================================================== */
const generateSuggestions = (today, weeklyAnalytics, balance) => {
  const suggestions = [];
  const hour = new Date().getHours();

  // ---- BASED ON TODAY'S DATA ----
  if (today) {
    // Sleep suggestions
    if (today.sleepHours < 6) {
      suggestions.push({
        icon: "😴",
        title: "You Need More Sleep!",
        text: `You only slept ${today.sleepHours} hours. Adults need 7–9 hours. Lack of sleep affects memory, focus, and immune health. Try to sleep early tonight.`,
        type: "warning",
        action: "Set a bedtime reminder",
        category: "Health",
      });
    } else if (today.sleepHours >= 7 && today.sleepHours <= 9) {
      suggestions.push({
        icon: "✅",
        title: "Great Sleep Last Night!",
        text: `${today.sleepHours} hours of sleep is perfect! Consistent sleep improves concentration by 40% and helps consolidate learning.`,
        type: "success",
        category: "Health",
      });
    } else if (today.sleepHours > 9) {
      suggestions.push({
        icon: "⚠️",
        title: "Oversleeping Alert",
        text: `Sleeping ${today.sleepHours} hours may cause grogginess. Try maintaining 7–8 hours for optimal energy and productivity.`,
        type: "info",
        category: "Health",
      });
    }

    // Stress suggestions
    if (today.stressLevel >= 7) {
      suggestions.push({
        icon: "🧘",
        title: "High Stress Detected — Take Action!",
        text: "Your stress level is high. Try deep breathing (4-7-8 technique) or take a 15-min walk. Chronic stress weakens your immune system and impairs learning.",
        type: "warning",
        category: "Wellness",
      });
    } else if (today.stressLevel >= 4 && today.stressLevel <= 6) {
      suggestions.push({
        icon: "💆",
        title: "Moderate Stress — Stay Mindful",
        text: "Your stress is moderate. Take short breaks every 45 minutes. Try stretching or listening to calming music between study sessions.",
        type: "info",
        category: "Wellness",
      });
    } else if (today.stressLevel <= 3) {
      suggestions.push({
        icon: "😊",
        title: "Low Stress — Great Mental State!",
        text: "You're in a great headspace today! This is the perfect time for challenging tasks or creative work.",
        type: "success",
        category: "Wellness",
      });
    }

    // Study suggestions
    if (today.studyHours === 0) {
      suggestions.push({
        icon: "📘",
        title: "No Study Logged Today",
        text: "You haven't studied yet. Even 25 minutes of focused study (Pomodoro technique) can make a big difference. Start small!",
        type: "warning",
        action: "Log Activity",
        actionLink: "/tracker",
        category: "Academic",
      });
    } else if (today.studyHours >= 1 && today.studyHours <= 3) {
      suggestions.push({
        icon: "📚",
        title: "Good Start! Keep Going",
        text: `${today.studyHours} hours studied. Try active recall — test yourself on what you learned rather than re-reading notes. It's 3x more effective!`,
        type: "info",
        category: "Academic",
      });
    } else if (today.studyHours >= 4 && today.studyHours <= 6) {
      suggestions.push({
        icon: "🌟",
        title: "Excellent Study Session!",
        text: `${today.studyHours} hours of studying is outstanding! Remember to use spaced repetition — review today's material tomorrow and in 3 days.`,
        type: "success",
        category: "Academic",
      });
    } else if (today.studyHours > 6) {
      suggestions.push({
        icon: "⚡",
        title: "Careful — Don't Burn Out!",
        text: `${today.studyHours} hours is impressive but could lead to burnout. Quality beats quantity. Take a 20-min power nap to consolidate memory.`,
        type: "warning",
        category: "Academic",
      });
    }

    // Physical activity
    if (today.physicalActivity === 0) {
      suggestions.push({
        icon: "🏃",
        title: "Move Your Body Today!",
        text: "No physical activity logged. Even a 20-min walk boosts brain function by 20%. Exercise releases endorphins that reduce stress and improve mood.",
        type: "warning",
        action: "Log Activity",
        actionLink: "/tracker",
        category: "Fitness",
      });
    } else if (today.physicalActivity >= 30) {
      suggestions.push({
        icon: "💪",
        title: "Active Day — Well Done!",
        text: `${today.physicalActivity} minutes of exercise! Physical activity enhances neuroplasticity and memory retention. Keep this habit!`,
        type: "success",
        category: "Fitness",
      });
    }
  } else {
    // No data logged today
    suggestions.push({
      icon: "📝",
      title: "Start Your Day — Log Activity!",
      text: "You haven't logged any activity today. Tracking your daily habits is the first step to a healthier, more balanced academic life.",
      type: "info",
      action: "Log Now",
      actionLink: "/tracker",
      category: "Getting Started",
    });
  }

  // ---- TIME-BASED SUGGESTIONS ----
  if (hour >= 6 && hour < 10) {
    suggestions.push({
      icon: "🌅",
      title: "Morning Study Power",
      text: "Mornings are when your brain is freshest. Tackle difficult subjects now — your prefrontal cortex (decision-making & focus area) peaks between 8–10 AM.",
      type: "info",
      category: "Productivity",
    });
  } else if (hour >= 14 && hour < 16) {
    suggestions.push({
      icon: "☕",
      title: "Afternoon Slump — Recharge!",
      text: "Energy naturally dips after lunch. Have a glass of water, do 5 jumping jacks, or take a 10-min power nap. Then review what you studied this morning.",
      type: "info",
      category: "Productivity",
    });
  } else if (hour >= 21) {
    suggestions.push({
      icon: "🌙",
      title: "Wind Down for Better Sleep",
      text: "Screen time before bed disrupts melatonin production. Try reading a physical book, journaling, or light stretching 30 minutes before sleep.",
      type: "info",
      category: "Health",
    });
  }

  // ---- BASED ON BALANCE SCORE ----
  if (balance.score < 40) {
    suggestions.push({
      icon: "⚠️",
      title: "Your Balance Needs Attention",
      text: "Your work-life balance score is low. Focus on getting 7+ hours of sleep, reducing screen time, and adding physical activity to your routine.",
      type: "warning",
      category: "Balance",
    });
  } else if (balance.score >= 80) {
    suggestions.push({
      icon: "🏆",
      title: "Amazing Balance Score!",
      text: "You're maintaining an excellent work-life balance! Keep up these habits — consistency is the key to long-term success and well-being.",
      type: "success",
      category: "Balance",
    });
  }

  // ---- HYDRATION (always relevant) ----
  suggestions.push({
    icon: "💧",
    title: "Stay Hydrated!",
    text: "Drink at least 8 glasses of water today. Dehydration causes a 25% drop in energy and focus. Keep a water bottle at your desk.",
    type: "info",
    category: "Health",
  });

  return suggestions;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({ lessons: 0, hours: 0 });
  const [today, setToday] = useState(null);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState(null);
  const [balance, setBalance] = useState({ score: 0, label: "" });
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    API.get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch(() => { });
    API.get("/analysis/progress")
      .then((res) => setProgress(res.data))
      .catch(() => { });
    API.get("/analysis/today")
      .then((res) => setToday(res.data))
      .catch(() => { });
    API.get("/analysis/weekly")
      .then((res) => setWeeklyAnalytics(res.data))
      .catch(() => { });
    API.get("/analysis/balance")
      .then((res) => setBalance(res.data))
      .catch(() => { });
  }, []);

  const suggestions = generateSuggestions(today, weeklyAnalytics, balance);
  const visibleSuggestions = showAllSuggestions ? suggestions : suggestions.slice(0, 3);

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>
          {greeting()}{user ? `, ${user.name || user.user?.name}` : ""} 👋
        </h1>
        <p>Here's your academic work–life balance overview for today</p>
      </div>

      {/* MOTIVATIONAL QUOTE */}
      <div className="quote-card">
        <div className="quote-icon">💡</div>
        <div>
          <div className="quote-text">"{quote.text}"</div>
          <div className="quote-author">— {quote.author}</div>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="dashboard-grid">


        {/* Progress */}
        <div className="card">
          <h3>Progress</h3>
          <div className="stats-row">
            <div className="stat-box">
              <h2>{progress.lessons}</h2>
              <span>Activities</span>
            </div>
            <div className="stat-box">
              <h2>{progress.hours}</h2>
              <span>Study Hours</span>
            </div>
          </div>
        </div>

        {/* Today's Status */}
        <div className="card">
          <h3>Today's Status</h3>
          {!today ? (
            <div className="empty-state">
              <p>🌅 No activity logged today</p>
            </div>
          ) : (
            <ul className="status-list">
              <li>📘 <strong>Study:</strong> {today.studyHours} hrs</li>
              <li>😴 <strong>Sleep:</strong> {today.sleepHours} hrs</li>
              <li>🏃 <strong>Activity:</strong> {today.physicalActivity} min</li>
              <li>⚡ <strong>Stress:</strong> {today.stressLevel}/10</li>
            </ul>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="dashboard-grid" style={{ marginBottom: "4px" }}>
        <div className="card" style={{ display: "flex", gap: "12px", flexWrap: "wrap", padding: "18px 24px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", alignSelf: "center" }}>Quick:</span>
          {[
            { to: "/tracker", icon: "📝", label: "Log Activity" },
            { to: "/goals", icon: "🎯", label: "Goals" },
          ].map(({ to, icon, label }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "8px 14px",
                color: "#94a3b8",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => { e.target.style.background = "rgba(14,165,233,0.12)"; e.target.style.color = "#67e8f9"; }}
              onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.color = "#94a3b8"; }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== AI SMART SUGGESTIONS ===== */}
      <motion.div
        className="suggestions-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="suggestions-header">
          <div className="suggestions-title-row">
            <div className="suggestions-badge">AI</div>
            <h3>Smart Health & Study Suggestions</h3>
          </div>
          <p className="suggestions-subtitle">
            Personalized recommendations based on your activity data
          </p>
        </div>

        <div className="suggestions-grid">
          <AnimatePresence>
            {visibleSuggestions.map((s, i) => (
              <motion.div
                key={i}
                className={`suggestion-card suggestion-${s.type}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="suggestion-top">
                  <span className="suggestion-icon">{s.icon}</span>
                  <span className={`suggestion-category cat-${s.type}`}>{s.category}</span>
                </div>
                <h4 className="suggestion-title">{s.title}</h4>
                <p className="suggestion-text">{s.text}</p>
                {s.action && (
                  <button
                    className={`suggestion-action-btn action-${s.type}`}
                    onClick={() => s.actionLink && navigate(s.actionLink)}
                  >
                    {s.action} →
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {suggestions.length > 3 && (
          <button
            className="show-more-suggestions"
            onClick={() => setShowAllSuggestions(!showAllSuggestions)}
          >
            {showAllSuggestions
              ? "Show Less ↑"
              : `Show ${suggestions.length - 3} More Suggestions ↓`}
          </button>
        )}
      </motion.div>

      {/* ANALYTICS */}
      <div className="dashboard-grid analytics-grid">
        <WeeklyChart analytics={weeklyAnalytics} />
        <BalanceScoreCard score={balance.score} label={balance.label} />
      </div>
    </div>
  );
};

export default Dashboard;
