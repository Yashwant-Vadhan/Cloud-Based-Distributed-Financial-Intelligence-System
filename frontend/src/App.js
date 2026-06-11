import { useState, useCallback } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Income from "./pages/Income";
import Predictions from "./pages/Predictions";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

import Login from "./components/Login";
import useInactivityLogout from "./utils/useInactivityLogout";

// 5 minutes of inactivity → auto logout
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

function App() {
  // ── Issue 3 Fix: Use sessionStorage instead of localStorage ──
  // sessionStorage is cleared automatically when the browser/tab is closed.
  // This means reopening the browser will always show the login page.
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem("isLoggedIn") === "true"
  );

  const [page, setPage] = useState("dashboard");
  const [expenses, setExpenses] = useState([]);

  // ── Centralised logout function ──────────────────────────────
  // Used by Navbar (manual logout), inactivity hook (auto logout), and
  // password reset (if needed). Clears ALL session data from sessionStorage.
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userProfile");
    sessionStorage.removeItem("isLoggedIn");
    localStorage.removeItem("monthlyData");
    localStorage.removeItem("userAccount");
    setIsLoggedIn(false);
  }, []);

  // ── Issue 2 Fix: 5-minute inactivity auto-logout ─────────────
  // Hook is always called (React rules), but disabled when not logged in
  // (timeoutMs = null). Tracks mouse, keyboard, click, scroll, touch events.
  useInactivityLogout(isLoggedIn ? INACTIVITY_TIMEOUT_MS : null, handleLogout);

  // ── Issue 3 Fix: Protected route gate ────────────────────────
  // If no valid session in sessionStorage → show Login page.
  // Typing the URL directly in the browser also hits this check.
  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div>
      {/* Pass handleLogout so Navbar and inactivity hook share the same logic */}
      <Navbar setPage={setPage} handleLogout={handleLogout} />

      <div className="flex">
        <Sidebar setPage={setPage} />

        <div className="flex-1">
          {page === "dashboard"   && <Dashboard expenses={expenses} />}
          {page === "expenses"    && <Expenses expenses={expenses} setExpenses={setExpenses} />}
          {page === "analytics"   && <Analytics expenses={expenses} />}
          {page === "income"      && <Income />}
          {page === "predictions" && <Predictions />}
          {page === "settings"    && <Settings />}
          {page === "profile"     && <Profile />}
        </div>
      </div>
    </div>
  );
}

export default App;