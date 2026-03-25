import API from "./api";

export const getWeeklyAnalytics = () =>
  API.get("/api/analysis/weekly");
