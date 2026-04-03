import { useState, useEffect } from "react";
import { getMonth, formatMonth, getAllMonths } from "../utils/month";

function Dashboard() {
  const [income, setIncome] = useState(0);
  const [inputIncome, setInputIncome] = useState("");
  const [incomeSource, setIncomeSource] = useState("Salary");
  const [customSource, setCustomSource] = useState(""); // State for custom input
  const [incomeHistory, setIncomeHistory] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(getMonth());
  const [months, setMonths] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);

  const AUTH_API = process.env.REACT_APP_AUTH_URL;
  const month = selectedMonth;

  useEffect(() => {
    setMonths(getAllMonths());
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await fetch(`${AUTH_API}/api/dashboard/${month}`);
        const data = await response.json();
        setIncome(data.income);
        setIncomeHistory(data.incomeHistory);
      } catch (err) {
        const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
        const monthData = data[month] || { income: 0, expenses: [], incomeHistory: [] };
        setIncome(monthData.income || 0);
        setIncomeHistory(monthData.incomeHistory || []);
        setMonthlyExpenses(monthData.expenses || []);
      }
    };
    loadDashboardData();
  }, [month, AUTH_API]);

  const totalExpenses = monthlyExpenses.reduce((total, item) => total + Number(item.amount), 0);
  const savings = income - totalExpenses;

  const handleAddIncome = async () => {
    if (!inputIncome || isNaN(inputIncome)) return;
    
    // Determine the final source name
    const finalSource = incomeSource === "Other" ? (customSource || "Other") : incomeSource;

    const newAmount = Number(inputIncome);
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      source: finalSource,
      amount: newAmount
    };

    try {
      await fetch(`${AUTH_API}/api/income`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEntry, month }),
      });
    } catch (err) {
      console.log("Sync failed");
    }

    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const currentMonthData = data[month] || { income: 0, expenses: [], incomeHistory: [] };
    const updatedTotalIncome = (currentMonthData.income || 0) + newAmount;
    const updatedHistory = [...(currentMonthData.incomeHistory || []), newEntry];

    data[month] = { ...currentMonthData, income: updatedTotalIncome, incomeHistory: updatedHistory };
    localStorage.setItem("monthlyData", JSON.stringify(data));

    setIncome(updatedTotalIncome);
    setIncomeHistory(updatedHistory);
    setInputIncome("");
    setCustomSource(""); // Reset custom source
  };

  const deleteIncome = async (id) => {
    try {
      await fetch(`${AUTH_API}/api/income/${id}`, { method: "DELETE" });
    } catch (err) {
      console.log("Delete failed");
    }
    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const currentMonthData = data[month];
    const entryToDelete = currentMonthData.incomeHistory.find(item => item.id === id);
    if (!entryToDelete) return;

    const updatedHistory = currentMonthData.incomeHistory.filter(item => item.id !== id);
    const updatedTotalIncome = currentMonthData.income - entryToDelete.amount;

    data[month] = { ...currentMonthData, income: updatedTotalIncome, incomeHistory: updatedHistory };
    localStorage.setItem("monthlyData", JSON.stringify(data));

    setIncome(updatedTotalIncome);
    setIncomeHistory(updatedHistory);
  };

  return (
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto">
      <h2 className="text-3xl font-bold mb-4">Dashboard Overview</h2>

      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="mb-6 p-2 rounded border"
      >
        {months.map((m) => (
          <option key={m} value={m}>{formatMonth(m)}</option>
        ))}
      </select>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 w-full lg:w-3/4">
        <h3 className="text-lg font-semibold mb-2">Add Income Source</h3>
        <div className="flex flex-wrap gap-3">
          <input
            type="number"
            value={inputIncome}
            onChange={(e) => setInputIncome(e.target.value)}
            placeholder="Amount ₹"
            className="border p-2 rounded-lg flex-1 min-w-[120px]"
          />
          
          <select 
            value={incomeSource}
            onChange={(e) => setIncomeSource(e.target.value)}
            className="border p-2 rounded-lg bg-white"
          >
            <option value="Salary">Salary</option>
            <option value="Gift">Gift</option>
            <option value="Loan">Loan</option>
            <option value="Freelance">Freelance</option>
            <option value="Investment">Investment</option>
            <option value="Other">Other</option>
          </select>

          {/* NEW: Custom source input appears only when "Other" is selected */}
          {incomeSource === "Other" && (
            <input
              type="text"
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              placeholder="Specify Type (e.g. Bonus)"
              className="border p-2 rounded-lg flex-1 min-w-[150px]"
            />
          )}

          <button onClick={handleAddIncome} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500">
          <h3 className="text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">₹{income}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-red-500">
          <h3 className="text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-500">₹{totalExpenses}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-blue-500">
          <h3 className="text-gray-500">Savings</h3>
          <p className="text-2xl font-bold text-blue-600">₹{savings}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">Income Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {incomeHistory.length > 0 ? (
                incomeHistory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{item.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                        {item.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                      +₹{item.amount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => deleteIncome(item.id)}
                        className="text-red-500 hover:text-red-700 font-bold px-2 py-1 transition-colors"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-400 italic">
                    No income records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
}

export default Dashboard;