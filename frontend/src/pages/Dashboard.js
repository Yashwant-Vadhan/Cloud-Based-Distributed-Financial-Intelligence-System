import { useState, useEffect } from "react";
import { getMonth } from "../utils/month";

function Dashboard() {
  const [income, setIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [monthlyIncomeHistory, setMonthlyIncomeHistory] = useState([]);
  
  // Quick Add States
  const [quickAmount, setQuickAmount] = useState("");
  const [quickCategory, setQuickCategory] = useState("Food");
  const [showToast, setShowToast] = useState(false);

  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL;
  const month = getMonth();

  const loadDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const incomeRes = await fetch(`${EXPENSE_API}/api/income/${month}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const incomeData = await incomeRes.json();
      setIncome(incomeData.income || 0);
      setMonthlyIncomeHistory(incomeData.incomeHistory || []);

      const expenseRes = await fetch(`${EXPENSE_API}/api/expenses/${month}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const expenseData = await expenseRes.json();
      setMonthlyExpenses(expenseData.expenses || []);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [month, EXPENSE_API]);

  const handleQuickAdd = async () => {
    if (!quickAmount) return;
    const token = localStorage.getItem("token");
    const date = new Date().toLocaleDateString();

    try {
      const response = await fetch(`${EXPENSE_API}/api/expenses/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(quickAmount), category: quickCategory, date }),
      });
      if (response.ok) {
        loadDashboardData(); // Refresh everything automatically
        setQuickAmount("");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      alert("Error adding expense");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleQuickAdd();
  };

  const totalExpenses = monthlyExpenses.reduce((total, item) => total + Number(item.amount), 0);
  const savings = income - totalExpenses;

  // Daily Budget Logic
  const getDaysInMonth = (year, monthIdx) => new Date(year, monthIdx, 0).getDate();
  const [yearStr, monthStr] = month.split("-");
  const daysInMonth = getDaysInMonth(Number(yearStr), Number(monthStr));
  const todayDate = new Date().getDate();
  const remainingDays = Math.max(1, daysInMonth - todayDate + 1);
  const safeDailyBudget = savings > 0 ? (savings / remainingDays).toFixed(0) : 0;

  // Smart AI Insights
  const generateInsights = () => {
    const alerts = [];
    if (income === 0 && totalExpenses === 0) return ["Log your first income and expense to see insights!"];
    if (savings < 0) alerts.push("⚠️ You are over your budget boundary! Avoid any non-essential spending.");
    else if (savings >= (income * 0.4) && income > 0) alerts.push("🏆 Amazing job! You are successfully saving 40%+ of your income.");

    const foodExp = monthlyExpenses.filter(e => e.category === 'Food').reduce((s, e) => s + e.amount, 0);
    if (totalExpenses > 0 && (foodExp / totalExpenses) > 0.4) {
      alerts.push("🍔 You are spending more than 40% of your total expenses on Food. Consider cooking at home longer this week.");
    }

    if (alerts.length === 0) alerts.push("📊 Your spending behavior is looking balanced and steady!");
    return alerts;
  };
  const insights = generateInsights();

  // Combine & sort transactions by MongoDB _id (which inherently sorts by creation time)
  const allTransactions = [
    ...monthlyExpenses.map(e => ({ ...e, type: "expense" })),
    ...monthlyIncomeHistory.map(i => ({ ...i, type: "income" }))
  ];
  allTransactions.sort((a, b) => (a._id > b._id ? -1 : 1));

  // Recent 6 Transactions
  const recentTransactions = allTransactions.slice(0, 6);

  // Group expenses by category for the breakdown
  const categoryMap = {};
  monthlyExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
  });
  const categoryList = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto relative">
      {showToast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2 transform transition-all duration-300 ease-in-out font-medium">
          <span>⚡</span> Quick Expense Logged!
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="grid grid-cols-2 flex-grow gap-6 w-full lg:w-2/3">
          <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500 flex flex-col justify-center">
            <h3 className="text-gray-500 text-sm font-semibold">Total Income</h3>
            <p className="text-2xl font-bold text-green-600">₹{income}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-red-500 flex flex-col justify-center">
            <h3 className="text-gray-500 text-sm font-semibold">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-500">₹{totalExpenses}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-blue-500 flex flex-col justify-center">
            <h3 className="text-gray-500 text-sm font-semibold">Savings</h3>
            <p className={`text-2xl font-bold ${savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{savings}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-purple-500 flex flex-col justify-center">
            <h3 className="text-gray-500 text-sm font-semibold flex justify-between items-center">
              Daily Safe Budget
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded">Next {remainingDays} Days</span>
            </h3>
            <p className="text-2xl font-bold text-purple-600">₹{safeDailyBudget}</p>
          </div>
        </div>

        {/* Quick Add Widget */}
        <div className="bg-white p-6 rounded-xl shadow-lg w-full lg:w-1/3 border-t-4 border-blue-600">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span>⚡</span> Quick Add Expense</h3>
          <div className="space-y-4">
            <input 
              type="number" 
              placeholder="Amount ₹" 
              value={quickAmount} 
              onChange={e => setQuickAmount(e.target.value)} 
              onKeyDown={handleKeyDown} 
              className="w-full border p-2 rounded-lg bg-gray-50" 
            />
            <select 
              value={quickCategory} 
              onChange={e => setQuickCategory(e.target.value)} 
              className="w-full border p-2 rounded-lg bg-gray-50"
            >
              <option>Food</option>
              <option>Travel</option>
              <option>Shopping</option>
              <option>Bills</option>
              <option>Education</option>
              <option>Health</option>
              <option>Entertainment</option>
              <option>Others</option>
            </select>
            <button 
              onClick={handleQuickAdd} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
            >
              Add Instantly
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Smart Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span>🤖</span> Smart Alerts</h3>
          <div className="space-y-3">
            {insights.map((msg, idx) => (
              <div key={idx} className="p-3 rounded-lg text-sm bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 font-medium leading-relaxed">
                {msg}
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Recent */}
        <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><span>⏱️</span> Recent Activity</h3>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map(tx => (
                <div key={tx._id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-sm">{tx.category || tx.source}</span>
                    <span className="text-[10px] text-gray-400">{tx.date}</span>
                  </div>
                  <span className={`font-bold text-sm ${tx.type === "income" ? "text-green-500" : "text-red-500"}`}>
                    {tx.type === "income" ? '+' : '-'}₹{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">No recent transactions</p>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-1">
          <h3 className="text-lg font-bold mb-4">Expense Breakdown</h3>
          {categoryList.length > 0 ? (
            <div className="space-y-3">
              {categoryList.map(([cat, amt]) => {
                const percent = totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="text-gray-500">₹{amt} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">No expenses recorded this month</p>
          )}
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  );
}

export default Dashboard;