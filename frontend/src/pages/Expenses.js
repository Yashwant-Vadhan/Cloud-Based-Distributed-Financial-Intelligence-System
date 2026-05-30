import { useState, useEffect, useCallback } from "react";

function Expenses() {
  const [expense, setExpense] = useState(0);
  const [inputExpense, setInputExpense] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState("");
  const [expenseHistory, setExpenseHistory] = useState([]);

  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear().toString()
  );

  const [selectedMonthNum, setSelectedMonthNum] = useState(
    String(today.getMonth() + 1).padStart(2, "0")
  );

  const selectedMonthStr = `${selectedYear}-${selectedMonthNum}`;

  const EXPENSE_API =
    process.env.REACT_APP_EXPENSE_URL ||
    process.env.REACT_APP_AUTH_URL;

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

  // Safer total calculation (Her improvement)
  const calculateTotal = (history) =>
    history.reduce((sum, item) => sum + Number(item.amount), 0);

  // Load data
  const loadExpenseData = useCallback(async () => {
    try {
      const response = await fetch(
        `${EXPENSE_API}/api/expenses/${selectedMonthStr}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();
      const history = data.expenses || [];

      setExpenseHistory(history);
      setExpense(calculateTotal(history));
    } catch (err) {
      const data =
        JSON.parse(localStorage.getItem("monthlyData")) || {};

      const monthData = data[selectedMonthStr] || { expenses: [] };

      setExpenseHistory(monthData.expenses || []);
      setExpense(calculateTotal(monthData.expenses || []));
    }
  }, [selectedMonthStr, EXPENSE_API, authToken]);

  useEffect(() => {
    loadExpenseData();
  }, [loadExpenseData]);

  const incrementYear = () =>
    setSelectedYear((prev) => (parseInt(prev, 10) + 1).toString());

  const decrementYear = () =>
    setSelectedYear((prev) => (parseInt(prev, 10) - 1).toString());

  // YOUR SMART DATE LOGIC (kept as best UX)
  const handleAddExpense = async () => {
    if (!inputExpense || isNaN(inputExpense)) return;

    let finalDate = date;

    if (!finalDate) {
      const currentActualYearMonth = new Date()
        .toISOString()
        .slice(0, 7);

      if (selectedMonthStr === currentActualYearMonth) {
        finalDate = new Date().toISOString().split("T")[0];
      } else {
        finalDate = `${selectedYear}-${selectedMonthNum}-01`;
      }
    }

    const finalCategory =
      expenseCategory === "Other"
        ? customCategory || "Other"
        : expenseCategory;

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
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newEntry),
      });
    } catch (err) {
      console.log("Offline backup active");
    }

    const data =
      JSON.parse(localStorage.getItem("monthlyData")) || {};

    const monthData = data[targetMonth] || {
      expenses: [],
    };

    const updatedHistory = [
      ...(monthData.expenses || []),
      newEntry,
    ];

    data[targetMonth] = {
      ...monthData,
      expenses: updatedHistory,
      expense: calculateTotal(updatedHistory),
    };

    localStorage.setItem("monthlyData", JSON.stringify(data));

    if (targetMonth === selectedMonthStr) {
      setExpenseHistory(updatedHistory);
      setExpense(calculateTotal(updatedHistory));
    } else {
      loadExpenseData();
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
          Authorization: `Bearer ${authToken}`,
        },
      });
    } catch (err) {
      console.log("Deletion error");
    }

    const data =
      JSON.parse(localStorage.getItem("monthlyData")) || {};

    const currentMonthData = data[selectedMonthStr];
    if (!currentMonthData) return;

    const updatedHistory =
      currentMonthData.expenses.filter(
        (item) => item.id !== id
      );

    data[selectedMonthStr] = {
      ...currentMonthData,
      expenses: updatedHistory,
      expense: calculateTotal(updatedHistory),
    };

    localStorage.setItem("monthlyData", JSON.stringify(data));

    setExpenseHistory(updatedHistory);
    setExpense(calculateTotal(updatedHistory));
  };

  const getActiveMonthLabel = () => {
    const active = monthsList.find(
      (m) => m.value === selectedMonthNum
    );
    return active
      ? `${active.label} ${selectedYear}`
      : selectedMonthStr;
  };

  return (
    <div className="p-6 bg-gray-100 h-[calc(100vh-64px)] overflow-y-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Expense Manager
        </h2>
      </div>

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* TOTAL CARD */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 flex flex-col justify-between h-[140px]">
          <h3 className="text-gray-400 text-sm">
            Total Expenses ({getActiveMonthLabel()})
          </h3>
          <p className="text-3xl font-bold text-red-600">
            ₹{expense}
          </p>
        </div>

        {/* ADD EXPENSE CARD */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 flex flex-col justify-between min-h-[140px]">
          <h3 className="text-gray-800 font-semibold mb-2">
            Add Expense Record
          </h3>

          <div className="flex flex-wrap gap-3 items-center">

            <input
              type="number"
              value={inputExpense}
              onChange={(e) =>
                setInputExpense(e.target.value)
              }
              placeholder="Amount ₹"
              className="border p-2 rounded-lg flex-1 min-w-[120px]"
            />

            <select
              value={expenseCategory}
              onChange={(e) =>
                setExpenseCategory(e.target.value)
              }
              className="border p-2 rounded-lg flex-1 min-w-[120px]"
            >
              <option value="Food">Food</option>
              <option value="Rent">Rent</option>
              <option value="Groceries">Groceries</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">
                Entertainment
              </option>
              <option value="Transportation">
                Transportation
              </option>
              <option value="Other">Other</option>
            </select>

            {expenseCategory === "Other" && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) =>
                  setCustomCategory(e.target.value)
                }
                placeholder="Specify Category"
                className="border p-2 rounded-lg flex-1 min-w-[120px]"
              />
            )}

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded-lg flex-1 min-w-[140px]"
            />

            <button
              onClick={handleAddExpense}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* LEDGER */}
      <div className="bg-white p-6 rounded-xl shadow-md">

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            Expense Ledger
          </h3>

          {/* Month Selector (Her UI style) */}
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border">

            <select
              value={selectedMonthNum}
              onChange={(e) =>
                setSelectedMonthNum(e.target.value)
              }
              className="text-sm p-1"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <div className="flex flex-col">
              <button onClick={incrementYear}>▲</button>
              <button onClick={decrementYear}>▼</button>
            </div>

            <span className="text-blue-600 font-bold">
              {selectedYear}
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-sm text-gray-500">
                <th>Date</th>
                <th>Category</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {expenseHistory.length > 0 ? (
                expenseHistory.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td>{item.date}</td>
                    <td>{item.category}</td>
                    <td className="text-right text-red-600 font-bold">
                      -₹{item.amount}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() =>
                          deleteExpense(item.id)
                        }
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-10 text-gray-400"
                  >
                    No expense records found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

export default Expenses;