// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// Fix: Reads userProfile from sessionStorage (not localStorage).
//      Accepts handleLogout as a prop from App.js so manual logout and
//      inactivity-timeout logout share exactly the same cleanup logic.
// ─────────────────────────────────────────────────────────────────────────────
function Navbar({ setPage, handleLogout }) {
  // Read profile from sessionStorage — cleared automatically on browser close
  const profile = JSON.parse(sessionStorage.getItem("userProfile"));
  const username = profile?.username || "User";

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 flex justify-between">
      <h1 className="text-2xl font-bold">
        Financial Intelligence Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <span className="bg-white text-blue-600 px-4 py-1 rounded-lg">
          Welcome, {username}
        </span>

        <button
          onClick={() => setPage("profile")}
          className="bg-white text-blue-600 px-4 py-1 rounded-lg"
        >
          Profile
        </button>

        {/* handleLogout is provided by App.js — clears sessionStorage + resets state */}
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-1 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;