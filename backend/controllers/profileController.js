import Activity from "../models/Activity.js";

export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    const activities = await Activity.find({ user: user._id })
      .sort({ createdAt: -1 });

    // ---- CALCULATIONS ----
    const studyHours = activities.reduce(
      (sum, a) => sum + (a.studyHours || 0),
      0
    );

    const tasksCompleted = activities.length;

    const avgSleep = activities.length
      ? Math.round(
          activities.reduce(
            (sum, a) => sum + (a.sleepHours || 0),
            0
          ) / activities.length
        )
      : 0;

    res.json({
      user,
      stats: {
        studyHours,
        tasksCompleted,
        avgSleep
      },
      activities
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile fetch failed" });
  }
};
