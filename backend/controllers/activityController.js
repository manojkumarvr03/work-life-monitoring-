import Activity from "../models/Activity.js";

/* ===============================
   ADD ACTIVITY
================================ */
export const addActivity = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("USER:", req.user);

    const activity = await Activity.create({
      user: req.user.id, // ✅ correct
      activityType: req.body.activityType || "Study",
      studyHours: req.body.studyHours || 0,
      workHours: req.body.workHours || 0,
      subjectsCount: req.body.subjectsCount || 0,
      classesAttended: req.body.classesAttended || 0,
      sleepHours: req.body.sleepHours || 0,
      physicalActivity: req.body.physicalActivity || 0,
      stressLevel: req.body.stressLevel || 0,
      waterLiters: req.body.waterLiters || 0,
      foodProtein: req.body.foodProtein || ""
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Activity not saved" });
  }
};

/* ===============================
   GET ALL ACTIVITIES (PROFILE)
================================ */
export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch failed" });
  }
};

/* ===============================
   GET LAST 2 ACTIVITIES (TRACKER)
================================ */
export const getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(2);

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Recent fetch failed" });
  }
};

/* ===============================
   DELETE ACTIVITY
================================ */
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    // Ensure the activity belongs to the authenticated user
    if (activity.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: "Activity deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};
