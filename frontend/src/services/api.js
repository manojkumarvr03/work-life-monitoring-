import axios from "axios";

/* =========================
   AXIOS INSTANCE
========================= */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   🔐 ATTACH JWT TOKEN
========================= */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   ⚠️ GLOBAL ERROR HANDLING
========================= */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Unauthorized – logging out");
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    if (status === 404) {
      console.error("API endpoint not found:", error.config.url);
    }

    if (status >= 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

/* =========================
   AUTH APIs
========================= */
export const loginUser = (data) =>
  API.post("/auth/login", data);

export const registerUser = (data) =>
  API.post("/auth/register", data);

/* =========================
   AUTH / PROFILE APIs
========================= */
export const getUserProfile = () => API.get("/auth/profile");

export const updateUserProfile = (data) =>
  API.put("/auth/profile", data);

export const changePassword = (data) =>
  API.put("/auth/change-password", data);

/* =========================
   ACTIVITY APIs
========================= */
export const addActivity = (data) =>
  API.post("/activities", data);

export const getActivities = () =>
  API.get("/activities");

export const getRecentActivities = () =>
  API.get("/activities/recent");

/* =========================
   ANALYSIS APIs
========================= */
export const getProgress = () =>
  API.get("/analysis/progress");

export const getTodayStatus = () =>
  API.get("/analysis/today");

export const getWeeklyAnalytics = () =>
  API.get("/analysis/weekly");

export const getBalanceScore = () =>
  API.get("/analysis/balance");

/* =========================
   REPORT APIs
========================= */
export const getSummaryReport = () =>
  API.get("/reports/summary");

export const getWeeklyReport = () =>
  API.get("/reports/weekly");

export const getMonthlyReport = () =>
  API.get("/reports/monthly");

export const getActivityDates = () =>
  API.get("/reports/activity-dates");



/* =========================
   🧠 STUDY PLANNER APIs
========================= */
export const getPlannerSubjects = () =>
  API.get("/planner/subjects");

export const addPlannerSubject = (data) =>
  API.post("/planner/subjects", data);

export const deletePlannerSubject = (id) =>
  API.delete(`/planner/subjects/${id}`);

export const generatePlannerPlan = (data) =>
  API.post("/planner/generate", data);

export const getPlannerSessions = (date) =>
  API.get(`/planner/sessions?date=${date}`);

export const getPlannerWeekSessions = () =>
  API.get("/planner/sessions/week");

export const updatePlannerSessionStatus = (id, status) =>
  API.patch(`/planner/sessions/${id}/status`, { status });

export const getPlannerProgress = () =>
  API.get("/planner/progress");

export const getPlannerInsights = () =>
  API.get("/planner/insights");

export default API;
