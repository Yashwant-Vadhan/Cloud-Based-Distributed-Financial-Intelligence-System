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

// Get last 12 months dynamically
export const getAllMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${year}-${month}`);
  }
  return months;
};