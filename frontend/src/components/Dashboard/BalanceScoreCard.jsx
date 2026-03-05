const BalanceScoreCard = ({ score = 0, label = "" }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * Math.min(100, score)) / 100;

  const getColor = () => {
    if (score >= 80) return ["#10b981", "#22d3ee"];
    if (score >= 60) return ["#3b82f6", "#60a5fa"];
    return ["#f59e0b", "#f97316"];
  };
  const [c1, c2] = getColor();

  const getEmoji = () => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "⚡";
    return "💪";
  };

  const getMsg = () => {
    if (score >= 80) return "Excellent Balance!";
    if (score >= 60) return label || "Keep Going!";
    return label || "Needs Improvement";
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top label */}
      <h3
        style={{
          fontSize: "13px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: "#8badc8",
          margin: 0,
          alignSelf: "flex-start",
        }}
      >
        ⚖️ Balance Score
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
            <linearGradient id="balanceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c1} />
              <stop offset="100%" stopColor={c2} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
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
            stroke="rgba(59,130,246,0.1)"
            strokeWidth="10"
          />

          {/* Progress */}
          <circle
            cx="85"
            cy="85"
            r={radius}
            fill="none"
            stroke="url(#balanceGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#glow)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
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
            style={{
              fontSize: "36px",
              fontWeight: 900,
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}
          >
            {score}%
          </div>
        </div>
      </div>

      {/* Label */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px", marginBottom: "4px" }}>{getEmoji()}</div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#e2e8f0",
          }}
        >
          {getMsg()}
        </div>
        <div style={{ fontSize: "12px", color: "#8badc8", marginTop: "4px" }}>
          Your weekly work-life balance
        </div>
      </div>

      {/* Background glow orb */}
      <div
        style={{
          position: "absolute",
          width: "200px",
          height: "200px",
          background: `radial-gradient(circle, ${c1}18 0%, transparent 70%)`,
          borderRadius: "50%",
          bottom: "-60px",
          right: "-60px",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default BalanceScoreCard;
