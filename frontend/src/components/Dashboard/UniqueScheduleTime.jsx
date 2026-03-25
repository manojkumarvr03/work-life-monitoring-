import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import "../../styles/unique_time.css";

const UniqueScheduleTime = () => {
  const [time, setTime] = useState(new Date());
  const [nextEvent, setNextEvent] = useState(null);
  const [nextPlanner, setNextPlanner] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchNextEvents = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [scheduleRes, plannerRes] = await Promise.all([
        API.get(`/api/schedules?date=${today}`),
        API.get(`/api/planner/sessions?date=${today}`)
      ]);

      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTimeTotal = currentH * 60 + currentM;

      // Find next schedule event
      const schedules = scheduleRes.data.data || [];
      const upcomingSchedule = schedules
        .filter(s => {
          const [h, m] = s.startTime.split(':').map(Number);
          return (h * 60 + m) > currentTimeTotal && !s.completed;
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

      setNextEvent(upcomingSchedule);

      // Find next planner session
      const sessions = plannerRes.data || [];
      const upcomingPlanner = sessions
        .filter(s => {
          const [h, m] = s.startTime.split(':').map(Number);
          return (h * 60 + m) > currentTimeTotal && s.status === "pending";
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

      setNextPlanner(upcomingPlanner);
    } catch (err) {
      console.error("Failed to fetch upcoming events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNextEvents();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNextEvents, 300000);
    return () => clearInterval(interval);
  }, [fetchNextEvents]);

  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dateStr = time.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div 
      className="unique-schedule-widget"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="unique-badge">Unice & New</div>
      
      <div className="unique-time-section">
        <div className="unique-time-now">{timeStr}</div>
        <div className="unique-date-now">{dateStr}</div>
      </div>

      <div className="unique-event-section">
        {nextPlanner && (
          <div className="unique-event-card">
            <span className="unique-event-label">Next Study Session</span>
            <span className="unique-event-title">{nextPlanner.subjectName}</span>
            <span className="unique-event-time">Starts at {nextPlanner.startTime}</span>
          </div>
        )}

        {nextEvent && (
          <div className="unique-event-card">
            <span className="unique-event-label">Upcoming Event</span>
            <span className="unique-event-title">{nextEvent.title}</span>
            <span className="unique-event-time">At {nextEvent.startTime}</span>
          </div>
        )}

        {!nextPlanner && !nextEvent && !loading && (
          <div className="unique-event-card" style={{ borderStyle: 'dashed', opacity: 0.6 }}>
            <span className="unique-event-label">Your Schedule</span>
            <span className="unique-event-title">All clear for now!</span>
            <span className="unique-event-time">Enjoy your break ✨</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UniqueScheduleTime;
