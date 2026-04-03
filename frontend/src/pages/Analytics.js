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
  CartesianGrid,
  Legend,
  LineChart,
  Line
} from "recharts";

function Analytics() {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getMonth());
  const [months, setMonths] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState("all");

  const month = selectedMonth;

  useEffect(() => {
    setMonths(getAllMonths());
  }, []);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const monthData = data[month] || { income: 0, expenses: [] };
    setIncome(monthData.income || 0);
    setExpenses(monthData.expenses || []);
    setSelectedWeek("all");
  }, [month]);

  // --- CALENDAR LOGIC ---
  const getCalendarWeeks = (monthStr) => {
    const [year, monthIdx] = monthStr.split("-").map(Number);
    const firstDayOfMonth = new Date(year, monthIdx - 1, 1);
    const lastDayOfMonth = new Date(year, monthIdx, 0);
    const monthName = firstDayOfMonth.toLocaleString('default', { month: 'long' });
    
    const weeks = [];
    let currentStart = new Date(firstDayOfMonth);

    while (currentStart <= lastDayOfMonth) {
      let currentEnd = new Date(currentStart);
      const daysUntilSaturday = 6 - currentEnd.getDay();
      currentEnd.setDate(currentEnd.getDate() + daysUntilSaturday);

      if (currentEnd > lastDayOfMonth) {
        currentEnd = new Date(lastDayOfMonth);
      }

      const formatDay = (d) => String(d.getDate()).padStart(2, '0');
      
      weeks.push({
        label: `Week ${weeks.length + 1}: ${monthName} ${formatDay(currentStart)} - ${monthName} ${formatDay(currentEnd)}`,
        start: new Date(currentStart),
        end: new Date(currentEnd)
      });

      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() + 1);
    }
    return weeks;
  };

  const currentWeeks = getCalendarWeeks(month);

  // --- FILTERING LOGIC ---
  const getFilteredData = () => {
    let filtered = expenses;
    if (selectedWeek !== "all") {
      const weekObj = currentWeeks[parseInt(selectedWeek)];
      filtered = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        expenseDate.setHours(0,0,0,0);
        const start = new Date(weekObj.start).setHours(0,0,0,0);
        const end = new Date(weekObj.end).setHours(0,0,0,0);
        return expenseDate >= start && expenseDate <= end;
      });
    }
    return filtered;
  };

  const filteredExpenses = getFilteredData();
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const savings = income - totalExpenses;

  // --- PIE DATA & PERCENTAGE CALCULATION ---
  const categoryMap = {};
  filteredExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
  });

  const pieData = [
    ...Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] })),
    { name: "Savings", value: savings > 0 ? savings : 0 }
  ];

  const totalValue = pieData.reduce((sum, entry) => sum + entry.value, 0);

  const getColor = (name) => {
    switch (name) {
      case "Education": return "#F4B400"; // Yellow
      case "Savings": return "#22c55e";   // Green
      case "Food": return "#4285F4";      // Blue
      case "Shopping": return "#DB4437";  // Red
      case "Travel": return "#AB47BC";    // Purple
      default: return "#94a3b8";
    }
  };

  const renderLegendText = (value, entry) => {
    const { payload } = entry;
    const percent = totalValue > 0 ? ((payload.value / totalValue) * 100).toFixed(1) : 0;
    return <span style={{ color: '#374151', fontWeight: '500', marginRight: '10px' }}>{`${value}: ${percent}%`}</span>;
  };

  // --- BAR & LINE DATA ---
  const dateMap = {};
  const allCategories = new Set();
  filteredExpenses.forEach((e) => {
    allCategories.add(e.category);
    if (!dateMap[e.date]) dateMap[e.date] = { name: e.date };
    dateMap[e.date][e.category] = (dateMap[e.date][e.category] || 0) + Number(e.amount);
  });
  const weeklyChartData = Object.values(dateMap).sort((a, b) => new Date(a.name) - new Date(b.name));
  const categoryList = Array.from(allCategories);

  const trendMap = {};
  filteredExpenses.forEach((e) => {
    trendMap[e.date] = (trendMap[e.date] || 0) + Number(e.amount);
  });
  const trendData = Object.keys(trendMap).sort().map((date) => {
    const dailyExpense = trendMap[date];
    const dailyIncomeChunk = income / (Object.keys(trendMap).length || 1); 
    return { date, expense: dailyExpense, savings: Math.max(0, dailyIncomeChunk - dailyExpense) };
  });

  return (
    /* FIXED: Added h-screen and overflow-y-auto to allow scrolling while keeping the sidebar intact */
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto">
      <h2 className="text-3xl font-bold mb-4">Financial Analytics</h2>

      <div className="flex gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Month</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 rounded border bg-white shadow-sm">
            {months.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Week Tracker</label>
          <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="p-2 rounded border bg-white shadow-sm min-w-[280px]">
            <option value="all">Full Month View</option>
            {currentWeeks.map((w, index) => <option key={index} value={index}>{w.label}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500 font-medium">Total Income</h3>
          <p className="text-green-600 text-2xl font-bold">₹{income}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500 font-medium">Expenses in Selection</h3>
          <p className="text-red-500 text-2xl font-bold">₹{totalExpenses}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500 font-medium">Savings (Remaining)</h3>
          <p className="text-blue-600 text-2xl font-bold">₹{savings}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
          <h3 className="mb-4 self-start font-semibold">Expense Categories vs Savings</h3>
          <PieChart width={450} height={350}>
            <Pie 
              data={pieData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" cy="50%" 
              outerRadius={100} 
              label={false} 
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend 
              verticalAlign="bottom" 
              formatter={renderLegendText} 
              wrapperStyle={{ paddingTop: '20px' }} 
            />
          </PieChart>
        </div>

        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="mb-2 font-semibold">Daily Breakdown (Stacked)</h3>
          <BarChart width={450} height={300} data={weeklyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} style={{ fontSize: '10px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Legend layout="vertical" align="right" verticalAlign="top" />
            {categoryList.map((category) => (
              <Bar key={category} dataKey={category} stackId="a" fill={getColor(category)} barSize={15} />
            ))}
          </BarChart>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
        <h3 className="mb-4 font-semibold">Savings (Green) vs Expenses (Red) Trend</h3>
        <LineChart width={850} height={350} data={trendData} margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="expense" name="Expenses" stroke="#DB4437" strokeWidth={3} dot={{r: 6}} />
          <Line type="monotone" dataKey="savings" name="Savings" stroke="#22c55e" strokeWidth={3} dot={{r: 6}} />
        </LineChart>
      </div>

      {/* Extra space for scrolling comfort */}
      <div className="h-20"></div>
    </div>
  );
}

export default Analytics;