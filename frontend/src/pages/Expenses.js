import { useEffect, useState } from "react";
import { getMonth, formatMonth, getAllMonths } from "../utils/month";

function Expenses() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getMonth());
  const [months, setMonths] = useState([]);

  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL;

  useEffect(() => {
    setMonths(getAllMonths());
  }, []);


  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${EXPENSE_API}/api/expenses/${selectedMonth}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        setExpenses(data.expenses || []);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setExpenses([]);
      }
    };
    fetchExpenses();
  }, [selectedMonth, EXPENSE_API]);

  const addExpense = async () => {
    if (!amount || !date) {
      alert("Enter all fields");
      return;
    }

    const finalCategory = category === "Others" ? (customCategory || "Others") : category;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${EXPENSE_API}/api/expenses/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(amount), category: finalCategory, date }),
      });
      
      if (response.ok) {
        const fetchExpenses = async () => {
          const response = await fetch(`${EXPENSE_API}/api/expenses/${selectedMonth}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await response.json();
          setExpenses(data.expenses || []);
        };
        fetchExpenses();
        setAmount("");
        setDate("");
        setCustomCategory("");
      }
    } catch (err) {
      alert("Error adding expense");
    }
  };

  const deleteExpense = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${EXPENSE_API}/api/expenses/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setExpenses(expenses.filter(e => e._id !== id));
      }
    } catch (err) {
      alert("Error deleting expense");
    }
  };

  return (
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

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 flex flex-wrap gap-4">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded w-full md:w-1/5"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded w-full md:w-1/5"
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

        {category === "Others" && (
          <input
            type="text"
            placeholder="Specify Category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            className="p-2 border border-blue-400 rounded w-full md:w-1/5 animate-pulse"
          />
        )}

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded w-full md:w-1/5"
        />
        <button onClick={addExpense} className="bg-blue-600 text-white px-6 rounded py-2 md:py-0">
          Add
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        {expenses.length === 0 && <p>No expenses</p>}
        {expenses.map((e) => (
          <div key={e._id} className="flex justify-between border-b py-2">
            <div>
              <p>{e.category}</p>
              <small>{e.date}</small>
            </div>
            <div>
              ₹{e.amount}
              <button onClick={() => deleteExpense(e._id)} className="ml-4 text-red-500">
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