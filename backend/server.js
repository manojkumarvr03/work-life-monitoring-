import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import studyPlannerRoutes from "./routes/studyPlannerRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Auth & User
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);

// Core Features
app.use("/api/activities", activityRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatRoutes);


// Schedules
app.use("/api/schedules", scheduleRoutes);

// Study Planner
app.use("/api/planner", studyPlannerRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
