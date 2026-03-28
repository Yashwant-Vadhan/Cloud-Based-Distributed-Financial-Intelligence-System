import { useState } from "react";

function Expenses({ expenses, setExpenses }) {

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");

  // Add Expense
  const addExpense = () => {

    if (amount === "" || date === "") return;

    const newExpense = {
      id: Date.now(),
      date: date,
      category: category,
      amount: Number(amount)
    };

    setExpenses([newExpense, ...expenses]);

    setAmount("");
    setDate("");
  };

  // Delete Expense
  const deleteExpense = (id) => {
    const updated = expenses.filter((exp) => exp.id !== id);
    setExpenses(updated);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-3xl font-bold mb-6">Expense Manager</h2>

      {/* Add Expense Box */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">

        <h3 className="text-xl font-semibold mb-4">Add New Expense</h3>

        <div className="grid grid-cols-4 gap-4">

          {/* Amount */}
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded-lg"
            placeholder="Amount ₹"
          />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded-lg"
          >

            {/* Morning options */}
            <option>Breakfast</option>
            <option>Tea / Coffee</option>
            <option>Snacks</option>

            {/* Main categories */}
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Education</option>
            <option>Medical</option>
            <option>Entertainment</option>
            <option>Groceries</option>
            <option>Recharge / Internet</option>

          </select>

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded-lg"
          />

          {/* Button */}
          <button
            onClick={addExpense}
            className="bg-blue-600 text-white rounded-lg"
          >
            Add Expense
          </button>

        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg">

        <h3 className="text-xl font-semibold mb-4">Recent Expenses</h3>

        <table className="w-full">

          <thead>
            <tr className="text-left border-b">
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {expenses.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-4">
                  No expenses added yet
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="border-b">
                  <td>{exp.date}</td>
                  <td>{exp.category}</td>
                  <td className="text-red-500">₹{exp.amount}</td>
                  <td>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Expenses;