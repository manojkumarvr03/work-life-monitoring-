import Activity from "../models/Activity.js";

/* =========================
   📊 Progress (ALL TIME)
========================= */
export const getProgress = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id });

    const totalLessons = activities.length;
    const totalHours = activities.reduce(
      (sum, act) => sum + Number(act.studyHours || 0) + Number(act.workHours || 0),
      0
    );

    res.json({
      lessons: totalLessons,
      hours: totalHours,
    });
  } catch (err) {
    res.status(500).json({ message: "Progress fetch failed" });
  }
};

/* =========================
   📅 Today’s Status
========================= */
export const getTodayStatus = async (req, res) => {
  try {
    let query = { user: req.user.id };
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();

    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    query.createdAt = { $gte: start, $lte: end };

    const activities = await Activity.find(query);

    if (activities.length === 0) {
      return res.json(null);
    }

    // Aggregate values
    const aggregated = {
      studyHours: 0,
      workHours: 0,
      sleepHours: 0,
      physicalActivity: 0,
      stressLevel: 0,
      waterLiters: 0,
      subjectsCount: 0,
      classesAttended: 0,
    };

    let stressCount = 0;
    activities.forEach(act => {
      aggregated.studyHours += Number(act.studyHours || 0);
      aggregated.workHours += Number(act.workHours || 0);
      aggregated.sleepHours += Number(act.sleepHours || 0);
      aggregated.physicalActivity += Number(act.physicalActivity || 0);
      aggregated.waterLiters += Number(act.waterLiters || 0);
      aggregated.subjectsCount += Number(act.subjectsCount || 0);
      aggregated.classesAttended += Number(act.classesAttended || 0);

      if (act.stressLevel !== undefined && act.stressLevel !== null) {
        aggregated.stressLevel += Number(act.stressLevel);
        stressCount++;
      }
    });

    if (stressCount > 0) {
      aggregated.stressLevel = Math.round(aggregated.stressLevel / stressCount);
    }

    res.json(aggregated);
  } catch (err) {
    res.status(500).json({ message: "Today status fetch failed" });
  }
};

/* =========================
   📈 Weekly Analytics
========================= */
export const getWeeklyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const activities = await Activity.find({
      user: userId,
      createdAt: { $gte: startOfWeek, $lt: endOfWeek },
    });

    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const study = Array(7).fill(0);
    const stress = Array(7).fill(0);
    const stressCounts = Array(7).fill(0);
    const sleep = Array(7).fill(0);
    const physical = Array(7).fill(0);

    activities.forEach((act) => {
      const dayIndex = new Date(act.createdAt).getDay();
      study[dayIndex] += Number(act.studyHours || 0) + Number(act.workHours || 0);
      sleep[dayIndex] += Number(act.sleepHours || 0);
      physical[dayIndex] += Number(act.physicalActivity || 0);

      if (act.stressLevel !== undefined && act.stressLevel !== null) {
        stress[dayIndex] += Number(act.stressLevel);
        stressCounts[dayIndex]++;
      }
    });

    // Average the stress levels
    for (let i = 0; i < 7; i++) {
      if (stressCounts[i] > 0) {
        stress[i] = Math.round(stress[i] / stressCounts[i]);
      }
    }

    res.json({ labels, study, stress, sleep, physical });
  } catch (err) {
    res.status(500).json({ message: "Weekly analytics failed" });
  }
};

/* =========================
   ⚖️ Balance Score
========================= */
export const getBalanceScore = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30); // Take more to find 7 unique days

    if (!activities.length) {
      return res.json({ score: 0, label: "No Data" });
    }

    // Group by date
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

    // Get last 7 days
    const sortedDates = Object.keys(dailyData).sort().reverse().slice(0, 7);
    const count = sortedDates.length;

    let totalStudy = 0, totalSleep = 0, totalStress = 0, totalPhysical = 0;
    sortedDates.forEach(date => {
      const day = dailyData[date];
      totalStudy += day.study;
      totalSleep += day.sleep;
      totalPhysical += day.physical;
      totalStress += day.stressCount > 0 ? (day.stress / day.stressCount) : 5;
    });

    const avgStudy = totalStudy / count;
    const avgSleep = totalSleep / count;
    const avgStress = totalStress / count;
    const avgActivity = totalPhysical / count;

    let workScore = 0;
    if (avgStudy >= 6 && avgStudy <= 8) workScore += 100;
    else workScore += Math.max(0, 100 - Math.abs(avgStudy - 7) * 15);

    let lifeScore = 0;
    if (avgSleep >= 7 && avgSleep <= 8) lifeScore += 50;
    else lifeScore += Math.max(0, 50 - Math.abs(avgSleep - 7.5) * 10);

    lifeScore += Math.max(0, 30 - avgStress * 5); // Max 30 from stress
    lifeScore += Math.min(20, (avgActivity / 30) * 20); // Max 20 from physical activity

    workScore = Math.min(100, Math.round(workScore));
    lifeScore = Math.min(100, Math.round(lifeScore));

    let workLabel = "Good 👍";
    if (workScore < 40) workLabel = "Poor ⚠️";
    else if (workScore < 70) workLabel = "Average 🙂";

    let lifeLabel = "Good 👍";
    if (lifeScore < 40) lifeLabel = "Poor ⚠️";
    else if (lifeScore < 70) lifeLabel = "Average 🙂";

    // Legacy score for compatibility
    let score = Math.round((workScore + lifeScore) / 2);
    let label = lifeLabel;

    res.json({ score, label, workScore, workLabel, lifeScore, lifeLabel });
  } catch (err) {
    res.status(500).json({ message: "Balance score failed" });
  }
};
