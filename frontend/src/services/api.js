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
   GOAL APIs
========================= */
export const getGoals = () =>
  API.get("/goals");

export const createGoal = (data) =>
  API.post("/goals", data);

export const updateGoal = (id, data) =>
  API.put(`/goals/${id}`, data);

export const deleteGoal = (id) =>
  API.delete(`/goals/${id}`);

export default API;
