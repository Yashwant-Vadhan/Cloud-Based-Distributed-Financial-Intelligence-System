// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// Fix: Reads userProfile from sessionStorage (not localStorage).
//      Accepts handleLogout as a prop from App.js so manual logout and
//      inactivity-timeout logout share exactly the same cleanup logic.
// ─────────────────────────────────────────────────────────────────────────────
import { useLanguage } from "../utils/AppContext";

function Navbar({ setPage, handleLogout, toggleSidebar }) {
  const { t } = useLanguage();
  // Read profile from sessionStorage — cleared automatically on browser close
  const profile = JSON.parse(sessionStorage.getItem("userProfile"));
  const username = profile?.username || "User";

  return (
    <div className="bg-gradient-to-r from-[var(--header-grad-from)] to-[var(--header-grad-to)] text-white p-3 md:p-4 flex justify-between items-center shadow-md select-none z-10 border-b border-white/10">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-1 hover:bg-white/10 rounded-lg focus:outline-none transition-colors"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <h1 
          onClick={() => setPage("dashboard")}
          className="text-lg md:text-2xl font-bold truncate max-w-[170px] sm:max-w-xs md:max-w-none cursor-pointer hover:opacity-95 text-white"
        >
          {t("intelligenceEngine")}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
        <span className="hidden sm:inline bg-white/10 backdrop-blur-sm text-white border border-white/20 px-3 py-1.5 rounded-lg font-medium">
          {t("welcome")}, {username}
        </span>

        <button
          onClick={() => setPage("profile")}
          className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-3 py-1.5 rounded-lg font-medium transition-all"
        >
          {t("profile")}
        </button>

        {/* handleLogout is provided by App.js — clears sessionStorage + resets state */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-all"
        >
          {t("logout")}
        </button>
      </div>
    </div>
  );
}

export default Navbar;