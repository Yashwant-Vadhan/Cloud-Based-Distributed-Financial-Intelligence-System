function Sidebar({ setPage, isOpen, setIsOpen }) {
  const handleItemClick = (pageName) => {
    setPage(pageName);
    if (setIsOpen) {
      setIsOpen(false); // Close sidebar drawer on mobile
    }
  };

  return (
    <div
      className={`bg-gray-900 text-white h-screen w-60 p-6 fixed md:sticky top-0 left-0 z-30 transition-transform duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 border-r border-gray-800 flex flex-col select-none`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-wide text-gray-100">Menu</h2>
        {/* Close Button on Mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <ul className="space-y-1.5 flex-1">
        {[
          { id: "dashboard", label: "Dashboard", icon: "📊" },
          { id: "expenses", label: "Expenses", icon: "💸" },
          { id: "income", label: "Income", icon: "💰" },
          { id: "analytics", label: "Analytics", icon: "📈" },
          { id: "predictions", label: "Predictions", icon: "🤖" },
          { id: "settings", label: "Settings", icon: "⚙️" },
        ].map((item) => (
          <li
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 cursor-pointer transition-all text-gray-300 hover:text-white font-medium text-sm"
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;