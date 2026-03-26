import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const adminEmail = "admin@wx.com";
    const adminPassword = "admin123";

    let admin = await User.findOne({ email: adminEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    if (admin) {
      console.log("Admin user already exists. Updating role and password...");
      admin.role = "Admin";
      admin.password = hashedPassword;
      await admin.save();
      console.log("Admin user updated successfully.");
    } else {
      console.log("Creating new admin user...");
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "Admin"
      });
      console.log("Admin user created successfully.");
    }

    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();
