import express from "express";
import {
  getProgress,
  getTodayStatus,
  getWeeklyAnalytics,
  getBalanceScore,
} from "../controllers/analysisController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/progress", authMiddleware, getProgress);
router.get("/today", authMiddleware, getTodayStatus);
router.get("/weekly", authMiddleware, getWeeklyAnalytics);
router.get("/balance", authMiddleware, getBalanceScore);

export default router;
