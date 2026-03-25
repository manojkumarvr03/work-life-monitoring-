export const API_URL = process.env.REACT_APP_API_URL || "https://work-life-monitoring-1.onrender.com";
console.log("API:", API_URL);

/* =========================
   HELPER FOR FETCH
========================= */
const request = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    const error = new Error(data.message || "API Request Failed");
    error.response = { data };
    throw error;
  }

  return { data }; // Maintain compatibility with existing axios-style response handling
};

const API = {
  get: (url) => request(url, "GET"),
  post: (url, data) => request(url, "POST", data),
  put: (url, data) => request(url, "PUT", data),
  patch: (url, data) => request(url, "PATCH", data),
  delete: (url) => request(url, "DELETE"),
};

/* =========================
   AUTH APIs
========================= */
export const loginUser = (data) => API.post("/api/auth/login", data);
export const registerUser = (data) => API.post("/api/auth/register", data);

/* =========================
   AUTH / PROFILE APIs
========================= */
export const getUserProfile = () => API.get("/api/auth/profile");
export const updateUserProfile = (data) => API.put("/api/auth/profile", data);
export const changePassword = (data) => API.put("/api/auth/change-password", data);

/* =========================
   ACTIVITY APIs
========================= */
export const addActivity = (data) => API.post("/api/activities", data);
export const getActivities = () => API.get("/api/activities");
export const getRecentActivities = () => API.get("/api/activities/recent");

/* =========================
   ANALYSIS APIs
========================= */
export const getProgress = () => API.get("/api/analysis/progress");
export const getTodayStatus = () => API.get("/api/analysis/today");
export const getWeeklyAnalytics = () => API.get("/api/analysis/weekly");
export const getBalanceScore = () => API.get("/api/analysis/balance");

/* =========================
   REPORT APIs
========================= */
export const getSummaryReport = () => API.get("/api/reports/summary");
export const getWeeklyReport = () => API.get("/api/reports/weekly");
export const getMonthlyReport = () => API.get("/api/reports/monthly");
export const getActivityDates = () => API.get("/api/reports/activity-dates");

/* =========================
   🧠 STUDY PLANNER APIs
========================= */
export const getPlannerSubjects = () => API.get("/api/planner/subjects");
export const addPlannerSubject = (data) => API.post("/api/planner/subjects", data);
export const deletePlannerSubject = (id) => API.delete(`/api/planner/subjects/${id}`);
export const generatePlannerPlan = (data) => API.post("/api/planner/generate", data);
export const getPlannerSessions = (date) => API.get(`/api/planner/sessions?date=${date}`);
export const getPlannerWeekSessions = () => API.get("/api/planner/sessions/week");
export const updatePlannerSessionStatus = (id, status) => API.patch(`/api/planner/sessions/${id}/status`, { status });
export const getPlannerProgress = () => API.get("/api/planner/progress");
export const getPlannerInsights = () => API.get("/api/planner/insights");

export default API;
