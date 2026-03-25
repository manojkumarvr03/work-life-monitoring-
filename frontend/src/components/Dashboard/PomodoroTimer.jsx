import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/pomodoro.css";

/* ─────────────────────────────────────────
   MODES CONFIG
───────────────────────────────────────── */
const MODES = {
  focus:      { label: "Focus",       emoji: "🍅", minutes: 25, color: "#0ea5e9" },
  shortBreak: { label: "Short Break", emoji: "☕", minutes: 5,  color: "#10b981" },
  longBreak:  { label: "Long Break",  emoji: "🌿", minutes: 15, color: "#8b5cf6" },
};

const TOTAL_SESSIONS = 4; // pomodoros before a long break

/* ─────────────────────────────────────────
   AUDIO BELL (Web Audio API — no assets needed)
───────────────────────────────────────── */
function playBell() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch (_) {}
}

/* ─────────────────────────────────────────
   SVG RING
───────────────────────────────────────── */
const RING_R   = 88;
const RING_C   = 2 * Math.PI * RING_R; // circumference

function TimerRing({ progress, color }) {
  const dash = RING_C * (1 - progress);
  return (
    <svg className="pomo-ring-svg" viewBox="0 0 200 200">
      {/* track */}
      <circle cx="100" cy="100" r={RING_R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10" />
      {/* progress */}
      <circle
        cx="100" cy="100" r={RING_R}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={RING_C}
        strokeDashoffset={dash}
        transform="rotate(-90 100 100)"
        style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function PomodoroTimer() {
  const [mode, setMode]           = useState("focus");
  const [running, setRunning]     = useState(false);
  const [secondsLeft, setSeconds] = useState(MODES.focus.minutes * 60);
  const [sessions, setSessions]   = useState(0);       // completed focus rounds
  const [totalFocus, setTotalFocus] = useState(0);     // total focus minutes accumulated
  const [showDone, setShowDone]   = useState(false);

  const intervalRef = useRef(null);
  const cfg = MODES[mode];
  const totalSec = cfg.minutes * 60;
  const progress = secondsLeft / totalSec;

  /* ── format mm:ss ── */
  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  /* ── tick ── */
  const tick = useCallback(() => {
    setSeconds((prev) => {
      if (prev <= 1) {
        clearInterval(intervalRef.current);
        setRunning(false);
        playBell();
        setShowDone(true);
        setTimeout(() => setShowDone(false), 3000);

        if (mode === "focus") {
          setSessions((s) => {
            const next = s + 1;
            setTotalFocus((f) => f + MODES.focus.minutes);
            // auto-switch mode suggestion
            if (next % TOTAL_SESSIONS === 0) setMode("longBreak");
            else setMode("shortBreak");
            return next;
          });
        } else {
          setMode("focus");
        }
        return 0;
      }
      return prev - 1;
    });
  }, [mode]);

  /* ── start/stop ── */
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, tick]);

  /* ── switch mode (reset timer) ── */
  const switchMode = (m) => {
    setRunning(false);
    setMode(m);
    setSeconds(MODES[m].minutes * 60);
  };

  /* ── reset ── */
  const reset = () => {
    setRunning(false);
    setSeconds(cfg.minutes * 60);
  };

  return (
    <div className="pomo-card card">
      {/* HEADER */}
      <div className="pomo-header">
        <h3>🍅 Pomodoro Timer</h3>
        <span className="pomo-total-badge">
          ⏱ {totalFocus} min focused today
        </span>
      </div>

      {/* MODE SWITCHER */}
      <div className="pomo-mode-tabs">
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            className={`pomo-mode-btn ${mode === key ? "active" : ""}`}
            style={mode === key ? { "--pomo-color": val.color } : {}}
            onClick={() => switchMode(key)}
          >
            {val.emoji} {val.label}
          </button>
        ))}
      </div>

      {/* RING + TIME */}
      <div className="pomo-ring-wrap">
        <TimerRing progress={progress} color={cfg.color} />
        <div className="pomo-ring-inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              className="pomo-mode-emoji"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {cfg.emoji}
            </motion.div>
          </AnimatePresence>
          <div className="pomo-time" style={{ color: cfg.color }}>
            {fmt(secondsLeft)}
          </div>
          <div className="pomo-mode-label">{cfg.label}</div>
        </div>

        {/* "Done!" pulse overlay */}
        <AnimatePresence>
          {showDone && (
            <motion.div
              className="pomo-done-overlay"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.35 }}
            >
              🎉 Done!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SESSION DOTS */}
      <div className="pomo-sessions">
        {Array.from({ length: TOTAL_SESSIONS }, (_, i) => (
          <div
            key={i}
            className={`pomo-dot ${i < (sessions % TOTAL_SESSIONS) ? "filled" : ""} ${sessions > 0 && sessions % TOTAL_SESSIONS === 0 && i === TOTAL_SESSIONS - 1 ? "filled" : ""}`}
            style={{ "--pomo-color": MODES.focus.color }}
          />
        ))}
        <span className="pomo-sessions-label">
          {sessions} session{sessions !== 1 ? "s" : ""} completed
        </span>
      </div>

      {/* CONTROLS */}
      <div className="pomo-controls">
        <button className="pomo-btn pomo-reset-btn" onClick={reset} title="Reset">
          ↺
        </button>
        <button
          className={`pomo-btn pomo-play-btn ${running ? "pause" : "play"}`}
          style={{ "--pomo-color": cfg.color }}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          className="pomo-btn pomo-skip-btn"
          onClick={() => {
            if (mode === "focus") switchMode("shortBreak");
            else switchMode("focus");
          }}
          title="Skip"
        >
          ⏭
        </button>
      </div>

      {/* TIP */}
      <p className="pomo-tip">
        {mode === "focus"
          ? "💡 Stay focused — close distractions and avoid your phone."
          : mode === "shortBreak"
          ? "☕ Take a breather — stretch or grab some water!"
          : "🌿 Long break! Walk around or take a quick nap."}
      </p>
    </div>
  );
}
