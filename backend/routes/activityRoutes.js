import express from "express";
import {
  addActivity,
  getActivities,
  getRecentActivities,
  deleteActivity
} from "../controllers/activityController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { getBalanceScore } from "../controllers/analysisController.js";

const router = express.Router();

/* ===============================
   ACTIVITY ROUTES
================================ */

// Add activity
router.post("/", authMiddleware, addActivity);

// Get ALL activities (Profile page)
router.get("/", authMiddleware, getActivities);

// Get LAST 2 activities (Activity Tracker)
router.get("/recent", authMiddleware, getRecentActivities);

// Balance score
router.get("/balance", authMiddleware, getBalanceScore);

// Delete activity
router.delete("/:id", authMiddleware, deleteActivity);

export default router;
