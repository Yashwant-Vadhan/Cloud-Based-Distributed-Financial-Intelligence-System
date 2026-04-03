function Sidebar({ setPage }) {
  return (
    <div className="bg-gray-900 text-white h-screen w-60 p-6">

      <h2 className="text-xl font-bold mb-6">Menu</h2>

      <ul className="space-y-4">

        <li onClick={() => setPage("dashboard")} className="hover:text-blue-400 cursor-pointer">
          Dashboard
        </li>

        <li onClick={() => setPage("expenses")} className="hover:text-blue-400 cursor-pointer">
          Expenses
        </li>

        <li onClick={() => setPage("analytics")} className="hover:text-blue-400 cursor-pointer">
          Analytics
        </li>

        <li onClick={() => setPage("predictions")} className="hover:text-blue-400 cursor-pointer">
          Predictions
        </li>

        <li onClick={() => setPage("settings")} className="hover:text-blue-400 cursor-pointer">
          Settings
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;