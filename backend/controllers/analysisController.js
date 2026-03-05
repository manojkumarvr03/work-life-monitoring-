import Activity from "../models/Activity.js";

/* =========================
   📊 Progress (ALL TIME)
========================= */
export const getProgress = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id });

    const totalLessons = activities.length;
    const totalHours = activities.reduce(
      (sum, act) => sum + Number(act.studyHours || 0),
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
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayActivity = await Activity.findOne({
      user: req.user.id,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    if (!todayActivity) {
      return res.json(null);
    }

    res.json(todayActivity);
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

    activities.forEach((act) => {
      const dayIndex = new Date(act.createdAt).getDay();
      study[dayIndex] += Number(act.studyHours || 0);
      stress[dayIndex] += Number(act.stressLevel || 0);
    });

    res.json({ labels, study, stress });
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
      .limit(7);

    if (!activities.length) {
      return res.json({ score: 0, label: "No Data" });
    }

    let study = 0,
      sleep = 0,
      stress = 0,
      activity = 0;

    activities.forEach((a) => {
      study += Number(a.studyHours || 0);
      sleep += Number(a.sleepHours || 0);
      stress += Number(a.stressLevel || 0);
      activity += Number(a.physicalActivity || 0);
    });

    const count = activities.length;
    const avgStudy = study / count;
    const avgSleep = sleep / count;
    const avgStress = stress / count;
    const avgActivity = activity / count;

    let score = 0;

    if (avgStudy >= 6 && avgStudy <= 8) score += 30;
    else score += Math.max(0, 30 - Math.abs(avgStudy - 7) * 5);

    if (avgSleep >= 7 && avgSleep <= 8) score += 30;
    else score += Math.max(0, 30 - Math.abs(avgSleep - 7.5) * 5);

    score += Math.max(0, 25 - avgStress * 4);
    score += Math.min(15, (avgActivity / 20) * 15);

    score = Math.min(100, Math.round(score));

    let label = "Good Balance 👍";
    if (score < 40) label = "Poor Balance ⚠️";
    else if (score < 70) label = "Average Balance 🙂";

    res.json({ score, label });
  } catch (err) {
    res.status(500).json({ message: "Balance score failed" });
  }
};
