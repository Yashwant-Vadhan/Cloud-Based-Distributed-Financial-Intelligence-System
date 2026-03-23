import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div>
      <Navbar />

      <div className="flex">
        <Sidebar />
        <Dashboard />
      </div>

    </div>
  );
}

export default App;