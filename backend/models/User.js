import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { 
      type: String, 
      required: function() { return !this.googleId; } 
    },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["Student", "Employee"], default: "Student" },
    avatar: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
