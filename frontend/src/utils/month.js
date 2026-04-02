export const getMonth = () => {
  return new Date().toISOString().slice(0, 7);
};

// "2026-04" → "April 2026"
export const formatMonth = (monthStr) => {
  const date = new Date(monthStr + "-01");
  return date.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });
};

// Get all stored months
export const getAllMonths = () => {
  const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
  return Object.keys(data).sort().reverse();
};