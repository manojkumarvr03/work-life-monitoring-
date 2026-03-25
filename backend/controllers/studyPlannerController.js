import { Subject, StudySession, PlannerProgress } from "../models/StudyPlanner.js";

/* ════════════════════════════════════════════════════
   AI SCHEDULING ENGINE
   Pure rule-based intelligent timetable generator
════════════════════════════════════════════════════ */

const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };
const SESSION_DURATION = 50;   // minutes per study block
const BREAK_DURATION   = 10;   // minutes break after each block
const DAY_START_HOUR   = 8;    // 08:00

/**
 * Converts "HH:MM" + offsetMinutes → "HH:MM"
 */
function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

/**
 * Returns number of days from now until deadline (min 1)
 */
function daysUntil(deadline) {
  const diff = new Date(deadline) - new Date();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Assigns a scheduling score to each subject.
 * Higher score → more study blocks per day.
 */
function scoreSubject(subject) {
  const priorityScore = PRIORITY_WEIGHT[subject.priority] || 2;
  const urgencyScore  = Math.min(5, 10 / daysUntil(subject.deadline));
  return priorityScore + urgencyScore;
}

/**
 * generateTimetable(subjects, availableHoursPerDay)
 *
 * Returns an array of session objects (7 days × n sessions each).
 * Each element: { subjectId, subjectName, color, date, startTime, endTime, durationMinutes, isBreak }
 */
function generateTimetable(subjects, availableHoursPerDay) {
  const sessions = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalMinutesPerDay = availableHoursPerDay * 60;
  // slots = how many 50+10 min blocks fit in a day
  const slotsPerDay = Math.floor(totalMinutesPerDay / (SESSION_DURATION + BREAK_DURATION));

  // Score every subject
  const scored = subjects.map((s) => ({
    ...s,
    score: scoreSubject(s),
  }));
  const totalScore = scored.reduce((acc, s) => acc + s.score, 0);

  // Calculate proportional slots per subject per day
  const subjectSlots = scored.map((s) => ({
    ...s,
    dailySlots: Math.max(1, Math.round((s.score / totalScore) * slotsPerDay)),
  }));

  // Calculate dynamic range: from today until the furthest deadline (max 14 days)
  const maxDeadline = subjects.reduce((max, s) => {
    const d = new Date(s.deadline);
    return d > max ? d : max;
  }, new Date(today));
  
  const diffTime = Math.abs(maxDeadline - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysToGenerate = Math.min(14, Math.max(1, diffDays));

  for (let dayOffset = 0; dayOffset < daysToGenerate; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);

    let currentTime = `${String(DAY_START_HOUR).padStart(2, "0")}:00`;
    let slotsFilled = 0;

    // Rotate subjects based on priority — high first each day
    const sorted = [...subjectSlots].sort((a, b) => b.score - a.score);

    for (const subj of sorted) {
      // Robust Date Comparison (Timezone-safe)
      const dateStr = date.toISOString().split("T")[0];
      const deadlineStr = new Date(subj.deadline).toISOString().split("T")[0];
      
      if (dateStr >= deadlineStr) continue;

      const slots = Math.min(subj.dailySlots, slotsPerDay - slotsFilled);
      for (let s = 0; s < slots; s++) {
        const end = addMinutes(currentTime, SESSION_DURATION);
        sessions.push({
          subjectId:     subj._id,
          subjectName:   subj.name,
          subjectColor:  subj.color || "#0ea5e9",
          date:          new Date(date),
          startTime:     currentTime,
          endTime:       end,
          durationMinutes: SESSION_DURATION,
          isBreak:       false,
          status:        "pending",
        });
        // add break
        const breakStart = end;
        const breakEnd   = addMinutes(breakStart, BREAK_DURATION);
        sessions.push({
          subjectId:     null,
          subjectName:   "Break",
          subjectColor:  "#94a3b8",
          date:          new Date(date),
          startTime:     breakStart,
          endTime:       breakEnd,
          durationMinutes: BREAK_DURATION,
          isBreak:       true,
          status:        "pending",
        });
        currentTime = breakEnd;
        slotsFilled++;
        if (slotsFilled >= slotsPerDay) break;
      }
      if (slotsFilled >= slotsPerDay) break;
    }
  }

  return sessions;
}

/* ────────────────────────────────────────────────────
   CONTROLLER FUNCTIONS
──────────────────────────────────────────────────── */

/* POST /api/planner/subjects */
export const addSubject = async (req, res) => {
  try {
    const { name, priority, deadline, dailyHours, color } = req.body;
    const subject = await Subject.create({
      user: req.user.id,
      name, priority, deadline,
      dailyHours: Number(dailyHours),
      color: color || "#0ea5e9",
    });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/planner/subjects */
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.id, isActive: true }).sort({ deadline: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE /api/planner/subjects/:id */
export const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Subject removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/planner/generate
   Generates a fresh 7-day timetable and saves it to DB */
export const generatePlan = async (req, res) => {
  try {
    const { availableHoursPerDay = 6 } = req.body;
    const subjects = await Subject.find({ user: req.user.id, isActive: true }).lean();

    if (!subjects.length) {
      return res.status(400).json({ message: "Add at least one subject first." });
    }

    // Remove existing future sessions
    const today = new Date(); today.setHours(0, 0, 0, 0);
    await StudySession.deleteMany({ user: req.user.id, date: { $gte: today } });

    // Generate and save
    const raw = generateTimetable(subjects, availableHoursPerDay);
    const toInsert = raw.map((s) => ({ ...s, user: req.user.id, subjectName: s.subjectName, subject: s.subjectId }));
    const saved = await StudySession.insertMany(toInsert);

    res.status(201).json({ message: "Timetable generated!", sessions: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/planner/sessions?date=YYYY-MM-DD */
export const getSessions = async (req, res) => {
  try {
    const { date } = req.query;
    let filter = { user: req.user.id };
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }
    const sessions = await StudySession.find(filter).sort({ date: 1, startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/planner/sessions/week */
export const getWeekSessions = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 6); weekEnd.setHours(23, 59, 59, 999);
    const sessions = await StudySession.find({
      user: req.user.id,
      date: { $gte: today, $lte: weekEnd },
    }).sort({ date: 1, startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PATCH /api/planner/sessions/:id/status */
export const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body; // "completed" | "skipped" | "rescheduled"
    const session = await StudySession.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // If skipped → reschedule to end of current day's slot list
    if (status === "skipped" && !session.isBreak) {
      const tomorrow = new Date(session.date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      await StudySession.create({
        user:           req.user.id,
        subject:        session.subject,
        subjectName:    session.subjectName,
        subjectColor:   session.subjectColor,
        date:           tomorrow,
        startTime:      session.startTime,
        endTime:        session.endTime,
        durationMinutes: session.durationMinutes,
        isBreak:        false,
        status:         "pending",
        rescheduledFrom: session.date,
      });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/planner/progress */
export const getProgress = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 6); weekEnd.setHours(23, 59, 59, 999);

    const sessions = await StudySession.find({
      user: req.user.id,
      date: { $gte: today, $lte: weekEnd },
      isBreak: false,
    });

    const total     = sessions.length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    const skipped   = sessions.filter((s) => s.status === "skipped").length;
    const pending   = sessions.filter((s) => s.status === "pending").length;
    const focusMin  = completed * SESSION_DURATION;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Per-subject breakdown
    const subjectMap = {};
    for (const s of sessions) {
      if (!subjectMap[s.subjectName]) {
        subjectMap[s.subjectName] = { name: s.subjectName, color: s.subjectColor, total: 0, completed: 0 };
      }
      subjectMap[s.subjectName].total++;
      if (s.status === "completed") subjectMap[s.subjectName].completed++;
    }

    res.json({
      total, completed, skipped, pending, focusMin, completionRate,
      subjects: Object.values(subjectMap),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/planner/insights */
export const getInsights = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.id, isActive: true });
    const insights = [];

    for (const subj of subjects) {
      const days = daysUntil(subj.deadline);
      const sessions = await StudySession.find({
        user: req.user.id,
        subjectName: subj.name,
        isBreak: false,
      });

      const completed = sessions.filter((s) => s.status === "completed").length;
      const total     = sessions.filter((s) => s.status !== "skipped").length;
      const rate      = total > 0 ? completed / total : 0;

      if (days <= 3 && rate < 0.6) {
        insights.push({
          type: "danger",
          emoji: "🚨",
          subject: subj.name,
          message: `Exam for ${subj.name} in ${days} day${days > 1 ? "s" : ""}! Only ${Math.round(rate * 100)}% sessions done — study now!`,
        });
      } else if (days <= 7 && rate < 0.5) {
        insights.push({
          type: "warning",
          emoji: "⚠️",
          subject: subj.name,
          message: `You're falling behind in ${subj.name}. Increase study time before the deadline.`,
        });
      } else if (rate >= 0.8) {
        insights.push({
          type: "success",
          emoji: "🌟",
          subject: subj.name,
          message: `Excellent work on ${subj.name}! Keep this momentum going.`,
        });
      } else if (rate < 0.3 && total > 3) {
        insights.push({
          type: "warning",
          emoji: "📉",
          subject: subj.name,
          message: `Low completion rate for ${subj.name} (${Math.round(rate * 100)}%). Consider shorter sessions.`,
        });
      }
    }

    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
