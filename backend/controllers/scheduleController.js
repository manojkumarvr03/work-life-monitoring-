import Schedule from "../models/Schedule.js";

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
export const getSchedules = async (req, res) => {
    try {
        const { date } = req.query; // optional filtering by date

        let query = { user: req.user._id };
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);

            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const schedules = await Schedule.find(query).sort({ date: 1, startTime: 1 });
        res.status(200).json({ success: true, count: schedules.length, data: schedules });
    } catch (error) {
        console.error("Error fetching schedules:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Create a schedule
// @route   POST /api/schedules
// @access  Private
export const createSchedule = async (req, res) => {
    try {
        const { title, type, date, startTime, endTime, description } = req.body;

        if (!title || !date || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: "Please provide title, date, startTime, and endTime" });
        }

        const schedule = await Schedule.create({
            user: req.user._id,
            title,
            type: type || "personal",
            date,
            startTime,
            endTime,
            description
        });

        res.status(201).json({ success: true, data: schedule });
    } catch (error) {
        console.error("Error creating schedule:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Update a schedule
// @route   PUT /api/schedules/:id
// @access  Private
export const updateSchedule = async (req, res) => {
    try {
        let schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule item not found" });
        }

        // Make sure user owns schedule
        if (schedule.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized to update this item" });
        }

        // Logic for completedAt
        if (req.body.completed !== undefined) {
            if (req.body.completed === true && !schedule.completed) {
                req.body.completedAt = new Date();
            } else if (req.body.completed === false) {
                req.body.completedAt = null;
            }
        }

        schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: schedule });
    } catch (error) {
        console.error("Error updating schedule:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Delete a schedule
// @route   DELETE /api/schedules/:id
// @access  Private
export const deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule item not found" });
        }

        // Make sure user owns schedule
        if (schedule.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized to delete this item" });
        }

        await schedule.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
