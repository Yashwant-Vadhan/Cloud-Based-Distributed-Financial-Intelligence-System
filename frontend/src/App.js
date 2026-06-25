import { useState, useCallback, useEffect } from "react";

import { AppContextProvider } from "./utils/AppContext";

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

const AUTH_URL = process.env.REACT_APP_AUTH_URL;

function App() {
  // ── Auth state ────────────────────────────────────────────────
  // null  = still verifying with server (show loading spinner)
  // false = not logged in (show Login page)
  // true  = token verified by server (show dashboard)
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const [page, setPage] = useState("dashboard");
  const [expenses, setExpenses] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Server-side token verification on every page load ─────────
  // This is the key fix: even if the browser restores sessionStorage
  // (via "restore session" or any other mechanism), we ALWAYS ask
  // the server "is this token still valid?". If the server says NO
  // (expired, invalid, missing), we force the user to login again.
  useEffect(() => {
    const verifySession = async () => {
      // Helper to check cookie
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      };

      let token = sessionStorage.getItem("token");
      const staySignedIn = localStorage.getItem("staySignedIn") === "true";
      const sessionActive = getCookie("sessionActive") === "true";

      // If sessionStorage is empty, but we have a valid session (either staySignedIn or sessionActive)
      if (!token && (staySignedIn || sessionActive)) {
        const localToken = localStorage.getItem("token");
        const localProfile = localStorage.getItem("userProfile");
        if (localToken) {
          token = localToken;
          sessionStorage.setItem("token", localToken);
          if (localProfile) {
            sessionStorage.setItem("userProfile", localProfile);
          }
          sessionStorage.setItem("isLoggedIn", "true");
        }
      }

      // If staySignedIn is false AND sessionActive is false, clear localStorage credentials if any
      if (!staySignedIn && !sessionActive) {
        localStorage.removeItem("token");
        localStorage.removeItem("userProfile");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("staySignedIn");
      }

      // No token at all → go to login immediately
      if (!token) {
        sessionStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await fetch(`${AUTH_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          // Token is valid — keep the session active
          sessionStorage.setItem("isLoggedIn", "true");
          setIsLoggedIn(true);
        } else {
          // Token rejected by server (expired, tampered, etc.)
          // Clear everything and show login
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("userProfile");
          sessionStorage.removeItem("isLoggedIn");
          localStorage.removeItem("token");
          localStorage.removeItem("userProfile");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("staySignedIn");
          document.cookie = "sessionActive=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          setIsLoggedIn(false);
        }
      } catch (err) {
        // Network error — can't verify; be safe and require login
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userProfile");
        sessionStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("userProfile");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("staySignedIn");
        document.cookie = "sessionActive=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        setIsLoggedIn(false);
      }
    };

    verifySession();
  }, []); // runs exactly once on page load

  // ── Centralised logout function ──────────────────────────────
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userProfile");
    sessionStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("staySignedIn");
    localStorage.removeItem("monthlyData");
    localStorage.removeItem("userAccount");
    // Clear session cookie
    document.cookie = "sessionActive=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    setIsLoggedIn(false);
  }, []);

  // ── Issue 2 Fix: 5-minute inactivity auto-logout (disabled if staySignedIn is enabled)
  const isStaySignedIn = localStorage.getItem("staySignedIn") === "true";
  useInactivityLogout(isLoggedIn && !isStaySignedIn ? INACTIVITY_TIMEOUT_MS : null, handleLogout);

  // ── Loading state — while verifying token with server ─────────
  if (isLoggedIn === null) {
    return (
      <AppContextProvider>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: "#f3f4f6",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Verifying session…</p>
        </div>
      </AppContextProvider>
    );
  }

  // ── Not logged in → show Login page ──────────────────────────
  if (!isLoggedIn) {
    return (
      <AppContextProvider>
        <Login setIsLoggedIn={setIsLoggedIn} />
      </AppContextProvider>
    );
  }

  // ── Logged in → show app ──────────────────────────────────────
  return (
    <AppContextProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar 
          setPage={setPage} 
          handleLogout={handleLogout} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        <div className="flex flex-1 relative">
          {/* Sidebar Backdrop Overlay on mobile */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300"
            />
          )}

          <Sidebar 
            setPage={setPage} 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen} 
          />

          <div className="flex-1 min-w-0">
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
    </AppContextProvider>
  );
}

export default App;