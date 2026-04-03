import { useEffect, useState } from "react";
import { getMonth, formatMonth, getAllMonths } from "../utils/month";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";

function Analytics() {

  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(getMonth());
  const [months, setMonths] = useState([]);

  const month = selectedMonth;

  // Load available months
  useEffect(() => {
    setMonths(getAllMonths());
  }, []);

  // Load selected month data
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const monthData = data[month] || { income: 0, expenses: [] };

    setIncome(monthData.income || 0);
    setExpenses(monthData.expenses || []);
  }, [month]);

  // Calculations
  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const savings = income - totalExpenses;

  // PIE CHART
  const pieData = [
    { name: "Expenses", value: totalExpenses },
    { name: "Savings", value: savings > 0 ? savings : 0 }
  ];

  const COLORS = ["#ef4444", "#22c55e"];

  // CATEGORY BAR CHART
  const categoryMap = {};
  expenses.forEach((e) => {
    categoryMap[e.category] =
      (categoryMap[e.category] || 0) + Number(e.amount);
  });

  const categoryData = Object.keys(categoryMap).map((key) => ({
    name: key,
    amount: categoryMap[key]
  }));

  // LINE TREND CHART
  const trendMap = {};
  expenses.forEach((e) => {
    trendMap[e.date] =
      (trendMap[e.date] || 0) + Number(e.amount);
  });

  const trendData = Object.keys(trendMap).map((date) => ({
    date,
    amount: trendMap[date]
  }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-3xl font-bold mb-4">Financial Analytics</h2>

      {/* ✅ MONTH SELECTOR (ONLY ADDITION) */}
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

      {/* Summary Cards (UNCHANGED) */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3>Total Income</h3>
          <p className="text-green-600 text-2xl">₹{income}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3>Total Expenses</h3>
          <p className="text-red-500 text-2xl">₹{totalExpenses}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3>Savings</h3>
          <p className="text-blue-600 text-2xl">₹{savings}</p>
        </div>

      </div>

      {/* CHARTS (UNCHANGED) */}
      <div className="grid grid-cols-2 gap-6">

        {/* PIE */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="mb-4">Expense vs Savings</h3>
          <PieChart width={300} height={250}>
            <Pie data={pieData} dataKey="value" outerRadius={80} label>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* BAR */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="mb-4">Category Expenses</h3>
          <BarChart width={350} height={250} data={categoryData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#3b82f6" />
          </BarChart>
        </div>

      </div>

      {/* LINE */}
      <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
        <h3 className="mb-4">Expense Trend</h3>
        <LineChart width={700} height={300} data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#10b981" />
        </LineChart>
      </div>

    </div>
  );
}

export default Analytics;