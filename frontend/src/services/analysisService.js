import API from "./api";

export const getWeeklyAnalytics = () =>
  API.get("/analysis/weekly");
