import Activity from "../models/Activity.js";

/* =========================
   📊 SUMMARY REPORT (DATE RANGE)
 ========================= */
export const getSummaryReport = async (req, res) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(0);

    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    const activities = await Activity.find({
      user: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    let totalStudy = 0;
    let totalSleep = 0;
    let totalStress = 0;
    let stressCount = 0;

    activities.forEach((a) => {
      totalStudy += Number(a.studyHours || 0) + Number(a.workHours || 0);
      totalSleep += Number(a.sleepHours || 0);
      if (a.stressLevel !== undefined && a.stressLevel !== null) {
        totalStress += Number(a.stressLevel);
        stressCount++;
      }
    });

    res.json({
      totalStudy,
      avgSleep: activities.length
        ? Math.round(totalSleep / activities.length)
        : 0,
      avgStress: stressCount
        ? Math.round(totalStress / stressCount)
        : 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Summary report failed" });
  }
};

/* =========================
   📈 WEEKLY REPORT (DATE RANGE)
 ========================= */
export const getWeeklyReport = async (req, res) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(new Date().getDate() - 6));

    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    const activities = await Activity.find({
      user: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const study = Array(7).fill(0);
    const stress = Array(7).fill(0);
    const stressCounts = Array(7).fill(0);
    const sleep = Array(7).fill(0);
    const physical = Array(7).fill(0);

    activities.forEach((a) => {
      const dayIndex = new Date(a.createdAt).getDay();
      study[dayIndex] += Number(a.studyHours || 0) + Number(a.workHours || 0);
      sleep[dayIndex] += Number(a.sleepHours || 0);
      physical[dayIndex] += Number(a.physicalActivity || 0);
      if (a.stressLevel !== undefined && a.stressLevel !== null) {
        stress[dayIndex] += Number(a.stressLevel);
        stressCounts[dayIndex]++;
      }
    });

    // Average stress levels
    for (let i = 0; i < 7; i++) {
      if (stressCounts[i] > 0) {
        stress[i] = Math.round(stress[i] / stressCounts[i]);
      }
    }

    res.json({ labels, study, stress, sleep, physical });
  } catch (err) {
    res.status(500).json({ message: "Weekly report failed" });
  }
};

/* =========================
   📅 MONTHLY REPORT
========================= */
export const getMonthlyReport = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id });

    if (activities.length === 0) {
      return res.json([]);
    }

    const months = {};

    activities.forEach((a) => {
      const month = new Date(a.createdAt).toLocaleString("default", {
        month: "short",
      });

      if (!months[month]) months[month] = 0;
      months[month] += Number(a.studyHours || 0) + Number(a.workHours || 0);
    });

    const data = Object.keys(months).map((m) => ({
      month: m,
      hours: months[m],
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Monthly report failed" });
  }
};
/* =========================
   📅 ACTIVITY DATES (CALENDAR)
========================= */
export const getActivityDates = async (req, res) => {
  try {
    const activities = await Activity.find(
      { user: req.user.id },
      { createdAt: 1, _id: 0 }
    );

    // Convert to YYYY-MM-DD
    const dates = activities.map((a) =>
      a.createdAt.toISOString().split("T")[0]
    );

    res.json(dates);
  } catch (err) {
    res.status(500).json({ message: "Failed to load activity dates" });
  }
};
