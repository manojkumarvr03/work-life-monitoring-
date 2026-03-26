import express from "express";
import { getAllUsers, getStats, deleteUser, updateUserRole, getUserPerformance } from "../controllers/adminController.js";
import authMiddleware, { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here are protected and admin-only
router.use(authMiddleware);
router.use(isAdmin);

router.get("/users", getAllUsers);
router.get("/stats", getStats);
router.get("/users/:id/performance", getUserPerformance);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", updateUserRole);

export default router;
