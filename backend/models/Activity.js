import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    studyHours: Number,
    sleepHours: Number,
    physicalActivity: Number,
    stressLevel: Number
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
