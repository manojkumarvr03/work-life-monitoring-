import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: "#a8c4de",
        font: { family: "Inter", size: 12, weight: "600" },
        padding: 16,
        boxWidth: 12,
        boxHeight: 12,
      },
    },
    tooltip: {
      backgroundColor: "rgba(10,22,40,0.95)",
      borderColor: "rgba(59,130,246,0.2)",
      borderWidth: 1,
      titleColor: "#e2e8f0",
      bodyColor: "#a8c4de",
      padding: 12,
      cornerRadius: 10,
      titleFont: { family: "Inter", weight: "700" },
      bodyFont: { family: "Inter" },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(59,130,246,0.06)", drawBorder: false },
      ticks: { color: "#8badc8", font: { family: "Inter", size: 11 } },
      border: { display: false },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)", drawBorder: false },
      ticks: { color: "#64748b", font: { family: "Inter", size: 11 } },
      border: { display: false },
    },
  },
};

const WeeklyChart = ({ analytics }) => {
  if (!analytics) {
    return (
      <div
        style={{
          background: "rgba(18,36,62,0.6)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(59,130,246,0.14)",
          borderRadius: "20px",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <h3 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#8badc8", margin: 0 }}>
          📊 Weekly Analytics
        </h3>
        {/* Skeleton loader bars */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "14px",
              borderRadius: "7px",
              background: "linear-gradient(90deg, rgba(18,36,62,0.5), rgba(59,130,246,0.12), rgba(18,36,62,0.5))",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease infinite",
              width: `${80 - i * 15}%`,
            }}
          />
        ))}
      </div>
    );
  }

  const data = {
    labels: analytics.labels,
    datasets: [
      {
        label: "Study Hours",
        data: analytics.study,
        backgroundColor: "rgba(59,130,246,0.55)",
        borderColor: "rgba(96,165,250,0.8)",
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: "rgba(59,130,246,0.85)",
      },
      {
        label: "Stress Level",
        data: analytics.stress,
        backgroundColor: "rgba(244,63,94,0.5)",
        borderColor: "rgba(244,63,94,1)",
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: "rgba(244,63,94,0.85)",
      },
    ],
  };

  return (
    <div
      style={{
        background: "rgba(18,36,62,0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(59,130,246,0.14)",
        borderRadius: "20px",
        padding: "28px",
        transition: "all 0.3s ease",
      }}
    >
      <h3 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#8badc8", margin: "0 0 20px" }}>
        📊 Weekly Analytics
      </h3>
      <Bar data={data} options={chartOptions} />
    </div>
  );
};

export default WeeklyChart;
