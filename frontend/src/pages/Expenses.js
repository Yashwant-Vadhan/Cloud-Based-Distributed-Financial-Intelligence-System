import { useState, useEffect, useCallback } from "react";

function Expenses() {
  const [expense, setExpense] = useState(0);
  const [inputExpense, setInputExpense] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(""); 
  const [expenseHistory, setExpenseHistory] = useState([]);

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());
  const [selectedMonthNum, setSelectedMonthNum] = useState(
    String(today.getMonth() + 1).padStart(2, "0")
  );

  const selectedMonthStr = `${selectedYear}-${selectedMonthNum}`;
  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL || process.env.REACT_APP_AUTH_URL;
  const authToken = sessionStorage.getItem("token");

  const monthsList = [
    { value: "01", label: "January" }, { value: "02", label: "February" },
    { value: "03", label: "March" }, { value: "04", label: "April" },
    { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" },
    { value: "09", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ];

  const calculateTotal = (history) => history.reduce((sum, item) => sum + Number(item.amount), 0);

  const loadExpenseData = useCallback(async () => {
    try {
      const response = await fetch(`${EXPENSE_API}/api/expenses/${selectedMonthStr}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      const history = data.expenses || [];
      setExpenseHistory(history);
      setExpense(calculateTotal(history));
    } catch (err) {
      const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
      const monthData = data[selectedMonthStr] || { expenses: [] };
      setExpenseHistory(monthData.expenses || []);
      setExpense(calculateTotal(monthData.expenses || []));
    }
  }, [selectedMonthStr, EXPENSE_API, authToken]);

  useEffect(() => {
    loadExpenseData();
  }, [loadExpenseData]);

  const incrementYear = () => setSelectedYear(prev => (parseInt(prev, 10) + 1).toString());
  const decrementYear = () => setSelectedYear(prev => (parseInt(prev, 10) - 1).toString());

  const handleAddExpense = async () => {
    if (!inputExpense || isNaN(inputExpense)) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!date) {
      alert("Please select a date for this expense.");
      return;
    }
    
    const finalCategory = expenseCategory === "Other" ? (customCategory || "Other") : expenseCategory;
    const newAmount = Number(inputExpense);
    const newEntry = { id: Date.now(), date, category: finalCategory, amount: newAmount };
    const targetMonth = date.slice(0, 7);

    try {
      await fetch(`${EXPENSE_API}/api/expenses/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ ...newEntry, month: targetMonth }),
      });
    } catch (err) { console.log("Offline backup active."); }

    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const targetMonthData = data[targetMonth] || { expenses: [] };
    const updatedHistory = [...(targetMonthData.expenses || []), newEntry];
    
    data[targetMonth] = { ...targetMonthData, expenses: updatedHistory, expense: calculateTotal(updatedHistory) };
    localStorage.setItem("monthlyData", JSON.stringify(data));

    if (targetMonth === selectedMonthStr) {
      setExpenseHistory(updatedHistory);
      setExpense(calculateTotal(updatedHistory));
    } else {
      loadExpenseData();
    }
    
    setInputExpense(""); setCustomCategory(""); setDate(""); 
  };

  const deleteExpense = async (id) => {
    try { 
      await fetch(`${EXPENSE_API}/api/expenses/${id}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      }); 
    } catch (err) { console.log("Deletion error."); }

    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const currentMonthData = data[selectedMonthStr];
    if (!currentMonthData) return;

    const updatedHistory = currentMonthData.expenses.filter((item) => item.id !== id);
    data[selectedMonthStr] = { ...currentMonthData, expenses: updatedHistory, expense: calculateTotal(updatedHistory) };
    localStorage.setItem("monthlyData", JSON.stringify(data));

    setExpenseHistory(updatedHistory);
    setExpense(calculateTotal(updatedHistory));
  };

  const getActiveMonthLabel = () => {
    const active = monthsList.find(m => m.value === selectedMonthNum);
    return active ? `${active.label} ${selectedYear}` : selectedMonthStr;
  };

  return (
    <div className="p-6 bg-gray-100 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Expense Manager</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 flex flex-col justify-between h-[140px]">
          <h3 className="text-gray-400 font-medium text-sm">Total Expenses ({getActiveMonthLabel()})</h3>
          <p className="text-3xl font-bold text-red-600">₹{expense}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 flex flex-col justify-between min-h-[140px]">
          <h3 className="text-gray-800 font-semibold text-base mb-2">Add Expense Record</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <input type="number" value={inputExpense} onChange={(e) => setInputExpense(e.target.value)} placeholder="Amount ₹" className="border border-gray-300 p-2 rounded-lg flex-1 min-w-[120px] outline-none" />
            <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className="border border-gray-300 p-2 rounded-lg bg-white outline-none flex-1 min-w-[120px]">
              <option value="Food">Food</option>
              <option value="Groceries">Groceries</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Transportation">Transportation</option>
              <option value="Other">Other</option>
            </select>
            {expenseCategory === "Other" && <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Specify Category" className="border border-gray-300 p-2 rounded-lg flex-1 min-w-[120px] outline-none" />}
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-300 p-2 rounded-lg outline-none flex-1 min-w-[140px]" />
            <button onClick={handleAddExpense} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors">Add</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Expense Ledger</h3>
          <div className="flex items-center gap-2 bg-gray-50 p-1 border border-gray-200 rounded-xl shadow-sm select-none">
            <select value={selectedMonthNum} onChange={(e) => setSelectedMonthNum(e.target.value)} className="p-1.5 bg-transparent font-medium text-gray-700 outline-none cursor-pointer hover:bg-gray-100 rounded-lg text-xs">
              {monthsList.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <div className="w-[1px] bg-gray-200 h-4 mx-0.5"></div>
            <div className="flex items-center gap-1.5 px-1">
              <span className="font-semibold text-blue-600 text-xs w-8 text-center">{selectedYear}</span>
              <div className="flex flex-col"><button onClick={incrementYear} className="text-gray-400 hover:text-blue-600"><svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 15l7-7 7 7" /></svg></button><button onClick={decrementYear} className="text-gray-400 hover:text-blue-600"><svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M19 9l-7 7-7-7" /></svg></button></div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-400 font-medium text-sm">
                <th className="py-3 px-4">Date</th><th className="py-3 px-4">Category</th><th className="py-3 px-4 text-right">Amount</th><th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenseHistory.length > 0 ? expenseHistory.map((item) => (
                <tr key={item._id || item.id} className="border-b hover:bg-gray-50 text-gray-700">
                  <td className="py-3 px-4 text-sm">{item.date}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold uppercase">{item.category}</span></td>
                  <td className="py-3 px-4 text-right font-bold text-red-600">-₹{item.amount}</td>
                  <td className="py-3 px-4 text-center"><button onClick={() => deleteExpense(item._id || item.id)} className="text-red-500 hover:text-red-700 font-semibold">Delete</button></td>
                </tr>
              )) : <tr><td colSpan="4" className="py-12 text-center text-gray-400 italic text-sm">No expense records found for this month.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Expenses;