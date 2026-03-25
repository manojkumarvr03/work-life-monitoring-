import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ["class", "assignment", "break", "personal"],
            default: "personal"
        },
        date: { type: Date, required: true },
        startTime: { type: String, required: true }, // e.g., "09:00"
        endTime: { type: String, required: true },   // e.g., "10:30"
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        description: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("Schedule", scheduleSchema);
