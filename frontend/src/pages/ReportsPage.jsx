import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar/Sidebar";
import WorkLifeChart from "../components/Analytics/WorkLifeChart";
import BalanceScoreCard from "../components/Dashboard/BalanceScoreCard";
import API from "../services/api";
import "../styles/reports.css";

/* Chart.js */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { 
  BarChart3, 
  Book, 
  Briefcase, 
  Moon, 
  Zap, 
  Calendar, 
  TrendingUp, 
  PieChart, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

/* Register chart parts */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: {
        color: "#94a3b8",
        font: { family: "'Outfit', sans-serif", size: 12, weight: "600" },
        padding: 18,
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        pointStyle: "rectRounded",
      },
    },
    tooltip: {
      backgroundColor: "rgba(13,15,26,0.96)",
      borderColor: "rgba(14,165,233,0.35)",
      borderWidth: 1,
      titleColor: "#e2e8f0",
      bodyColor: "#94a3b8",
      padding: 14,
      cornerRadius: 12,
      titleFont: { family: "'Outfit', sans-serif", weight: "700", size: 13 },
      bodyFont: { family: "'Outfit', sans-serif", size: 12 },
      displayColors: true,
      boxPadding: 6,
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.03)", drawBorder: false },
      ticks: { color: "#64748b", font: { family: "'Outfit', sans-serif", size: 11, weight: "500" } },
      border: { display: false },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.03)", drawBorder: false },
      ticks: { color: "#64748b", font: { family: "'Outfit', sans-serif", size: 11, weight: "500" } },
      border: { display: false },
      beginAtZero: true,
    },
  },
};

