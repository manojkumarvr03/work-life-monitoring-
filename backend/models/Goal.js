import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        targetDate: { type: Date },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        completed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
