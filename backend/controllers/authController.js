import User from "../models/User.js";
import Activity from "../models/Activity.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/* =======================
   REGISTER
======================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    await User.create({
      name,
      email,
      password: hashed,
      role: (role === "Admin" && email === "admin@wx.com") ? "Admin" : (role || "Student")
    });

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =======================
   LOGIN
======================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =======================
   GET PROFILE
======================= */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activities = await Activity.find({ user: user._id });

    const studyHours = activities.reduce(
      (sum, a) => sum + (Number(a.studyHours || 0) + Number(a.workHours || 0)),
      0
    );

    const avgSleep =
      activities.length === 0
        ? 0
        : (
          activities.reduce((s, a) => s + (a.sleepHours || 0), 0) /
          activities.length
        ).toFixed(1);

    res.json({
      user,
      stats: {
        studyHours,
        tasksCompleted: activities.length,
        avgSleep
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Profile fetch failed" });
  }
};

/* =======================
   UPDATE PROFILE
======================= */
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

/* =======================
   CHANGE PASSWORD
======================= */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password change failed" });
  }
};

/* =======================
   GOOGLE LOGIN
======================= */
export const googleLogin = async (req, res) => {
  try {
    const { token: googleToken } = req.body;
    
    // 1. Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // 2. Find or Create User
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for Google Sign-in
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture || "",
        role: "Student",
      });
    } else if (!user.googleId) {
      // Link Google ID to existing email account
      user.googleId = sub;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    // 3. Issue our JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null
      }
    });
  } catch (err) {
    console.error("Google verify error:", err);
    res.status(400).json({ message: "Google account verification failed" });
  }
};

