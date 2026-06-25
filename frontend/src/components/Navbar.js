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
    <div className="bg-gradient-to-r from-[var(--header-grad-from)] to-[var(--header-grad-to)] py-1 px-2 sm:py-1.5 sm:px-3 md:py-2 md:px-4 flex justify-between items-center shadow-md select-none z-10 border-b transition-colors" style={{ color: 'var(--header-text)', borderColor: 'var(--header-border)' }}>
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-shrink-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-1 rounded-lg focus:outline-none transition-colors flex-shrink-0"
          style={{ ':hover': { backgroundColor: 'var(--header-btn-hover)' } }}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* SFIS Full Logo + system name — click either to navigate to dashboard */}
        <div
          className="flex items-center gap-[10px] cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
          onClick={() => setPage("dashboard")}
        >
          <img
            src="/sfis-full-logo.png"
            alt="SFIS – Smart Financial Intelligence System"
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            className="sm:h-[60px] md:h-[70px] lg:h-[78px] max-w-[130px] sm:max-w-[190px] md:max-w-none select-none flex-shrink-0"
          />
          <span
            className="hidden md:inline text-[17px] lg:text-[19px] font-semibold leading-tight whitespace-nowrap select-none"
            style={{ color: 'var(--header-text)', fontWeight: 600 }}
          >
            Smart Financial<br />Intelligence System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
        <span className="hidden sm:inline backdrop-blur-sm border px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium text-[10px] sm:text-xs md:text-sm whitespace-nowrap" style={{ backgroundColor: 'var(--header-btn-bg)', borderColor: 'var(--header-border)', color: 'var(--header-text)' }}>
          {t("welcome")}, {username}
        </span>

        <button
          onClick={() => setPage("profile")}
          className="px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-semibold transition-all border flex-shrink-0 text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
          style={{ backgroundColor: 'var(--header-btn-bg)', borderColor: 'var(--header-border)', color: 'var(--header-text)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--header-btn-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--header-btn-bg)'}
        >
          {t("profile")}
        </button>

        {/* handleLogout is provided by App.js — clears sessionStorage + resets state */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-semibold transition-all border border-red-400 flex-shrink-0 text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
        >
          {t("logout")}
        </button>
      </div>
    </div>
  );
}

export default Navbar;