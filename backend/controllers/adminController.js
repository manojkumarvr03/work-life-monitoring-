import User from "../models/User.js";
import Activity from "../models/Activity.js";

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalActivities = await Activity.countDocuments();
    
    // Performance: average study hours across all activities
    const activities = await Activity.find({});
    const totalStudyHours = activities.reduce((sum, a) => sum + (Number(a.studyHours || 0) + Number(a.workHours || 0)), 0);
    const avgStudyHours = totalActivities > 0 ? (totalStudyHours / totalActivities).toFixed(2) : 0;

    res.json({
      totalUsers,
      totalActivities,
      avgStudyHours,
      recentUsers: await User.find({}).select("-password").sort({ createdAt: -1 }).limit(5)
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.role === "Admin" && req.user._id.toString() !== user._id.toString()) {
       // Prevent deleting other admins for safety, or allow it with caution
       // For now, let's allow deleting but maybe add a check
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["Student", "Employee", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user role" });
  }
};

// @desc    Get user performance (logs + balance score)
// @route   GET /api/admin/users/:id/performance
// @access  Private/Admin
export const getUserPerformance = async (req, res) => {
  try {
    const userId = req.params.id;
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30);

    if (!activities.length) {
      return res.json({ 
        score: 0, 
        label: "No Data", 
        totalLogs: 0, 
        avgStudyHours: 0,
        recentActivities: [] 
      });
    }

    // Calculate metrics
    const totalLogs = activities.length;
    const totalStudyHours = activities.reduce((sum, a) => sum + (Number(a.studyHours || 0) + Number(a.workHours || 0)), 0);
    const avgStudyHours = (totalStudyHours / totalLogs).toFixed(2);

    // Group by date for balance score (similar to analysisController)
    const dailyData = {};
    activities.forEach(a => {
      const dateKey = new Date(a.createdAt).toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { study: 0, sleep: 0, stress: 0, stressCount: 0, physical: 0 };
      }
      dailyData[dateKey].study += Number(a.studyHours || 0) + Number(a.workHours || 0);
      dailyData[dateKey].sleep += Number(a.sleepHours || 0);
      dailyData[dateKey].physical += Number(a.physicalActivity || 0);
      if (a.stressLevel !== undefined && a.stressLevel !== null) {
        dailyData[dateKey].stress += Number(a.stressLevel);
        dailyData[dateKey].stressCount++;
      }
    });

    const sortedDates = Object.keys(dailyData).sort().reverse().slice(0, 7);
    const count = sortedDates.length;

    let tStudy = 0, tSleep = 0, tStress = 0, tPhysical = 0;
    sortedDates.forEach(date => {
      const day = dailyData[date];
      tStudy += day.study;
      tSleep += day.sleep;
      tPhysical += day.physical;
      tStress += day.stressCount > 0 ? (day.stress / day.stressCount) : 5;
    });

    const avgS = tStudy / count;
    const avgSl = tSleep / count;
    const avgSt = tStress / count;
    const avgP = tPhysical / count;

    let workScore = 0;
    if (avgS >= 6 && avgS <= 8) workScore += 100;
    else workScore += Math.max(0, 100 - Math.abs(avgS - 7) * 15);

    let lifeScore = 0;
    if (avgSl >= 7 && avgSl <= 8) lifeScore += 50;
    else lifeScore += Math.max(0, 50 - Math.abs(avgSl - 7.5) * 10);
    lifeScore += Math.max(0, 30 - avgSt * 5);
    lifeScore += Math.min(20, (avgP / 30) * 20);

    const score = Math.round((workScore + lifeScore) / 2);
    let label = "Good 👍";
    if (score < 40) label = "Poor ⚠️";
    else if (score < 70) label = "Average 🙂";

    res.json({
      score,
      label,
      workScore: Math.round(workScore),
      lifeScore: Math.round(lifeScore),
      totalLogs,
      avgStudyHours,
      recentActivities: activities.slice(0, 10) // Top 10 recent logs
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user performance" });
  }
};
