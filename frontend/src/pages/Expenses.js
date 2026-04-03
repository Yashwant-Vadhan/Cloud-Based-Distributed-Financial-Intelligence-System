import { useEffect, useState } from "react";
import { getMonth, formatMonth, getAllMonths } from "../utils/month";

function Expenses() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getMonth());
  const [months, setMonths] = useState([]);

  // .env URL for your Expense Microservice
  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL;

  useEffect(() => {
    setMonths(getAllMonths());
  }, []);

  // Fetch from backend but fallback to localStorage if service is down
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`${EXPENSE_API}/api/expenses/${selectedMonth}`);
        const data = await response.json();
        setExpenses(data.expenses || []);
      } catch (err) {
        // Keeping your original localStorage logic as a fallback
        const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
        const monthData = data[selectedMonth] || { expenses: [] };
        setExpenses(monthData.expenses || []);
      }
    };
    fetchExpenses();
  }, [selectedMonth, EXPENSE_API]);

  const addExpense = async () => {
    if (!amount || !date) {
      alert("Enter all fields");
      return;
    }

    const selectedDate = new Date(date);
    const expenseMonth = selectedDate.toISOString().slice(0, 7);
    const newExpense = {
      amount: Number(amount),
      category,
      date,
      id: Date.now()
    };

    try {
      // Sync with Backend
      await fetch(`${EXPENSE_API}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newExpense, month: expenseMonth }),
      });
    } catch (err) {
      console.log("Saving locally as service is unreachable");
    }

    // Keeping your original localStorage update logic
    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    if (!data[expenseMonth]) data[expenseMonth] = { income: 0, expenses: [] };
    data[expenseMonth].expenses.push(newExpense);
    localStorage.setItem("monthlyData", JSON.stringify(data));

    if (expenseMonth === selectedMonth) {
      setExpenses([...data[expenseMonth].expenses]);
    }

    setAmount("");
    setDate("");
    setMonths(getAllMonths());
  };

  const deleteExpense = async (id) => {
    try {
      await fetch(`${EXPENSE_API}/api/expenses/${id}`, { method: "DELETE" });
    } catch (err) {
      console.log("Deleted locally only");
    }

    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    data[selectedMonth].expenses = data[selectedMonth].expenses.filter(e => e.id !== id);
    localStorage.setItem("monthlyData", JSON.stringify(data));
    setExpenses([...data[selectedMonth].expenses]);
  };

  return (
    /* FIXED: Added h-screen and overflow-y-auto to allow scrolling 
       without breaking the sidebar background */
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto">
      <h2 className="text-3xl font-bold mb-4">Expense Manager</h2>

      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="mb-6 p-2 border rounded"
      >
        {!months.includes(getMonth()) && (
          <option value={getMonth()}>{formatMonth(getMonth())}</option>
        )}
        {months.map(m => (
          <option key={m} value={m}>{formatMonth(m)}</option>
        ))}
      </select>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 flex gap-4">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded w-1/4"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded w-1/4"
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Education</option>
          <option>Health</option>
          <option>Entertainment</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded w-1/4"
        />
        <button onClick={addExpense} className="bg-blue-600 text-white px-6 rounded">
          Add
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        {expenses.length === 0 && <p>No expenses</p>}
        {expenses.map((e) => (
          <div key={e.id} className="flex justify-between border-b py-2">
            <div>
              <p>{e.category}</p>
              <small>{e.date}</small>
            </div>
            <div>
              ₹{e.amount}
              <button onClick={() => deleteExpense(e.id)} className="ml-4 text-red-500">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Buffer space to ensure the last item is fully visible */}
      <div className="h-20"></div>
    </div>
  );
}

export default Expenses;