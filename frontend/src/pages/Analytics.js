import { useEffect, useState } from "react";
import { getMonth, formatMonth, getAllMonths } from "../utils/month";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL;
  const month = selectedMonth;

  useEffect(() => {
    setMonths(getAllMonths());
  }, []);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      const token = localStorage.getItem("token");
      try {
        // Fetch Income
        const incomeRes = await fetch(`${EXPENSE_API}/api/income/${month}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const incomeData = await incomeRes.json();
        setIncome(incomeData.income || 0);

        // Fetch Expenses
        const expenseRes = await fetch(`${EXPENSE_API}/api/expenses/${month}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const expenseData = await expenseRes.json();
        setExpenses(expenseData.expenses || []);

        setSelectedWeek("all");
      } catch (err) {
        console.error("Analytics data fetch error:", err);
      }
    };
    loadAnalyticsData();
  }, [month, EXPENSE_API]);

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
    if (selectedWeek === "custom") {
      if (customStart && customEnd) {
        filtered = expenses.filter(e => {
          const expenseDate = new Date(e.date).setHours(0, 0, 0, 0);
          const start = new Date(customStart).setHours(0, 0, 0, 0);
          const end = new Date(customEnd).setHours(0, 0, 0, 0);
          return expenseDate >= start && expenseDate <= end;
        });
      }
    } else if (selectedWeek !== "all") {
      const weekObj = currentWeeks[parseInt(selectedWeek)];
      filtered = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        expenseDate.setHours(0, 0, 0, 0);
        const start = new Date(weekObj.start).setHours(0, 0, 0, 0);
        const end = new Date(weekObj.end).setHours(0, 0, 0, 0);
        return expenseDate >= start && expenseDate <= end;
      });
    }
    return filtered;
  };

  const filteredExpenses = getFilteredData();
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const savings = income - totalExpenses;

  const downloadCSV = () => {
    if (filteredExpenses.length === 0 && income === 0) {
      alert("No data to download for the selected range.");
      return;
    }

    const summaryHeader = ["--- FINANCIAL SUMMARY ---"];
    const summaryData = [
      `Total Income:,${income}`,
      `Total Expenses:,${totalExpenses}`,
      `Savings (Remaining):,${savings}`,
      "", // Blank line separator
      "--- EXPENSE DETAILS ---"
    ];
    
    const headers = ["Date,Category,Amount,Description"];
    const rows = filteredExpenses.map(e => `${e.date},${e.category},${e.amount},"${e.description || ''}"`);
    
    const csvContent = "data:text/csv;charset=utf-8," + summaryHeader.concat(summaryData).concat(headers).concat(rows).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expense_Report_${selectedMonth}_${selectedWeek === 'all' ? 'FullMonth' : (selectedWeek === 'custom' ? 'CustomRange' : 'Week' + (parseInt(selectedWeek)+1))}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = async () => {
    const element = document.getElementById("analytics-dashboard");
    if (!element) return;
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    // Calculate aspect ratio height
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Add some padding
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`Analytics_Charts_${selectedWeek === 'custom' ? customStart + '_to_' + customEnd : selectedMonth}.pdf`);
  };

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

  const colorMap = {
    "Food": "#4285F4",          // Blue
    "Travel": "#AB47BC",        // Purple
    "Shopping": "#DB4437",      // Red
    "Bills": "#FF7043",         // Deep Orange
    "Education": "#F4B400",     // Yellow
    "Health": "#00ACC1",        // Cyan
    "Entertainment": "#E91E63", // Pink
    "Savings": "#22c55e",       // Green
    "Others": "#FF9800",        // Orange
  };

  // Generate a unique vibrant color from a string (for custom categories)
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = ((hash % 360) + 360) % 360;
    return `hsl(${h}, 70%, 50%)`;
  };

  const getColor = (name) => {
    return colorMap[name] || stringToColor(name);
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Financial Analytics</h2>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
            Download CSV Report
          </button>
          <button onClick={downloadPDF} className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition">
            Download PDF Charts
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Year</label>
          <select
            value={selectedMonth.split("-")[0]}
            onChange={(e) => {
              const newYear = e.target.value;
              const currentMonthNum = selectedMonth.split("-")[1];
              const candidate = `${newYear}-${currentMonthNum}`;
              const available = months.filter(m => m.startsWith(newYear));
              if (available.includes(candidate)) {
                setSelectedMonth(candidate);
              } else if (available.length > 0) {
                setSelectedMonth(available[0]);
              }
            }}
            className="p-2 rounded border bg-white shadow-sm min-w-[100px]"
          >
            {[...new Set(months.map(m => m.split("-")[0]))].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Month</label>
          <select
            value={selectedMonth.split("-")[1]}
            onChange={(e) => {
              const currentYear = selectedMonth.split("-")[0];
              setSelectedMonth(`${currentYear}-${e.target.value}`);
            }}
            className="p-2 rounded border bg-white shadow-sm min-w-[140px]"
          >
            {(() => {
              const selYear = parseInt(selectedMonth.split("-")[0]);
              const now = new Date();
              const maxMonth = selYear === now.getFullYear() ? now.getMonth() + 1 : 12;
              const options = [];
              for (let m = 1; m <= maxMonth; m++) {
                const monthNum = String(m).padStart(2, "0");
                const monthName = new Date(selYear, m - 1, 1).toLocaleString("default", { month: "long" });
                options.push(<option key={monthNum} value={monthNum}>{monthName}</option>);
              }
              return options;
            })()}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Week Tracker</label>
          <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="p-2 rounded border bg-white shadow-sm min-w-[280px]">
            <option value="all">Full Month View</option>
            <option value="custom">Custom Date Range</option>
            {currentWeeks.map((w, index) => <option key={index} value={index}>{w.label}</option>)}
          </select>
        </div>
        {selectedWeek === "custom" && (
          <div className="flex gap-2 items-end">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">Start Date</label>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="p-2 rounded border bg-white shadow-sm" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">End Date</label>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="p-2 rounded border bg-white shadow-sm" />
            </div>
          </div>
        )}
      </div>

      <div id="analytics-dashboard">
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
            <Tooltip cursor={{ fill: 'transparent' }} />
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
          <Line type="monotone" dataKey="expense" name="Expenses" stroke="#DB4437" strokeWidth={3} dot={{ r: 6 }} />
          <Line type="monotone" dataKey="savings" name="Savings" stroke="#22c55e" strokeWidth={3} dot={{ r: 6 }} />
        </LineChart>
      </div>
      </div>

      {/* Extra space for scrolling comfort */}
      <div className="h-20"></div>
    </div>
  );
}

export default Analytics;