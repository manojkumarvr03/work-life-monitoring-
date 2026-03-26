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
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const seedAdmin = async () => {
  try {
    const adminEmail = "mnojkumarvr@gmail.com";
    const adminPass = "manoj9703";
    
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log("Seeding Admin User...");
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(adminPass, salt);
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: hashed,
        role: "Admin"
      });
      console.log("✅ Admin Created successfully");
    } else if (admin.role !== "Admin") {
      console.log("Promoting User to Admin...");
      admin.role = "Admin";
      await admin.save();
      console.log("✅ User Promoted to Admin successfully");
    }
  } catch (err) {
    console.error("❌ Admin Seeding Failed:", err.message);
  }
};

connectDB().then(() => {
    seedAdmin();
});

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

// Admin Routes
import adminRoutes from "./routes/adminRoutes.js";
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
