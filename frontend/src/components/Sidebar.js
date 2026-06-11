import { useLanguage, useTheme } from "../utils/AppContext";

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — fully theme-aware, uses CSS variable inline styles
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ setPage, isOpen, setIsOpen }) {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const handleItemClick = (pageName) => {
    setPage(pageName);
    if (setIsOpen) {
      setIsOpen(false); // Close sidebar drawer on mobile
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        borderRightColor: "var(--border-color)",
        boxShadow: "var(--card-shadow)",
      }}
      className={`text-[color:var(--text-primary)] h-screen w-60 p-6 fixed md:sticky top-0 left-0 z-30 transition-all duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 border-r flex flex-col select-none`}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6">
        <h2
          style={{ color: "var(--text-primary)" }}
          className="text-xl font-bold tracking-wide"
        >
          Menu
        </h2>
        {/* Close Button on Mobile */}
        <button
          onClick={() => setIsOpen(false)}
          style={{ color: "var(--text-secondary)" }}
          className="md:hidden p-1 rounded-lg transition-colors hover:opacity-80"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Nav Items ─────────────────────────────────────────── */}
      <ul className="space-y-1.5 flex-1">
        {[
          { id: "dashboard",   label: t("dashboard"),   icon: "📊" },
          { id: "expenses",    label: t("expenses"),     icon: "💸" },
          { id: "income",      label: t("income"),       icon: "💰" },
          { id: "analytics",   label: t("analytics"),    icon: "📈" },
          { id: "predictions", label: t("predictions"),  icon: "🤖" },
          { id: "settings",    label: t("settings"),     icon: "⚙️" },
        ].map((item) => (
          <li
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            style={{ color: "var(--text-secondary)" }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all font-medium text-sm hover-theme"
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "var(--hover-bg)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      {/* ── Theme indicator dot at bottom ─────────────────────── */}
      <div
        style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        className="mt-4 pt-3 border-t flex items-center gap-2 text-xs"
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        <span className="truncate capitalize">{theme} theme</span>
      </div>
    </div>
  );
}

export default Sidebar;