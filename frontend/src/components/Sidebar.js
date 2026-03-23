function Sidebar() {
  return (
    <div className="bg-gray-900 text-white h-screen w-60 p-6">
      <h2 className="text-xl font-bold mb-6">Menu</h2>

      <ul className="space-y-4">
        <li className="hover:text-blue-400 cursor-pointer">Dashboard</li>
        <li className="hover:text-blue-400 cursor-pointer">Expenses</li>
        <li className="hover:text-blue-400 cursor-pointer">Analytics</li>
        <li className="hover:text-blue-400 cursor-pointer">Predictions</li>
        <li className="hover:text-blue-400 cursor-pointer">Settings</li>
      </ul>
    </div>
  );
}

export default Sidebar;
