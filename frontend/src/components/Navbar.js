function Navbar() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 shadow-lg flex justify-between">
      <h1 className="text-2xl font-bold">Financial Intelligence Dashboard</h1>
      <div className="flex gap-4">
        <button className="bg-white text-blue-600 px-4 py-1 rounded-lg font-semibold">
          Profile
        </button>
        <button className="bg-red-500 px-4 py-1 rounded-lg">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;