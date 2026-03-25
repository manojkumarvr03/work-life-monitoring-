import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Student", "Employee"], default: "Student" },
    avatar: { type: String, default: "" } // 👈 ADD THIS
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
