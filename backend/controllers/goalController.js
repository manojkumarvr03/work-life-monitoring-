import Goal from "../models/Goal.js";

// GET all goals for logged-in user
export const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch goals" });
    }
};

// POST create a new goal
export const createGoal = async (req, res) => {
    try {
        const { title, description, targetDate } = req.body;
        if (!title) return res.status(400).json({ message: "Goal title is required" });
        const goal = await Goal.create({
            user: req.user.id,
            title,
            description,
            targetDate,
        });
        res.status(201).json(goal);
    } catch (err) {
        res.status(500).json({ message: "Failed to create goal" });
    }
};

// PUT update goal progress / completion
export const updateGoal = async (req, res) => {
    try {
        const { progress, completed, title, description, targetDate } = req.body;
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
        if (!goal) return res.status(404).json({ message: "Goal not found" });

        if (progress !== undefined) goal.progress = Math.min(100, Math.max(0, progress));
        if (completed !== undefined) goal.completed = completed;
        if (title) goal.title = title;
        if (description !== undefined) goal.description = description;
        if (targetDate) goal.targetDate = targetDate;

        await goal.save();
        res.json(goal);
    } catch (err) {
        res.status(500).json({ message: "Failed to update goal" });
    }
};

// DELETE a goal
export const deleteGoal = async (req, res) => {
    try {
        await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        res.json({ message: "Goal deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete goal" });
    }
};
