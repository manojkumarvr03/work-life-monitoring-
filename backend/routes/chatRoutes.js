import express from "express";
import { getChatResponse } from "../controllers/chatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All chat routes are protected
router.post("/", authMiddleware, getChatResponse);

export default router;
