import mongoose from "mongoose";

/* ─────────────────────────────────────
   SUBJECT SCHEMA
───────────────────────────────────── */
const subjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    deadline: { type: Date, required: true },
    dailyHours: { type: Number, required: true, min: 0.5, max: 12 },
    color: { type: String, default: "#0ea5e9" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ─────────────────────────────────────
   STUDY SESSION SCHEMA
   (one slot in the generated timetable)
───────────────────────────────────── */
const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    subjectName: String,
    subjectColor: { type: String, default: "#0ea5e9" },
    date: { type: Date, required: true },          // ISO date of the session
    startTime: String,                              // "09:00"
    endTime: String,                                // "09:50"
    durationMinutes: { type: Number, default: 50 },
    status: {
      type: String,
      enum: ["pending", "completed", "skipped", "rescheduled"],
      default: "pending",
    },
    isBreak: { type: Boolean, default: false },
    rescheduledFrom: Date,
  },
  { timestamps: true }
);

/* ─────────────────────────────────────
   PLANNER PROGRESS SCHEMA
   (daily aggregate per user)
───────────────────────────────────── */
const plannerProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    totalSessions: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    skippedSessions: { type: Number, default: 0 },
    focusMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Subject = mongoose.model("Subject", subjectSchema);
export const StudySession = mongoose.model("StudySession", sessionSchema);
export const PlannerProgress = mongoose.model("PlannerProgress", plannerProgressSchema);
