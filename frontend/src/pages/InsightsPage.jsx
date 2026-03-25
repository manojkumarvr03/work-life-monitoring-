import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar/Sidebar";
import API from "../services/api";
import "../styles/insights.css";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    RadialLinearScale,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";
import { Line, Radar } from "react-chartjs-2";
import { 
    Lightbulb, 
    BookOpen, 
    HeartPulse, 
    Zap, 
    TrendingUp, 
    Compass, 
    Bot, 
    AlertTriangle, 
    Moon, 
    Star, 
    ClipboardList,
    CheckCircle2
} from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    RadialLinearScale,
    Filler,
    Tooltip,
    Legend
);

const InsightsPage = () => {
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(null);
    const [monthly, setMonthly] = useState([]);
    const [weekly, setWeekly] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const [balRes, monthRes, weekRes] = await Promise.all([
                    API.get("/analysis/balance"),
                    API.get("/reports/monthly"),
                    API.get("/reports/weekly"),
                ]);
                setBalance(balRes.data);
                setMonthly(monthRes.data);
                setWeekly(weekRes.data);
            } catch (error) {
                console.error("Failed to fetch insights", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    // Monthly Trend Data
    const monthlyData = {
        labels: monthly.map((m) => m.month),
        datasets: [
            {
                label: "Study Time (Hours)",
                data: monthly.map((m) => m.hours),
                borderColor: "#0ea5e9",
                backgroundColor: "rgba(14, 165, 233, 0.2)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#0284c7",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                titleFont: { family: "'Outfit', sans-serif", weight: "700" },
                bodyFont: { family: "'Outfit', sans-serif" },
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: "'Outfit', sans-serif" } } },
            y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { family: "'Outfit', sans-serif" } } },
        },
    };

    // Well-being Radar Data
    const radarData = {
        labels: ["Sleep Quality", "Stress Management", "Physical Activity", "Study Consistency"],
        datasets: [
            {
                label: "Well-being Index",
                data: weekly ? [
                    (weekly.sleep.reduce((a, b) => a + b, 0) / 7 / 8) * 100, // normalized to 8 hrs = 100%
                    100 - (weekly.stress.reduce((a, b) => a + b, 0) / 7 / 10) * 100, // normalized, lower stress = better
                    (weekly.physical.reduce((a, b) => a + b, 0) / 7 / 60) * 100, // normalized to 60 mins = 100%
                    balance?.score || 0
                ].map(v => Math.min(100, Math.max(0, v || 0))) : [0, 0, 0, 0],
                backgroundColor: "rgba(16, 185, 129, 0.3)",
                borderColor: "#10b981",
                pointBackgroundColor: "#059669",
                pointBorderColor: "#fff",
                pointRadius: 4,
            },
        ],
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { color: "rgba(0,0,0,0.05)" },
                grid: { color: "rgba(0,0,0,0.05)" },
                pointLabels: { font: { family: "'Outfit', sans-serif", size: 12, weight: "600" }, color: "#64748b" },
                ticks: { display: false, max: 100, min: 0 },
            },
        },
        plugins: {
            legend: { display: false },
        },
    };

    return (
        <div className="app-shell">
            <Sidebar />
            <main className="dashboard-main insights-page">
                <div className="insights-header">
                    <div className="insights-header-text">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <Lightbulb size={32} color="#0ea5e9" />
                            <h1 style={{ margin: 0 }}>Performance Insights</h1>
                        </div>
                        <p>Analyze your study routines, productivity patterns, and overall well-being.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Generating insights...</div>
                ) : (
                    <div className="insights-content">

                        {/* Top Stat Cards */}
                        <div className="insights-stats-grid">
                            <div className="insight-stat-card work-card">
                                <div className="stat-icon-wrapper"><BookOpen size={24} /></div>
                                <div className="stat-details">
                                    <h4>Productivity Score</h4>
                                    <h2>{balance?.workScore || 0}<span>/100</span></h2>
                                    <p>{balance?.workLabel || "Analyzing..."}</p>
                                </div>
                            </div>
                            <div className="insight-stat-card life-card">
                                <div className="stat-icon-wrapper"><HeartPulse size={24} /></div>
                                <div className="stat-details">
                                    <h4>Well-being Score</h4>
                                    <h2>{balance?.lifeScore || 0}<span>/100</span></h2>
                                    <p>{balance?.lifeLabel || "Analyzing..."}</p>
                                </div>
                            </div>
                            <div className="insight-stat-card flow-card">
                                <div className="stat-icon-wrapper"><Zap size={24} /></div>
                                <div className="stat-details">
                                    <h4>Routine Efficiency</h4>
                                    <h2>{balance?.score || 0}<span>%</span></h2>
                                    <p>Overall Balance</p>
                                </div>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="insights-charts-grid">
                            {/* Monthly Trend */}
                            <div className="insight-chart-container">
                                <div className="chart-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <TrendingUp size={20} color="#0ea5e9" />
                                        <h3>Study Time Trend</h3>
                                    </div>
                                    <span>Monthly Review</span>
                                </div>
                                <div className="chart-box">
                                    {monthly.length > 0 ? (
                                        <Line data={monthlyData} options={lineOptions} />
                                    ) : (
                                        <div className="empty-chart">Not enough data to calculate trend.</div>
                                    )}
                                </div>
                                <div className="insight-tip">
                                    <strong>Insight:</strong> Consistent study routines yield better retention than scattered cramming sessions.
                                </div>
                            </div>

                            {/* Well-being Radar */}
                            <div className="insight-chart-container">
                                <div className="chart-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Compass size={20} color="#10b981" />
                                        <h3>Well-being Compass</h3>
                                    </div>
                                    <span>Balance Check</span>
                                </div>
                                <div className="chart-box">
                                    <Radar data={radarData} options={radarOptions} />
                                </div>
                                <div className="insight-tip">
                                    <strong>Insight:</strong> Sleep and stress management are critical co-factors for cognitive performance.
                                </div>
                            </div>
                        </div>

                        {/* AI Recommendations Area */}
                        <div className="recommendations-panel">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <Bot size={24} color="#8b5cf6" />
                                <h3 style={{ margin: 0 }}>Routine Recommendations</h3>
                            </div>
                            <ul className="rec-list">
                                {balance?.workScore < 60 && (
                                    <li>
                                        <span className="rec-icon"><AlertTriangle color="#f59e0b" size={20} /></span>
                                        <div>
                                            <strong>Increase Focused Study:</strong> Your productivity score is dipping. Try the Pomodoro technique (25m study/5m break) to build momentum.
                                        </div>
                                    </li>
                                )}
                                {balance?.lifeScore < 60 && (
                                    <li>
                                        <span className="rec-icon"><Moon color="#8b5cf6" size={20} /></span>
                                        <div>
                                            <strong>Prioritize Rest:</strong> Your well-being score indicates high stress or low sleep. Limit screen time 1 hour before bed and aim for 7-8 hours of sleep.
                                        </div>
                                    </li>
                                )}
                                {balance?.score >= 70 && (
                                    <li>
                                        <span className="rec-icon"><Star color="#fbbf24" size={20} /></span>
                                        <div>
                                            <strong>Excellent Balance:</strong> You're maintaining a great harmony between academics and personal life. Keep up the consistent routine!
                                        </div>
                                    </li>
                                )}
                                {(!balance || (!balance.workScore && !balance.lifeScore)) && (
                                    <li>
                                        <span className="rec-icon"><ClipboardList color="#0ea5e9" size={20} /></span>
                                        <div>
                                            <strong>Log More Activities:</strong> Track your daily routine in the Activity Tracker to receive personalized insights here.
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};

export default InsightsPage;
