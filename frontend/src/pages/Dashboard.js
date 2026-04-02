import { useState, useEffect } from "react";
import { getMonth, formatMonth, getAllMonths } from "../utils/month";

function Dashboard({ expenses }) {

  const [income, setIncome] = useState(0);
  const [inputIncome, setInputIncome] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(getMonth());
  const [months, setMonths] = useState([]);

  // 🔥 NEW STATE (for correct expenses)
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);

  const month = selectedMonth;

  useEffect(() => {
    setMonths(getAllMonths());
  }, []);

  // 🔥 FIXED: Load BOTH income + expenses for selected month
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const monthData = data[month] || { income: 0, expenses: [] };

    setIncome(monthData.income || 0);
    setMonthlyExpenses(monthData.expenses || []);
  }, [month]);

  // 🔥 FIXED: use monthlyExpenses instead of props
  const totalExpenses = monthlyExpenses.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const savings = income - totalExpenses;

  const addIncome = () => {
    if (!inputIncome) return;

    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};

    data[month] = {
      ...(data[month] || {}),
      income: Number(inputIncome),
      expenses: data[month]?.expenses || []
    };

    localStorage.setItem("monthlyData", JSON.stringify(data));

    setIncome(Number(inputIncome));
    setInputIncome("");
    setMonths(getAllMonths());
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-3xl font-bold mb-4">Dashboard Overview</h2>

      {/* Month Selector */}
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="mb-6 p-2 rounded border"
      >
        {!months.includes(getMonth()) && (
          <option value={getMonth()}>
            {formatMonth(getMonth())}
          </option>
        )}

        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonth(m)}
          </option>
        ))}
      </select>

      {/* Income Input */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 w-1/3">

        <h3 className="text-lg font-semibold mb-2">
          Enter Monthly Income
        </h3>

        <div className="flex gap-3">
          <input
            value={inputIncome}
            onChange={(e) => setInputIncome(e.target.value)}
            placeholder="Enter income ₹"
            className="border p-2 rounded-lg w-full"
          />

          <button
            onClick={addIncome}
            className="bg-green-600 text-white px-4 rounded-lg"
          >
            Add
          </button>
        </div>

      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">₹{income}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-500">₹{totalExpenses}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Savings</h3>
          <p className="text-2xl font-bold text-blue-600">₹{savings}</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
;;;