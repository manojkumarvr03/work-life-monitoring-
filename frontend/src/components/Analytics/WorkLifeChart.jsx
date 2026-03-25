import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Scale } from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            position: "top",
            align: 'end',
            labels: {
                color: "#64748b",
                font: { family: "Outfit", size: 12, weight: "600" },
                padding: 16,
                boxWidth: 12,
                boxHeight: 12,
                usePointStyle: true,
                pointStyle: "rectRounded",
            },
        },
        tooltip: {
            backgroundColor: "rgba(255,255,255,0.96)",
            borderColor: "rgba(14,165,233,0.1)",
            borderWidth: 1,
            titleColor: "#0f172a",
            bodyColor: "#475569",
            padding: 12,
            cornerRadius: 10,
            titleFont: { family: "Outfit", weight: "700" },
            bodyFont: { family: "Outfit" },
            displayColors: true,
            boxPadding: 4,
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: "#64748b", font: { family: "Outfit", size: 11 } },
            border: { display: false },
        },
        y: {
            grid: { color: "rgba(0,0,0,0.03)", drawBorder: false },
            ticks: { color: "#64748b", font: { family: "Outfit", size: 11 } },
            border: { display: false },
            beginAtZero: true,
        },
    },
};

const WorkLifeChart = ({ analytics, isWorkRole = false }) => {
    const primaryLabel = isWorkRole ? "Work Hours" : "Study Hours";

    if (!analytics || !analytics.sleep || !analytics.physical) {
        return (
            <div
                style={{
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(14, 165, 233, 0.08)",
                    borderRadius: "20px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)"
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Scale size={18} color="#0ea5e9" /> {isWorkRole ? "Work vs Life Balance" : "Study vs Life Balance"}
                    </h3>
                </div>
                {/* Skeleton loader */}
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        style={{
                            height: "14px",
                            borderRadius: "7px",
                            background: "linear-gradient(90deg, rgba(14,165,233,0.1), rgba(14,165,233,0.05), rgba(14,165,233,0.1))",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 1.5s ease infinite",
                            width: `${80 - i * 15}%`,
                            marginTop: "10px"
                        }}
                    />
                ))}
            </div>
        );
    }

    const lifeActivities = analytics.sleep.map((s, i) => {
        const physicalHours = (analytics.physical[i] || 0) / 60;
        return s + physicalHours;
    });

    const data = {
        labels: analytics.labels,
        datasets: [
            {
                label: primaryLabel,
                data: analytics.study,
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const { ctx: canvasCtx, chartArea } = chart;
                    if (!chartArea) return "#3b82f6";
                    const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, "#3b82f6");
                    gradient.addColorStop(1, "#8b5cf6");
                    return gradient;
                },
                borderRadius: 12,
                borderSkipped: false,
                barPercentage: 0.5,
                categoryPercentage: 0.6,
            },
            {
                label: "Life (Sleep + Exercise Hrs)",
                data: lifeActivities,
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const { ctx: canvasCtx, chartArea } = chart;
                    if (!chartArea) return "#f43f5e";
                    const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, "#ec4899");
                    gradient.addColorStop(1, "#fb923c");
                    return gradient;
                },
                borderRadius: 12,
                borderSkipped: false,
                barPercentage: 0.5,
                categoryPercentage: 0.6,
            },
        ],
    };

    return (
        <div
            style={{
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(14, 165, 233, 0.08)",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)"
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Scale size={18} color="#0ea5e9" /> Work vs Life Balance
                </h3>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#0284c7", background: "rgba(14, 165, 233, 0.06)", border: "1px solid rgba(14, 165, 233, 0.1)", borderRadius: "20px", padding: "4px 12px" }}>
                    This Week
                </span>
            </div>
            <div style={{ width: "100%", position: "relative" }}>
                <Bar data={data} options={chartOptions} />
            </div>
        </div>
    );
};

export default WorkLifeChart;
