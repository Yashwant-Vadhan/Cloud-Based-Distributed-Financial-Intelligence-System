import { useState, useEffect } from "react";

function Dashboard() {
  // Metric States
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [savings, setSavings] = useState(0);
  const [safeBudget, setSafeBudget] = useState(0);
  
  // Interactive Panel States
  const [recentActivities, setRecentActivities] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState({});

  // Synchronized Infinite Scroller State Anchors initialized once safely
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [selectedMonthNum, setSelectedMonthNum] = useState(() => 
    String(new Date().getMonth() + 1).padStart(2, "0")
  );

  // Target composite string format matching your distributed API layer ("YYYY-MM")
  const selectedMonthStr = `${selectedYear}-${selectedMonthNum}`;

  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL || process.env.REACT_APP_AUTH_URL;
  const authToken = localStorage.getItem("token");

  const monthsList = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Dynamically re-trigger analytical aggregation metrics on view changes
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      let incomeHistory = [];
      let expenses = [];

      try {
        // Fetch Income
        const incomeRes = await fetch(`${EXPENSE_API}/api/income/${selectedMonthStr}`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });
        const incomeData = await incomeRes.json();
        incomeHistory = incomeData.incomeHistory || [];

        // Fetch Expenses
        const expenseRes = await fetch(`${EXPENSE_API}/api/expenses/${selectedMonthStr}`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });
        const expenseData = await expenseRes.json();
        expenses = expenseData.expenses || [];
      } catch (err) {
        const localData = JSON.parse(localStorage.getItem("monthlyData")) || {};
        const activeMonthData = localData[selectedMonthStr] || { income: 0, expense: 0, expenses: [], incomeHistory: [] };
        incomeHistory = activeMonthData.incomeHistory || [];
        expenses = activeMonthData.expenses || [];
      }

      // MATH FIX: Calculate totals dynamically from history arrays
      const computedIncome = incomeHistory.reduce((sum, item) => sum + Number(item.amount), 0);
      const computedExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
      const computedSavings = computedIncome - computedExpense;
      
      const totalDays = new Date(parseInt(selectedYear, 10), parseInt(selectedMonthNum, 10), 0).getDate();
      const activeTodayInstance = new Date();
      
      const isCurrentMonth = activeTodayInstance.getFullYear().toString() === selectedYear && 
                             String(activeTodayInstance.getMonth() + 1).padStart(2, "0") === selectedMonthNum;
                             
      const currentDay = isCurrentMonth ? activeTodayInstance.getDate() : 1;
      const remainingDays = Math.max(1, totalDays - currentDay + 1);
      const computedSafeBudget = computedSavings > 0 ? Math.round(computedSavings / remainingDays) : 0;

      const mergedHistory = [
        ...incomeHistory.map(i => ({ ...i, type: 'income' })),
        ...expenses.map(e => ({ ...e, type: 'expense' }))
      ].sort((a, b) => b.id - a.id).slice(0, 5);

      const breakdown = {};
      expenses.forEach(exp => {
        breakdown[exp.category] = (breakdown[exp.category] || 0) + Number(exp.amount);
      });

      setIncome(computedIncome);
      setExpense(computedExpense);
      setSavings(computedSavings);
      setSafeBudget(computedSafeBudget);
      setRecentActivities(mergedHistory);
      setExpenseBreakdown(breakdown);
    };

    fetchDashboardMetrics();
  }, [selectedMonthStr, selectedYear, selectedMonthNum, EXPENSE_API, authToken]);

  const incrementYear = () => {
    setSelectedYear(prev => (parseInt(prev, 10) + 1).toString());
  };

  const decrementYear = () => {
    setSelectedYear(prev => (parseInt(prev, 10) - 1).toString());
  };

  return (
    <div className="p-6 bg-gray-100 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="flex items-center gap-2 bg-white p-1.5 border border-gray-200 rounded-xl shadow-sm select-none">
          <select
            value={selectedMonthNum}
            onChange={(e) => setSelectedMonthNum(e.target.value)}
            className="p-2 bg-transparent font-medium text-gray-700 outline-none cursor-pointer hover:bg-gray-50 rounded-lg text-sm"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <div className="w-[1px] bg-gray-200 h-6 mx-1"></div>
          <div className="flex items-center gap-1.5 px-2">
            <span className="font-semibold text-blue-600 text-sm w-10 text-center">
              {selectedYear}
            </span>
            <div className="flex flex-col justify-center items-center">
              <button onClick={incrementYear} className="text-gray-400 hover:text-blue-600 transition-colors p-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
              </button>
              <button onClick={decrementYear} className="text-gray-400 hover:text-blue-600 transition-colors p-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 content-start">
          <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-green-500 h-[130px] flex flex-col justify-between">
            <h3 className="text-gray-400 font-medium text-sm">Total Income</h3>
            <p className="text-3xl font-bold text-green-600">₹{income}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-red-500 h-[130px] flex flex-col justify-between">
            <h3 className="text-gray-400 font-medium text-sm">Total Expenses</h3>
            <p className="text-3xl font-bold text-red-600">₹{expense}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-blue-500 h-[130px] flex flex-col justify-between">
            <h3 className="text-gray-400 font-medium text-sm">Savings</h3>
            <p className="text-3xl font-bold text-blue-600">₹{savings}</p>
          </div>
          
          {/* FIXED: Budget Card with non-overlapping UI */}
          <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-purple-500 h-[130px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="text-gray-400 font-medium text-sm">Daily Safe Budget</h3>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full tracking-wide uppercase whitespace-nowrap ml-2">
                Next Days
              </span>
            </div>
            <p className="text-3xl font-bold text-purple-600">₹{safeBudget}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md md:col-span-2 lg:col-span-4 min-h-[120px]">
            <h3 className="text-gray-800 font-bold text-base mb-3 flex items-center gap-2"><span>🤖</span> Smart Alerts</h3>
            {income === 0 && expense === 0 ? (
              <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">Log your first income and expense details to calculate automated intelligence insights!</p>
            ) : (
              <div className="text-sm text-gray-600 space-y-2">
                {savings < 0 && <p className="text-red-500 font-medium">⚠️ Alert: Your expenses outpaced earnings for this period by ₹{Math.abs(savings)}!</p>}
                {savings >= 0 && <p className="text-green-600 font-medium">✨ Great job! You managed to keep {Math.round((savings / income) * 100) || 0}% of your total revenue stream.</p>}
                <p className="text-gray-500">Based on historical logging habits, your safe spending headroom sits at ₹{safeBudget} daily.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-2xl shadow-md min-h-[260px]">
          <h3 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2"><span>⏱️</span> Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? recentActivities.map((act) => (
              <div key={act.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border-b last:border-0 border-gray-100">
                <div className="flex flex-col"><span className="font-semibold text-gray-800 text-sm">{act.category || act.source}</span><span className="text-xs text-gray-400">{act.date}</span></div>
                <span className={`font-bold text-sm ${act.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{act.type === 'income' ? `+₹${act.amount}` : `-₹${act.amount}`}</span>
              </div>
            )) : <p className="text-sm text-gray-400 italic py-8 text-center">No recent transactions recorded here.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md min-h-[260px]">
          <h3 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2"><span>📊</span> Expense Breakdown</h3>
          <div className="space-y-4">
            {Object.keys(expenseBreakdown).length > 0 ? Object.entries(expenseBreakdown).map(([cat, amt]) => {
              const percentage = Math.round((amt / expense) * 100) || 0;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-sm"><span className="font-medium text-gray-700">{cat}</span><span className="font-bold text-gray-900">₹{amt} ({percentage}%)</span></div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div></div>
                </div>
              );
            }) : <p className="text-sm text-gray-400 italic py-8 text-center">No expenses recorded this month.</p>}
          </div>
        </div>
      </div>
      <div className="h-16"></div>
    </div>
  );
}

export default Dashboard;