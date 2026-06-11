import { useEffect, useState } from "react";
import { getMonth, getAllMonths } from "../utils/month";
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
  Line,
  ResponsiveContainer
} from "recharts";

function Analytics() {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState([]);
  // Initializing state with current year and month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonthNum, setSelectedMonthNum] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL;
  const month = `${selectedYear}-${selectedMonthNum}`;

  useEffect(() => {
    const loadAnalyticsData = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const incomeRes = await fetch(`${EXPENSE_API}/api/income/${month}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const incomeData = await incomeRes.json();
        setIncome(incomeData.income || 0);

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
      "", 
      "--- EXPENSE DETAILS ---"
    ];
    
    const headers = ["Date,Category,Amount,Description"];
    const rows = filteredExpenses.map(e => `${e.date},${e.category},${e.amount},"${e.description || ''}"`);
    
    const csvContent = "data:text/csv;charset=utf-8," + summaryHeader.concat(summaryData).concat(headers).concat(rows).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expense_Report_${month}.csv`);
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
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`Analytics_Charts_${month}.pdf`);
  };

  // --- CHART DATA GENERATION ---
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
    "Food": "#4285F4", "Travel": "#AB47BC", "Shopping": "#DB4437", 
    "Bills": "#FF7043", "Education": "#F4B400", "Health": "#00ACC1", 
    "Entertainment": "#E91E63", "Savings": "#22c55e", "Others": "#FF9800",
  };

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h = ((hash % 360) + 360) % 360;
    return `hsl(${h}, 70%, 50%)`;
  };

  const getColor = (name) => colorMap[name] || stringToColor(name);

  const renderLegendText = (value, entry) => {
    const { payload } = entry;
    const percent = totalValue > 0 ? ((payload.value / totalValue) * 100).toFixed(1) : 0;
    return <span style={{ color: '#374151', fontWeight: '500', marginRight: '10px' }}>{`${value}: ${percent}%`}</span>;
  };

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
    <div className="p-6 bg-gray-100 h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Financial Analytics</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadCSV} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded shadow transition">Download CSV Report</button>
          <button onClick={downloadPDF} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-semibold rounded shadow transition">Download PDF Charts</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        {/* YEAR SCROLLER */}
        <div className="flex flex-col flex-1 min-w-[120px]">
          <label className="text-xs font-semibold text-gray-500 mb-1">Year</label>
          <div className="flex items-center justify-between bg-white border p-1.5 rounded shadow-sm">
            <button onClick={() => setSelectedYear(prev => (parseInt(prev) - 1).toString())} className="px-3 font-bold text-gray-600 hover:text-blue-600">{"<"}</button>
            <span className="font-semibold text-gray-800">{selectedYear}</span>
            <button onClick={() => setSelectedYear(prev => (parseInt(prev) + 1).toString())} className="px-3 font-bold text-gray-600 hover:text-blue-600">{">"}</button>
          </div>
        </div>

        {/* MONTH SELECTOR (All 12 Months) */}
        <div className="flex flex-col flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-gray-500 mb-1">Month</label>
          <select
            value={selectedMonthNum}
            onChange={(e) => setSelectedMonthNum(e.target.value)}
            className="p-2.5 rounded border bg-white shadow-sm font-medium text-gray-700 outline-none cursor-pointer"
          >
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((name, index) => {
              const val = String(index + 1).padStart(2, "0");
              return <option key={val} value={val}>{name}</option>;
            })}
          </select>
        </div>

        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-gray-500 mb-1">Week Tracker</label>
          <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="p-2.5 rounded border bg-white shadow-sm font-medium text-gray-700 outline-none cursor-pointer">
            <option value="all">Full Month View</option>
            <option value="custom">Custom Date Range</option>
            {currentWeeks.map((w, index) => <option key={index} value={index}>{w.label}</option>)}
          </select>
        </div>
      </div>

      <div id="analytics-dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-400 font-medium text-sm">Total Income</h3>
            <p className="text-green-600 text-2xl font-bold mt-1">₹{income}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
            <h3 className="text-gray-400 font-medium text-sm">Expenses in Selection</h3>
            <p className="text-red-500 text-2xl font-bold mt-1">₹{totalExpenses}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-400 font-medium text-sm">Savings (Remaining)</h3>
            <p className="text-blue-600 text-2xl font-bold mt-1">₹{savings}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
            <h3 className="mb-4 self-start font-bold text-gray-800 text-sm md:text-base">Expense Categories vs Savings</h3>
            <div className="w-full h-[320px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}>
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={getColor(entry.name)} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend verticalAlign="bottom" formatter={renderLegendText} wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="mb-4 font-bold text-gray-800 text-sm md:text-base">Daily Breakdown (Stacked)</h3>
            <div className="w-full h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} style={{ fontSize: '10px' }} />
                  <YAxis style={{ fontSize: '10px' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend layout="horizontal" align="center" verticalAlign="top" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                  {categoryList.map((category) => <Bar key={category} dataKey={category} stackId="a" fill={getColor(category)} barSize={15} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
          <h3 className="mb-4 font-bold text-gray-800 text-sm md:text-base">Savings (Green) vs Expenses (Red) Trend</h3>
          <div className="w-full h-[320px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -20, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" style={{ fontSize: '10px' }} />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="expense" name="Expenses" stroke="#DB4437" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="savings" name="Savings" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
}

export default Analytics;