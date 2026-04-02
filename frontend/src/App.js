import { useState } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Predictions from "./pages/Predictions";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

import Login from "./components/Login";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [page, setPage] = useState("dashboard");
  const [expenses, setExpenses] = useState([]);

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div>

      <Navbar setPage={setPage} setIsLoggedIn={setIsLoggedIn} />

      <div className="flex">
        <Sidebar setPage={setPage} />

        <div className="flex-1">
          {page === "dashboard" && <Dashboard expenses={expenses} />}
          {page === "expenses" && (
            <Expenses expenses={expenses} setExpenses={setExpenses} />
          )}
          {page === "analytics" && <Analytics expenses={expenses} />}
          {page === "predictions" && <Predictions />}
          {page === "settings" && <Settings />}
          {page === "profile" && <Profile />}
        </div>
      </div>

    </div>
  );
}

export default App;