const donutOptions = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: "74%",
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#94a3b8",
        font: { family: "'Outfit', sans-serif", size: 12, weight: "600" },
        padding: 18,
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      backgroundColor: "rgba(13,15,26,0.96)",
      borderColor: "rgba(14,165,233,0.35)",
      borderWidth: 1,
      titleColor: "#e2e8f0",
      bodyColor: "#94a3b8",
      padding: 14,
      cornerRadius: 12,
      displayColors: true,
      boxPadding: 6,
    },
  },
};

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [activityDates, setActivityDates] = useState([]);
  const [today, setToday] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  /* =========================
     FETCH REPORT DATA
  ========================= */
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate week range for selectedDate
      const d = new Date(selectedDate);
      const day = d.getDay(); // 0 (Sun) to 6 (Sat)

      const start = new Date(d);
      start.setDate(d.getDate() - day);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const startISO = start.toISOString();
      const endISO = end.toISOString();

      const [summaryRes, weeklyRes, datesRes, todayRes, profileRes] = await Promise.all([
        API.get(`/api/reports/summary?startDate=${startISO}&endDate=${endISO}`),
        API.get(`/api/reports/weekly?startDate=${startISO}&endDate=${endISO}`),
        API.get("/api/reports/activity-dates"),
        API.get(`/api/analysis/today?date=${selectedDate.toISOString()}`),
        API.get("/api/auth/profile"),
      ]);

      setSummary(summaryRes.data);
      setWeekly(weeklyRes.data);
      setActivityDates(datesRes.data);
      setToday(todayRes.data);
      setUser(profileRes.data);
    } catch (err) {
      console.error("Report fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Real-time update every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReports();
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, [fetchReports]);

  /* =========================
     CALENDAR LOGIC
  ========================= */
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const todayDate = new Date();
  const isToday = (day) => {
    return day && year === todayDate.getFullYear() && month === todayDate.getMonth() && day === todayDate.getDate();
  };

  const hasActivity = (day) => {
    if (!day) return false;
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return activityDates.includes(dateKey);
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
  };

  const isSelected = (day) => {
    return day &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year;
  };

  // Count active days this month
  const activeDaysCount = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(d => hasActivity(d)).length;

  // Calculate Latest Balance Score
  let todayScore = 0;
  let todayLabel = "No Logs Found";

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

    todayScore = Math.round((todayWorkScore + todayLifeScore) / 2);
    if (todayScore >= 80) todayLabel = "Excellent";
    else if (todayScore >= 60) todayLabel = "Good Balance";
    else if (todayScore > 0) todayLabel = "Needs Focus";
  }

  /* =========================
     CHART DATA
  ========================= */
  const weeklyChartData = weekly && {
    labels: weekly.labels,
    datasets: [
      {
        label: user?.user?.role === "Employee" ? "Work Hours" : "Study Hours",
        data: weekly.study,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(14,165,233,0.7)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(14,165,233,0.25)");
          gradient.addColorStop(1, "rgba(14,165,233,0.85)");
          return gradient;
        },
        borderColor: "rgba(14,165,233,1)",
        borderWidth: 0,
        borderRadius: 10,
        borderSkipped: false,
        hoverBackgroundColor: "rgba(14,165,233,0.95)",
        barPercentage: 0.6,
        categoryPercentage: 0.65,
      },
      {
        label: "Stress Level",
        data: weekly.stress,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return "rgba(244,63,94,0.6)";
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(244,63,94,0.2)");
          gradient.addColorStop(1, "rgba(244,63,94,0.7)");
          return gradient;
        },
        borderColor: "rgba(244,63,94,1)",
        borderWidth: 0,
        borderRadius: 10,
        borderSkipped: false,
        hoverBackgroundColor: "rgba(244,63,94,0.9)",
        barPercentage: 0.6,
        categoryPercentage: 0.65,
      },
    ],
  };

  const donutData = summary && {
    labels: [user?.user?.role === "Employee" ? "Work" : "Study", "Sleep", "Stress"],
    datasets: [
      {
        data: [
          summary.totalStudy || 0,
          summary.avgSleep || 0,
          summary.avgStress || 0,
        ],
        backgroundColor: [
          "rgba(14,165,233,0.85)",
          "rgba(16,185,129,0.85)",
          "rgba(244,63,94,0.8)",
        ],
        borderColor: [
          "rgba(14,165,233,0.2)",
          "rgba(16,185,129,0.2)",
          "rgba(244,63,94,0.2)",
        ],
        borderWidth: 2,
        hoverOffset: 12,
        hoverBorderWidth: 3,
        hoverBorderColor: [
          "rgba(14,165,233,0.6)",
          "rgba(16,185,129,0.6)",
          "rgba(239,68,68,0.6)",
        ],
        spacing: 3,
      },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="dashboard-main reports-page">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ===== HEADER ===== */}
          <motion.div className="reports-header" variants={itemVariants}>
            <div className="reports-header-left">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <BarChart3 size={32} color="#0ea5e9" />
                <h1 className="reports-title" style={{ margin: 0 }}>Progress Reports</h1>
              </div>
              <p className="reports-subtitle">Track your {user?.user?.role === "Employee" ? "professional" : "academic"} journey with detailed analytics</p>
            </div>

          </motion.div>

          {/* ===== SUMMARY CARDS ===== */}
          <motion.div className="summary-grid" variants={itemVariants}>
            {loading && !summary ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="summary-card skeleton-card">
                    <div className="skeleton" style={{ width: "50%", height: "14px", marginBottom: "12px" }} />
                    <div className="skeleton" style={{ width: "60%", height: "32px" }} />
                  </div>
                ))}
              </>
            ) : summary ? (
              <>
                <div className="summary-card">
                  <div className="summary-card-glow glow-purple" />
                  <div className="summary-card-icon purple-icon">
                    {user?.user?.role === "Employee" ? <Briefcase size={20} /> : <Book size={20} />}
                  </div>
                  <div className="summary-card-content">
                    <span className="summary-label">Total {user?.user?.role === "Employee" ? "Work" : "Study"}</span>
                    <div className="summary-number">
                      {summary.totalStudy}<span className="summary-unit">hrs</span>
                    </div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-glow glow-blue" />
                  <div className="summary-card-icon blue-icon"><Moon size={20} /></div>
                  <div className="summary-card-content">
                    <span className="summary-label">Avg Sleep</span>
                    <div className="summary-number">
                      {summary.avgSleep}<span className="summary-unit">hrs</span>
                    </div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-glow glow-red" />
                  <div className="summary-card-icon red-icon"><Zap size={20} /></div>
                  <div className="summary-card-content">
                    <span className="summary-label">Avg Stress</span>
                    <div className="summary-number">
                      {summary.avgStress}<span className="summary-unit">/10</span>
                    </div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-glow glow-green" />
                  <div className="summary-card-icon green-icon"><Calendar size={20} /></div>
                  <div className="summary-card-content">
                    <span className="summary-label">Active Days</span>
                    <div className="summary-number">
                      {activeDaysCount}<span className="summary-unit">this month</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>

          {/* ===== CHARTS ===== */}
          <motion.div className="charts-grid" variants={itemVariants}>
            <div className="chart-card">
              <div className="chart-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TrendingUp size={18} color="#0ea5e9" />
                  <h3 style={{ margin: 0 }}>Weekly Productivity</h3>
                </div>
                <span className="chart-badge">
                  {selectedDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}'s Week
                </span>
              </div>
              <div className="chart-wrapper">
                {weeklyChartData ? (
                  <Bar data={weeklyChartData} options={chartOptions} />
                ) : (
                  <div className="chart-skeleton">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div key={i} className="skeleton-bar" style={{ height: `${20 + Math.random() * 60}%` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PieChart size={18} color="#10b981" />
                  <h3 style={{ margin: 0 }}>Activity Distribution</h3>
                </div>
                <span className="chart-badge">All Time</span>
              </div>
              <div className="chart-wrapper donut-wrapper">
                {donutData ? (
                  <Doughnut data={donutData} options={donutOptions} />
                ) : (
                  <div className="chart-skeleton-donut">
                    <div className="skeleton-donut" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} style={{
            marginBottom: "22px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px"
          }}>
            <div style={{ flex: 2, minWidth: "300px" }}>
              <WorkLifeChart 
                analytics={weekly} 
                isWorkRole={user?.user?.role === "Employee"} 
              />
            </div>
            <div style={{ flex: 1, minWidth: "300px" }}>
              <BalanceScoreCard
                score={todayScore}
                label={todayLabel}
                title={isToday(selectedDate.getDate()) ? "📅 Today's Balance" : `📅 ${selectedDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}'s Balance`}
                description={isToday(selectedDate.getDate()) ? "Your today's work-life balance score" : `Your work-life balance on ${selectedDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}`}
              />
            </div>
          </motion.div>

          {/* ===== CALENDAR ===== */}
          <motion.div className="calendar-section" variants={itemVariants}>
            <div className="calendar-card">
              <div className="calendar-top">
                <div className="calendar-title-area">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CalendarDays size={20} color="#8b5cf6" />
                    <h3 style={{ margin: 0 }}>Activity Calendar</h3>
                  </div>
                  <span className="calendar-hint">Track your logged activity days</span>
                </div>
                <div className="calendar-nav">
                  <button className="cal-nav-btn" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>
                    <ChevronLeft size={16} />
                  </button>
                  <span className="cal-month-label">
                    {currentMonth.toLocaleString("default", { month: "long" })} {year}
                  </span>
                  <button className="cal-nav-btn" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="calendar-grid">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                  <div key={d} className="cal-day-name">{d}</div>
                ))}

                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    onClick={() => handleDateClick(day)}
                    className={`cal-day ${day ? "" : "cal-day-empty"} ${hasActivity(day) ? "cal-active" : ""} ${isToday(day) ? "cal-today" : ""} ${isSelected(day) ? "cal-selected" : ""}`}
                    style={{ cursor: day ? "pointer" : "default" }}
                  >
                    {day && (
                      <>
                        <span className="cal-day-number">{day}</span>
                        {hasActivity(day) && <span className="cal-dot" />}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="calendar-footer">
                <div className="cal-legend-item">
                  <span className="cal-legend-dot green-dot" />
                  <span>Activity Logged</span>
                </div>
                <div className="cal-legend-item">
                  <span className="cal-legend-dot purple-dot" />
                  <span>Today</span>
                </div>
                <div className="cal-legend-item total-days">
                  <strong>{activeDaysCount}</strong> active days in {currentMonth.toLocaleString("default", { month: "long" })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Reports;
