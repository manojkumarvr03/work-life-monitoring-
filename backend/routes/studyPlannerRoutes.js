import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  addSubject,
  getSubjects,
  deleteSubject,
  generatePlan,
  getSessions,
  getWeekSessions,
  updateSessionStatus,
  getProgress,
  getInsights,
} from "../controllers/studyPlannerController.js";

const router = express.Router();

// Subjects
router.get("/subjects",          protect, getSubjects);
router.post("/subjects",         protect, addSubject);
router.delete("/subjects/:id",   protect, deleteSubject);

// Timetable Generation
router.post("/generate",         protect, generatePlan);

// Sessions
router.get("/sessions",          protect, getSessions);
router.get("/sessions/week",     protect, getWeekSessions);
router.patch("/sessions/:id/status", protect, updateSessionStatus);

// Progress & Insights
router.get("/progress",          protect, getProgress);
router.get("/insights",          protect, getInsights);

export default router;
