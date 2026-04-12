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
  const [showToast, setShowToast] = useState(false);

  // Edit state for expenses
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");

  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL;

  useEffect(() => {
    setMonths(getAllMonths());
  }, []);

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

  useEffect(() => {
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
        fetchExpenses();
        setAmount("");
        setDate("");
        setCustomCategory("");
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      alert("Error adding expense");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addExpense();
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

  const startEditExpense = (expense) => {
    setEditingExpenseId(expense._id);
    setEditAmount(expense.amount);
    setEditCategory(expense.category);
    setEditDate(expense.date);
  };

  const cancelEditExpense = () => {
    setEditingExpenseId(null);
    setEditAmount("");
    setEditCategory("");
    setEditDate("");
  };

  const saveEditExpense = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${EXPENSE_API}/api/expenses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(editAmount),
          category: editCategory,
          date: editDate
        }),
      });

      if (response.ok) {
        fetchExpenses();
        setEditingExpenseId(null);
      }
    } catch (err) {
      alert("Error updating expense");
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto relative">
      {showToast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2 transform transition-all duration-300 ease-in-out font-medium">
          <span>✅</span> Expense Added Successfully!
        </div>
      )}

      <h2 className="text-3xl font-bold mb-4">Expense Manager</h2>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Total Expense Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-red-500 w-full lg:w-1/3 flex flex-col justify-center">
          <h3 className="text-gray-500">Total Expenses (This Month)</h3>
          <p className="text-2xl font-bold text-red-500">₹{totalExpenses}</p>
        </div>

        {/* Add Expense Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg w-full lg:w-2/3">
          <h3 className="text-lg font-semibold mb-2">Add Expense Record</h3>
          <div className="flex flex-wrap gap-3">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={handleKeyDown}
              className="p-2 border rounded flex-1 min-w-[120px]"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 border rounded bg-white flex-1 min-w-[120px]"
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
                onKeyDown={handleKeyDown}
                className="p-2 border border-blue-400 rounded flex-1 min-w-[150px] animate-pulse"
              />
            )}

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onKeyDown={handleKeyDown}
              className="p-2 border rounded flex-1 min-w-[130px]"
            />
            <button onClick={addExpense} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">Expense Ledger</h3>
        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="border-b text-gray-600">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                [...expenses].reverse().map((e) => (
                  <tr key={e._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {editingExpenseId === e._id ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(ev) => setEditDate(ev.target.value)}
                          className="border p-1 rounded text-sm"
                        />
                      ) : (
                        e.date
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingExpenseId === e._id ? (
                        <select
                          value={editCategory}
                          onChange={(ev) => setEditCategory(ev.target.value)}
                          className="border p-1 rounded bg-white text-sm"
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
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-sm">
                          {e.category}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-red-500">
                      {editingExpenseId === e._id ? (
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(ev) => setEditAmount(ev.target.value)}
                          className="border p-1 rounded w-24 text-right text-sm"
                        />
                      ) : (
                        `₹${e.amount}`
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editingExpenseId === e._id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => saveEditExpense(e._id)}
                            className="text-green-600 hover:text-green-800 font-bold px-2 py-1 transition-colors"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditExpense}
                            className="text-gray-500 hover:text-gray-700 font-bold px-2 py-1 transition-colors"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEditExpense(e)}
                            className="text-blue-500 hover:text-blue-700 font-bold px-2 py-1 transition-colors"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteExpense(e._id)}
                            className="text-red-500 hover:text-red-700 font-bold px-2 py-1 transition-colors"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-400 italic">
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Buffer space to ensure the last item is fully visible */}
      <div className="h-20"></div>
    </div>
  );
}

export default Expenses;