import express from "express";
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from "../controllers/scheduleController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All schedule routes require authentication

router.route("/")
    .get(getSchedules)
    .post(createSchedule);

router.route("/:id")
    .put(updateSchedule)
    .delete(deleteSchedule);

export default router;
