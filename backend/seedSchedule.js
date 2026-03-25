import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Schedule from './models/Schedule.js';
import User from './models/User.js';

dotenv.config();

const seedSchedules = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find first user
    const user = await User.findOne();
    if (!user) {
      console.log('No user found to seed schedules for.');
      process.exit();
    }

    const today = new Date();
    
    const newItems = [
      {
        user: user._id,
        title: "Unique Design Review",
        type: "class",
        date: today,
        startTime: "21:30",
        endTime: "22:30",
        description: "Reviewing the new and unique UI/UX designs."
      },
      {
        user: user._id,
        title: "Late Night Focus Session",
        type: "personal",
        date: today,
        startTime: "23:00",
        endTime: "23:59",
        description: "Deep work session for core features."
      }
    ];

    await Schedule.deleteMany({ user: user._id, title: { $in: newItems.map(i => i.title) } });
    await Schedule.insertMany(newItems);

    console.log('Unique and New Schedules seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding schedules:', error);
    process.exit(1);
  }
};

seedSchedules();
