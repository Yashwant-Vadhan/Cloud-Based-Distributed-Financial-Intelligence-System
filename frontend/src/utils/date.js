export const getMonth = () => {
  return new Date().toISOString().slice(0, 7); // "2026-04"
};