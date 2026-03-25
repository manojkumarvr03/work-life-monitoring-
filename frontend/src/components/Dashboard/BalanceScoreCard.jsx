import { Sparkles, Zap, Target } from "lucide-react";

const BalanceScoreCard = ({ score = 0, label = "", title = "Balance Score", description = "Your work-life balance" }) => {
  const safeId = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * Math.min(100, score)) / 100;

  const getColor = () => {
    if (score >= 80) return ["#10b981", "#34d399"]; // Emerald to Mint
    if (score >= 60) return ["#3b82f6", "#8b5cf6"]; // Blue to Violet
    return ["#f43f5e", "#fb923c"]; // Rose to Orange (Vibrant Warning)
  };
  const [c1, c2] = getColor();

  const getIcon = () => {
    if (score >= 80) return <Sparkles size={24} color="#10b981" className="btn-glow" />;
    if (score >= 60) return <Zap size={24} color="#3b82f6" />;
    return <Target size={24} color="#f43f5e" />;
  };

  const getMsg = () => {
    if (score >= 80) return "Excellent Balance!";
    if (score >= 60) return label || "Good Balance";
    return label || "Needs Focus";
  };

  return (
    <div className="card glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        padding: "32px",
      }}
    >
      {/* Top label */}
      <h3
        className="glow-text"
        style={{
          fontSize: "14px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-secondary)",
          margin: 0,
          alignSelf: "flex-start",
        }}
      >
        {title}
      </h3>

      {/* SVG Ring */}
      <div style={{ position: "relative", width: 170, height: 170 }}>
        <svg
          width="170"
          height="170"
          viewBox="0 0 170 170"
          style={{ transform: "rotate(-90deg)" }}
        >
          <defs>
            <linearGradient id={`balanceGrad-${safeId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c1} />
              <stop offset="100%" stopColor={c2} />
            </linearGradient>
            <filter id={`glow-${safeId}`}>
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx="85"
            cy="85"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="12"
          />

          {/* Progress */}
          <circle
            cx="85"
            cy="85"
            r={radius}
            fill="none"
            stroke={`url(#balanceGrad-${safeId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter={`url(#glow-${safeId})`}
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        </svg>

        {/* Center text */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            textAlign: "center",
          }}
        >
          <div
            className="shimmer-text"
            style={{
              fontSize: "38px",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em"
            }}
          >
            {score}%
          </div>
        </div>
      </div>

      {/* Label */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px", marginBottom: "8px", display: "flex", justifyContent: "center" }}>{getIcon()}</div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "6px"
          }}
        >
          {getMsg()}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {description}
        </div>
      </div>
    </div >
  );
};

export default BalanceScoreCard;
