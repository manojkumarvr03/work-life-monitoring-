export const getTodayKey = () => {
  const d = new Date();
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
};
