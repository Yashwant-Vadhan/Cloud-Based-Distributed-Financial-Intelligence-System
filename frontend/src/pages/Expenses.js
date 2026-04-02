import { useEffect, useState } from "react";
import { getMonth, formatMonth, getAllMonths } from "../utils/month";

function Expenses() {

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(getMonth());
  const [months, setMonths] = useState([]);

  // Load months list
  useEffect(() => {
    setMonths(getAllMonths());
  }, []);

  // Load expenses when month changes
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const monthData = data[selectedMonth] || { expenses: [] };

    setExpenses(monthData.expenses || []);
  }, [selectedMonth]);

  // ADD EXPENSE
  const addExpense = () => {

    if (!amount || !date) {
      alert("Enter all fields");
      return;
    }

    const selectedDate = new Date(date);

    // 🔥 IMPORTANT: derive month from DATE (not dropdown)
    const expenseMonth = selectedDate.toISOString().slice(0, 7);

    const newExpense = {
      id: Date.now(),
      amount: Number(amount),
      category,
      date
    };

    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};

    if (!data[expenseMonth]) {
      data[expenseMonth] = { income: 0, expenses: [] };
    }

    data[expenseMonth].expenses.push(newExpense);

    localStorage.setItem("monthlyData", JSON.stringify(data));

    // refresh UI if same month
    if (expenseMonth === selectedMonth) {
      setExpenses([...data[expenseMonth].expenses]);
    }

    // reset
    setAmount("");
    setDate("");

    // refresh month list
    setMonths(getAllMonths());
  };

  // DELETE
  const deleteExpense = (id) => {
    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};

    data[selectedMonth].expenses =
      data[selectedMonth].expenses.filter(e => e.id !== id);

    localStorage.setItem("monthlyData", JSON.stringify(data));

    setExpenses([...data[selectedMonth].expenses]);
  };

  return (
    <div className="p-6">

      <h2 className="text-3xl font-bold mb-4">Expense Manager</h2>

      {/* MONTH DROPDOWN */}
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="mb-6 p-2 border rounded"
      >
        {!months.includes(getMonth()) && (
          <option value={getMonth()}>
            {formatMonth(getMonth())}
          </option>
        )}

        {months.map(m => (
          <option key={m} value={m}>
            {formatMonth(m)}
          </option>
        ))}
      </select>

      {/* ADD EXPENSE */}
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

        <button
          onClick={addExpense}
          className="bg-blue-600 text-white px-6 rounded"
        >
          Add
        </button>

      </div>

      {/* LIST */}
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
              <button
                onClick={() => deleteExpense(e.id)}
                className="ml-4 text-red-500"
              >
                Delete
              </button>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Expenses;