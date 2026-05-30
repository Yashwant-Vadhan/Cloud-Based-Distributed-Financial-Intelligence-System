import { useState, useEffect } from "react";

function Expenses() {
  const [expense, setExpense] = useState(0);
  const [inputExpense, setInputExpense] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(""); 
  const [expenseHistory, setExpenseHistory] = useState([]);

  // Get current real-time calendar anchors for initialization
  const today = new Date();
  
  // Year & Month dual states matching Income layout
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());
  const [selectedMonthNum, setSelectedMonthNum] = useState(
    String(today.getMonth() + 1).padStart(2, "0")
  );

  // Formatted bucket string for backend syncing ("YYYY-MM")
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

  // Fetch expense rows whenever year or month changes
  useEffect(() => {
    const loadExpenseData = async () => {
      try {
        const response = await fetch(`${EXPENSE_API}/api/expenses/${selectedMonthStr}`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        const expenses = data.expenses || [];
        const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        setExpense(totalExpense);
        setExpenseHistory(expenses);
      } catch (err) {
        // LocalStorage recovery matrix
        const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
        const monthData = data[selectedMonthStr] || { expenses: [], expense: 0 };
        setExpense(monthData.expense || 0);
        setExpenseHistory(monthData.expenses || []);
      }
    };
    loadExpenseData();
  }, [selectedMonthStr, EXPENSE_API]);

  // Infinite Year Scroller Controls
  const incrementYear = () => {
    setSelectedYear(prev => (parseInt(prev, 10) + 1).toString());
  };

  const decrementYear = () => {
    setSelectedYear(prev => (parseInt(prev, 10) - 1).toString());
  };

  const handleAddExpense = async () => {
    if (!inputExpense || isNaN(inputExpense)) return;

    let finalDate = date;
    
    // Smart Fallback Selection Logic matching active screen display matrix
    if (!finalDate) {
      const currentActualYearMonth = new Date().toISOString().split('T')[0].slice(0, 7);

      if (selectedMonthStr === currentActualYearMonth) {
        finalDate = new Date().toISOString().split('T')[0];
      } else {
        finalDate = `${selectedYear}-${selectedMonthNum}-01`; // Defaults seamlessly to first of that target month
      }
    }
    
    const finalCategory = expenseCategory === "Other" ? (customCategory || "Other") : expenseCategory;
    const newAmount = Number(inputExpense);
    
    const newEntry = {
      id: Date.now(),
      date: finalDate, 
      category: finalCategory,
      amount: newAmount,
    };

    const targetMonth = finalDate.slice(0, 7);

    try {
      await fetch(`${EXPENSE_API}/api/expenses/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(newEntry),
      });
    } catch (err) {
      console.log("Offline state backup routine registered.");
    }

    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const targetMonthData = data[targetMonth] || { income: 0, expenses: [], incomeHistory: [] };
    const updatedTotalExpenses = (targetMonthData.expense || 0) + newAmount;
    const updatedHistory = [...(targetMonthData.expenses || []), newEntry];

    data[targetMonth] = { ...targetMonthData, expense: updatedTotalExpenses, expenses: updatedHistory };
    localStorage.setItem("monthlyData", JSON.stringify(data));

    if (targetMonth === selectedMonthStr) {
      setExpense(updatedTotalExpenses);
      setExpenseHistory(updatedHistory);
    }
    
    setInputExpense("");
    setCustomCategory("");
    setDate(""); 
  };

  const deleteExpense = async (id) => {
    try {
      await fetch(`${EXPENSE_API}/api/expenses/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });
    } catch (err) {
      console.log("Deferred background elimination processed.");
    }

    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const currentMonthData = data[selectedMonthStr];
    if (!currentMonthData) return;

    const entryToDelete = currentMonthData.expenses.find((item) => item.id === id);
    if (!entryToDelete) return;

    const updatedHistory = currentMonthData.expenses.filter((item) => item.id !== id);
    const updatedTotalExpenses = currentMonthData.expense - entryToDelete.amount;

    data[selectedMonthStr] = { ...currentMonthData, expense: updatedTotalExpenses, expenses: updatedHistory };
    localStorage.setItem("monthlyData", JSON.stringify(data));

    setExpense(updatedTotalExpenses);
    setExpenseHistory(updatedHistory);
  };

  const getActiveMonthLabel = () => {
    const active = monthsList.find(m => m.value === selectedMonthNum);
    return active ? `${active.label} ${selectedYear}` : selectedMonthStr;
  };

  return (
    <div className="p-6 bg-gray-100 h-[calc(100vh-64px)] overflow-y-auto">
      
      {/* Header and Integrated Scroller Controls Matching Income Page */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Expense Manager</h2>
        
        {/* Mirror copy of the Year Scroller Component Group */}
        <div className="flex items-center gap-2 bg-white p-1.5 border border-gray-200 rounded-xl shadow-sm select-none">
          {/* Month Field */}
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

          {/* Vertical Divider */}
          <div className="w-[1px] bg-gray-200 h-6 mx-1"></div>

          {/* Infinite Scroll Counter Component Box */}
          <div className="flex items-center gap-1.5 px-2">
            <span className="font-semibold text-blue-600 text-sm w-10 text-center">
              {selectedYear}
            </span>
            <div className="flex flex-col justify-center items-center">
              {/* Up Increment Pointer Button */}
              <button 
                onClick={incrementYear}
                className="text-gray-400 hover:text-blue-600 transition-colors p-0.5"
                title="Increment Year"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              {/* Down Decrement Pointer Button */}
              <button 
                onClick={decrementYear}
                className="text-gray-400 hover:text-blue-600 transition-colors p-0.5"
                title="Decrement Year"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Metric Banner Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Red Accent Total Expenses Metric Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 flex flex-col justify-between h-[140px]">
          <h3 className="text-gray-400 font-medium text-sm">Total Expenses ({getActiveMonthLabel()})</h3>
          <p className="text-3xl font-bold text-red-600">₹{expense}</p>
        </div>

        {/* Action Input Container */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 flex flex-col justify-between min-h-[140px]">
          <h3 className="text-gray-800 font-semibold text-base mb-2">Add Expense Record</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="number"
              value={inputExpense}
              onChange={(e) => setInputExpense(e.target.value)}
              placeholder="Amount ₹"
              className="border border-gray-300 p-2 rounded-lg flex-1 min-w-[120px] outline-none focus:border-blue-500"
            />

            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg bg-white text-gray-700 outline-none flex-1 min-w-[120px]"
            >
              <option value="Food">Food</option>
              <option value="Rent">Rent</option>
              <option value="Groceries">Groceries</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Transportation">Transportation</option>
              <option value="Other">Other</option>
            </select>

            {expenseCategory === "Other" && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Specify Category"
                className="border border-gray-300 p-2 rounded-lg flex-1 min-w-[120px] outline-none"
              />
            )}

            {/* Date Selection Box Context */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg text-gray-600 outline-none flex-1 min-w-[140px] focus:border-blue-500"
            />

            <button
              onClick={handleAddExpense}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Expense History Ledger Container */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Expense Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-400 font-medium text-sm">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenseHistory.length > 0 ? (
                expenseHistory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 text-gray-700 transition-colors">
                    <td className="py-3 px-4 text-sm">{item.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold uppercase tracking-wider">
                        {item.category || item.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-red-600">
                      -₹{item.amount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteExpense(item.id)}
                        className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400 italic text-sm">
                    No expense records found for this month.
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

export default Expenses;