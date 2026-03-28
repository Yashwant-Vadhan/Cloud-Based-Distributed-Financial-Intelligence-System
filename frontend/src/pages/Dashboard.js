import { useState } from "react";

function Dashboard({ expenses }) {

  const [income, setIncome] = useState(0);
  const [inputIncome, setInputIncome] = useState("");

  // Calculate total expenses automatically
  const totalExpenses = expenses.reduce((total, item) => total + Number(item.amount), 0);

  const savings = income - totalExpenses;

  const addIncome = () => {
    if (inputIncome === "") return;
    setIncome(Number(inputIncome));
    setInputIncome("");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>

      {/* Add Income Box */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 w-1/3">

        <h3 className="text-lg font-semibold mb-2">Enter Your Monthly Income</h3>

        <div className="flex gap-3">
          <input
            value={inputIncome}
            onChange={(e) => setInputIncome(e.target.value)}
            placeholder="Enter Income ₹"
            className="border p-2 rounded-lg w-full"
          />

          <button
            onClick={addIncome}
            className="bg-green-600 text-white px-4 rounded-lg"
          >
            Add
          </button>
        </div>

      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">₹{income}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-500">₹{totalExpenses}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Savings</h3>
          <p className="text-2xl font-bold text-blue-600">₹{savings}</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;