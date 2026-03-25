import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    studyHours: Number,
    workHours: Number,
    activityType: String,
    subjectsCount: Number,
    classesAttended: Number,
    sleepHours: Number,
    physicalActivity: Number,
    stressLevel: Number,
    waterLiters: Number,
    foodProtein: String
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
