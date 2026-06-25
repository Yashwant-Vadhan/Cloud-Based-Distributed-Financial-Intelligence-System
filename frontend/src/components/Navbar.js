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
    <div className="bg-gradient-to-r from-[var(--header-grad-from)] to-[var(--header-grad-to)] p-2 sm:p-3 md:p-4 flex justify-between items-center shadow-md select-none z-10 border-b transition-colors" style={{ color: 'var(--header-text)', borderColor: 'var(--header-border)' }}>
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-1 rounded-lg focus:outline-none transition-colors"
          style={{ ':hover': { backgroundColor: 'var(--header-btn-hover)' } }}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <h1 
          onClick={() => setPage("dashboard")}
          className="text-[15px] sm:text-lg md:text-2xl font-bold truncate max-w-[100px] min-[360px]:max-w-[125px] min-[400px]:max-w-[160px] sm:max-w-xs md:max-w-none cursor-pointer hover:opacity-95"
        >
          {t("intelligenceEngine")}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 text-[10px] min-[360px]:text-xs md:text-sm flex-shrink-0">
        <span className="hidden sm:inline backdrop-blur-sm border px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium" style={{ backgroundColor: 'var(--header-btn-bg)', borderColor: 'var(--header-border)', color: 'var(--header-text)' }}>
          {t("welcome")}, {username}
        </span>

        <button
          onClick={() => setPage("profile")}
          className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-semibold sm:font-medium transition-all border flex-shrink-0"
          style={{ backgroundColor: 'var(--header-btn-bg)', borderColor: 'var(--header-border)', color: 'var(--header-text)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--header-btn-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--header-btn-bg)'}
        >
          {t("profile")}
        </button>

        {/* handleLogout is provided by App.js — clears sessionStorage + resets state */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-semibold sm:font-medium transition-all border border-red-400 flex-shrink-0"
        >
          {t("logout")}
        </button>
      </div>
    </div>
  );
}

export default Navbar;