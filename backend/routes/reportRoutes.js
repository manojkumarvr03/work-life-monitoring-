import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getSummaryReport,
  getWeeklyReport,
  getMonthlyReport,
  getActivityDates, // ✅ MISSING IMPORT FIXED
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/summary", authMiddleware, getSummaryReport);
router.get("/weekly", authMiddleware, getWeeklyReport);
router.get("/monthly", authMiddleware, getMonthlyReport);
router.get("/activity-dates", authMiddleware, getActivityDates);

export default router;
