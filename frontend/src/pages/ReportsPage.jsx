import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar/Sidebar";
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
        font: { family: "Inter", size: 12, weight: "600" },
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
      titleFont: { family: "Inter", weight: "700", size: 13 },
      bodyFont: { family: "Inter", size: 12 },
      displayColors: true,
      boxPadding: 6,
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.03)", drawBorder: false },
      ticks: { color: "#64748b", font: { family: "Inter", size: 11, weight: "500" } },
      border: { display: false },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.03)", drawBorder: false },
      ticks: { color: "#64748b", font: { family: "Inter", size: 11, weight: "500" } },
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
        font: { family: "Inter", size: 12, weight: "600" },
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH REPORT DATA
  ========================= */
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, weeklyRes, datesRes] = await Promise.all([
        API.get("/reports/summary"),
        API.get("/reports/weekly"),
        API.get("/reports/activity-dates"),
      ]);

      setSummary(summaryRes.data);
      setWeekly(weeklyRes.data);
      setActivityDates(datesRes.data);
    } catch (err) {
      console.error("Report fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
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

  // Count active days this month
  const activeDaysCount = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(d => hasActivity(d)).length;

  /* =========================
     CHART DATA
  ========================= */
  const weeklyChartData = weekly && {
    labels: weekly.labels,
    datasets: [
      {
        label: "Study Hours",
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
    labels: ["Study", "Sleep", "Stress"],
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
              <h1 className="reports-title">📊 Progress Reports</h1>
              <p className="reports-subtitle">Track your academic journey with detailed analytics</p>
            </div>
            <div className="reports-header-right">
              <div className="reports-badge">
                <span className="ping-dot" /> Live Data
              </div>
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
                  <div className="summary-card-icon purple-icon">📘</div>
                  <div className="summary-card-content">
                    <span className="summary-label">Total Study</span>
                    <div className="summary-number">
                      {summary.totalStudy}<span className="summary-unit">hrs</span>
                    </div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-glow glow-blue" />
                  <div className="summary-card-icon blue-icon">😴</div>
                  <div className="summary-card-content">
                    <span className="summary-label">Avg Sleep</span>
                    <div className="summary-number">
                      {summary.avgSleep}<span className="summary-unit">hrs</span>
                    </div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-glow glow-red" />
                  <div className="summary-card-icon red-icon">⚡</div>
                  <div className="summary-card-content">
                    <span className="summary-label">Avg Stress</span>
                    <div className="summary-number">
                      {summary.avgStress}<span className="summary-unit">/10</span>
                    </div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-glow glow-green" />
                  <div className="summary-card-icon green-icon">📅</div>
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
                <h3>📈 Weekly Productivity</h3>
                <span className="chart-badge">This Week</span>
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
                <h3>🍩 Activity Distribution</h3>
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

          {/* ===== CALENDAR ===== */}
          <motion.div className="calendar-section" variants={itemVariants}>
            <div className="calendar-card">
              <div className="calendar-top">
                <div className="calendar-title-area">
                  <h3>📆 Activity Calendar</h3>
                  <span className="calendar-hint">Track your logged activity days</span>
                </div>
                <div className="calendar-nav">
                  <button className="cal-nav-btn" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>
                    ◀
                  </button>
                  <span className="cal-month-label">
                    {currentMonth.toLocaleString("default", { month: "long" })} {year}
                  </span>
                  <button className="cal-nav-btn" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>
                    ▶
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
                    className={`cal-day ${day ? "" : "cal-day-empty"} ${hasActivity(day) ? "cal-active" : ""} ${isToday(day) ? "cal-today" : ""}`}
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
