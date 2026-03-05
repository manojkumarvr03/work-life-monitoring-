import User from "../models/User.js";
import bcrypt from "bcryptjs";


// ✅ CREATE USER (Admin creates normal user)
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const userId = "USR-" + Math.floor(1000 + Math.random() * 9000);

    const user = await User.create({
      userId,
      name,
      email,
      password: hashed,
      role: "user"   // 🔥 FORCE ROLE TO USER
    });

    res.json({
      message: "User created successfully",
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ GET ONLY NORMAL USERS (NOT ADMIN)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })  // 🔥 FILTER
      .select("-password");

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
