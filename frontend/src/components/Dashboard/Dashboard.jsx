import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { 
  BarChart3, 
  Zap, 
  Calendar, 
  Activity, 
  Moon, 
  Droplets, 
  Beef, 
  ClipboardList, 
  Lightbulb,  AlertCircle, 
  Scale, 
  Sparkles,
  Briefcase,
  BookOpen,
  Dumbbell,
  Sun
} from "lucide-react";
import BalanceScoreCard from "../../components/Dashboard/BalanceScoreCard";
import WorkLifeChart from "../../components/Analytics/WorkLifeChart";

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
  // const hour = new Date().getHours();


  // ---- BASED ON TODAY'S BALANCE SCORE ----
  if (today) {
    const studyHours = Number(today.studyHours || 0) + Number(today.workHours || 0);
    const sleepHours = Number(today.sleepHours || 0);
    const stress = Number(today.stressLevel || 0);
    const physical = Number(today.physicalActivity || 0);

    let todayWorkScore = 0;
    if (studyHours >= 6 && studyHours <= 8) todayWorkScore = 100;
    else todayWorkScore = Math.max(0, 100 - Math.abs(studyHours - 7) * 15);

    let todayLifeScore = 0;
    if (sleepHours >= 7 && sleepHours <= 8) todayLifeScore = 50;
    else todayLifeScore = Math.max(0, 50 - Math.abs(sleepHours - 7.5) * 10);
    todayLifeScore += Math.max(0, 30 - stress * 5);
    todayLifeScore += Math.min(20, (physical / 30) * 20);

    const diff = Math.abs(todayWorkScore - todayLifeScore);
    const todayScore = Math.round((todayWorkScore + todayLifeScore) / 2);

    let improvements = [];
    if (studyHours < 4) improvements.push({ icon: <BookOpen size={14} />, text: "Log at least 4-5 hours of study time." });
    if (sleepHours < 7) improvements.push({ icon: <Moon size={14} />, text: "Prioritize getting 7-8 hours of sleep tonight." });
    if (stress >= 6) improvements.push({ icon: <Activity size={14} />, text: "Try a 10-minute meditation to lower your stress." });
    if (physical < 30) improvements.push({ icon: <Dumbbell size={14} />, text: "Get at least 30 minutes of physical exercise." });

    if (diff <= 15 && todayScore >= 60) {
      suggestions.unshift({
        icon: <Scale size={20} />,
        title: "Today's Study & Life are Perfectly Balanced!",
        text: "Your study hours and well-being for today are in perfect harmony. Keep up this amazing routine!",
        type: "success",
        category: "Today's Balance",
      });
    } else if (todayWorkScore > todayLifeScore + 15) {
      suggestions.unshift({
        icon: <AlertCircle size={20} />,
        title: "Today's Alert: High Study, Low Well-being",
        text: "You are heavily focused on academics today, but your well-being is suffering. You must prioritize sleep, hydration, and exercise to prevent severe burnout.",
        type: "warning",
        category: "Balance Alert",
        improvements: improvements.filter(i => !i.text.includes("Log at least"))
      });
    } else if (todayLifeScore > todayWorkScore + 15) {
      suggestions.unshift({
        icon: <AlertCircle size={20} />,
        title: "Today's Alert: High Well-being, Low Study",
        text: "Your lifestyle habits are great today, but your academic progress is lagging. Try to schedule a focused study session or attend more classes.",
        type: "warning",
        category: "Balance Alert",
        improvements: improvements.filter(i => i.text.includes("Log at least"))
      });
    } else if (todayScore < 40) {
      suggestions.unshift({
        icon: <AlertCircle size={20} />,
        title: "Today's Balance Needs Serious Attention",
        text: "Your overall balance score today is very low. Please focus on getting 7+ hours of sleep, reducing screen time, and studying consistently.",
        type: "warning",
        category: "Today's Balance",
        improvements: improvements
      });
    }
  } else if (balance && balance.score < 40) {
    suggestions.unshift({
      icon: <AlertCircle size={20} />,
      title: "Your Weekly Balance Needs Serious Attention",
      text: "Your overall balance score is very low. Log today's activities to get back on track!",
      type: "warning",
      category: "Weekly Balance",
    });
  }


  return suggestions;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({ lessons: 0, hours: 0 });
  const [today, setToday] = useState(null);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState(null);
  const [balance, setBalance] = useState({ score: 0, label: "" });
  const [activities, setActivities] = useState([]);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, progressRes, todayRes, weeklyRes, balanceRes, activitiesRes] = await Promise.all([
          API.get("/api/auth/profile"),
          API.get("/api/analysis/progress"),
          API.get("/api/analysis/today"),
          API.get("/api/analysis/weekly"),
          API.get("/api/analysis/balance"),
          API.get("/api/activities"),
        ]);
        const userData = userRes.data;
        setUser(userData);
        setProgress(progressRes.data);
        setToday(todayRes.data);
        setWeeklyAnalytics(weeklyRes.data);
        setBalance(balanceRes.data);
        setActivities(activitiesRes.data);

        // Save current stats for Chat Assistant
        if (todayRes.data) {
          localStorage.setItem("chat_context", JSON.stringify({
            studyHours: todayRes.data.studyHours || todayRes.data.workHours || 0,
            sleepHours: todayRes.data.sleepHours || 0,
            stressLevel: todayRes.data.stressLevel || 5
          }));
        }

        // Handle case where profile name is nested differently
        const userName = userData.name || userData.user?.name || "";
        if (userName) setUser(userData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const suggestions = generateSuggestions(today, weeklyAnalytics, balance);
  const visibleSuggestions = showAllSuggestions ? suggestions : suggestions.slice(0, 3);

  return (
    <motion.div 
      className="dashboard-container"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
      }}
    >
      {/* HEADER 2.0 */}
      <motion.div 
        className="dashboard-header"
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '4px', background: 'var(--gradient-main)', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Personal Overview</span>
        </div>
        <h1 className="shimmer-text" style={{ fontSize: '42px', marginBottom: '8px' }}>
          {greeting()}{user ? `, ${user.name || user.user?.name}` : ""}
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>Your academic work-life balance insights are analyzed and ready.</p>
        <div className="quote-box-dashboard" style={{ marginTop: '16px', padding: '12px 20px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', borderLeft: '4px solid var(--accent-primary)', maxWidth: 'fit-content' }}>
          <span style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            "{quote.text}"
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginLeft: '10px' }}>
            — {quote.author}
          </span>
        </div>
      </motion.div>

      {/* TOP METRICS */}
      <div className="dashboard-grid">
        <motion.div className="card glass-card" variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
          <div className="card-header-icon-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <BarChart3 size={20} color="var(--accent-primary)" />
            <h3 style={{ margin: 0 }}>Activity Summary</h3>
          </div>
          <motion.div 
            className="stats-row"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {[
              { value: progress.lessons, label: "Total Sessions" },
              { value: progress.hours, label: "Study Hours" },
              { value: activities.length, label: "Logged Days" }
            ].map((stat, idx) => (
              <motion.div 
                key={idx} 
                className="stat-box"
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <h2>{stat.value}</h2>
                <span>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="card glass-card" variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
          <div className="card-header-icon-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Activity size={20} color="#10b981" />
            <h3 style={{ margin: 0 }}>Today's Health Snapshot</h3>
          </div>
          {!today ? (
            <div className="empty-state">
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sun size={18} color="#94a3b8" /> No logs for today yet
              </p>
            </div>
          ) : (
            <motion.div 
              className="status-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
            >
              {[
                { icon: today.activityType === "Work" ? <Briefcase size={18} /> : <BookOpen size={18} />, label: today.activityType, value: `${today.workHours || today.studyHours || 0}h`, color: "#3b82f6" },
                { icon: <Moon size={18} />, label: "Sleep", value: `${today.sleepHours || 0}h`, color: "#a855f7" },
                { icon: <Activity size={18} />, label: "Activity", value: `${today.physicalActivity || 0}m`, color: "#10b981" },
                { icon: <Droplets size={18} />, label: "Water", value: `${today.waterLiters || 0}L`, color: "#0ea5e9" },
                { icon: <Beef size={18} />, label: "Nutrition", value: today.foodProtein || "None", color: "#f59e0b" },
                { icon: <Zap size={18} />, label: "Stress", value: `${today.stressLevel || 0}/10`, color: "#ef4444" },
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  className="status-tile" 
                  style={{ '--tile-color': item.color }}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <div className="status-tile-top">
                    <span className="status-tile-icon" style={{ background: `${item.color}15`, color: item.color }}>{item.icon}</span>
                    <span className="status-tile-label">{item.label}</span>
                  </div>
                  <div className="status-tile-value">{item.value}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="card glass-card" style={{ marginBottom: "24px", padding: "16px 24px" }}>
        <div className="quick-actions-bar">
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginRight: "10px" }}>
            Quick Actions
          </span>
          {[
            { to: "/tracker", icon: <ClipboardList size={18} />, label: "Log Progress" },
            { to: "/schedule", icon: <Calendar size={18} />, label: "Schedule" },
            { to: "/insights", icon: <Lightbulb size={18} />, label: "Insights" },
          ].map(({ to, icon, label }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="action-tile-btn"
            >
              <span className="action-tile-icon">{icon}</span>
              <span className="action-tile-label">{label}</span>
            </button>
          ))}
        </div>
      </div>


      <motion.div
        className="suggestions-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="suggestions-header">
          <div className="suggestions-title-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="suggestions-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Sparkles size={12} /> AI</div>
            <h3 style={{ margin: 0 }}>Smart Health & Study Suggestions</h3>
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
                {s.improvements && s.improvements.length > 0 && (
                  <div className="improvements-list" style={{ marginTop: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>Action Plan:</strong>
                    <ul style={{ margin: 0, paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {s.improvements.map((imp, idx) => (
                        <li key={idx} style={{ listStyleType: 'none', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-primary)' }}>{imp.icon}</span> {imp.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
        <WorkLifeChart
          analytics={weeklyAnalytics}
          isWorkRole={user?.user?.role === "Employee"}
        />

        {/* Work / Study Score */}
        <BalanceScoreCard
          score={balance.workScore !== undefined ? balance.workScore : balance.score}
          label={balance.workLabel || balance.label}
          title={user?.user?.role === 'Employee' ? "Work Balance" : "Study Balance"}
        />

        {/* Life Score */}
        <BalanceScoreCard
          score={balance.lifeScore !== undefined ? balance.lifeScore : balance.score}
          label={balance.lifeLabel || balance.label}
          title="Life Balance"
        />
      </div>
    </motion.div>
  );
};

export default Dashboard;
