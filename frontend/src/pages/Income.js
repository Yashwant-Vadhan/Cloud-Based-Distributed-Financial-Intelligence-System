import { useState, useEffect } from "react";
import { getMonth } from "../utils/month";

function Income() {
  const [income, setIncome] = useState(0);
  const [inputIncome, setInputIncome] = useState("");
  const [incomeSource, setIncomeSource] = useState("Salary");
  const [customSource, setCustomSource] = useState("");
  const [incomeHistory, setIncomeHistory] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // Edit state for income
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [editIncomeAmount, setEditIncomeAmount] = useState("");
  const [editIncomeSource, setEditIncomeSource] = useState("");

  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL;
  const month = getMonth();

  const fetchIncomeData = async () => {
    const token = localStorage.getItem("token");
    try {
      const incomeRes = await fetch(`${EXPENSE_API}/api/income/${month}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const incomeData = await incomeRes.json();
      setIncome(incomeData.income || 0);
      setIncomeHistory(incomeData.incomeHistory || []);
    } catch (err) {
      console.error("Income data fetch error:", err);
    }
  };

  useEffect(() => {
    fetchIncomeData();
  }, [EXPENSE_API]);

  const handleAddIncome = async () => {
    if (!inputIncome || isNaN(inputIncome)) return;
    
    const token = localStorage.getItem("token");
    const finalSource = incomeSource === "Other" ? (customSource || "Other") : incomeSource;
    const newAmount = Number(inputIncome);
    const date = new Date().toLocaleDateString();

    try {
      const response = await fetch(`${EXPENSE_API}/api/income/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount: newAmount, source: finalSource, date, month }),
      });

      if (response.ok) {
        fetchIncomeData();
        setInputIncome("");
        setCustomSource("");
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      alert("Error adding income");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddIncome();
    }
  };

  const deleteIncome = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${EXPENSE_API}/api/income/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const updatedHistory = incomeHistory.filter(item => item._id !== id);
        const entryToDelete = incomeHistory.find(item => item._id === id);
        setIncome(income - (entryToDelete?.amount || 0));
        setIncomeHistory(updatedHistory);
      }
    } catch (err) {
      alert("Error deleting income");
    }
  };

  const startEditIncome = (item) => {
    setEditingIncomeId(item._id);
    setEditIncomeAmount(item.amount);
    setEditIncomeSource(item.source);
  };

  const cancelEditIncome = () => {
    setEditingIncomeId(null);
    setEditIncomeAmount("");
    setEditIncomeSource("");
  };

  const saveEditIncome = async (id) => {
    const token = localStorage.getItem("token");
    const item = incomeHistory.find(i => i._id === id);
    try {
      const response = await fetch(`${EXPENSE_API}/api/income/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(editIncomeAmount),
          source: editIncomeSource,
          date: item.date
        }),
      });

      if (response.ok) {
        fetchIncomeData();
        setEditingIncomeId(null);
      }
    } catch (err) {
      alert("Error updating income");
    }
  };

  return (
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto relative">
      {showToast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2 transform transition-all duration-300 ease-in-out font-medium">
          <span>✅</span> Income Added Successfully!
        </div>
      )}

      <h2 className="text-3xl font-bold mb-4">Income Manager</h2>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Total Income Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500 w-full lg:w-1/3 flex flex-col justify-center">
          <h3 className="text-gray-500">Total Income (This Month)</h3>
          <p className="text-2xl font-bold text-green-600">₹{income}</p>
        </div>

        {/* Add Income Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg w-full lg:w-2/3">
          <h3 className="text-lg font-semibold mb-2">Add Income Source</h3>
          <div className="flex flex-wrap gap-3">
            <input
              type="number"
              value={inputIncome}
              onChange={(e) => setInputIncome(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Amount ₹"
              className="border p-2 rounded-lg flex-1 min-w-[120px]"
            />
            
            <select 
              value={incomeSource}
              onChange={(e) => setIncomeSource(e.target.value)}
              className="border p-2 rounded-lg bg-white"
            >
              <option value="Salary">Salary</option>
              <option value="Gift">Gift</option>
              <option value="Loan">Loan</option>
              <option value="Freelance">Freelance</option>
              <option value="Investment">Investment</option>
              <option value="Other">Other</option>
            </select>

            {incomeSource === "Other" && (
              <input
                type="text"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Specify Type (e.g. Bonus)"
                className="border p-2 rounded-lg flex-1 min-w-[150px]"
              />
            )}

            <button onClick={handleAddIncome} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Income Ledger */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">Income Ledger</h3>
        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="border-b text-gray-600">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {incomeHistory.length > 0 ? (
                [...incomeHistory].reverse().map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{item.date}</td>
                    <td className="py-3 px-4">
                      {editingIncomeId === item._id ? (
                        <select
                          value={editIncomeSource}
                          onChange={(e) => setEditIncomeSource(e.target.value)}
                          className="border p-1 rounded bg-white text-sm"
                        >
                          <option value="Salary">Salary</option>
                          <option value="Gift">Gift</option>
                          <option value="Loan">Loan</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Investment">Investment</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                          {item.source}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                      {editingIncomeId === item._id ? (
                        <input
                          type="number"
                          value={editIncomeAmount}
                          onChange={(e) => setEditIncomeAmount(e.target.value)}
                          className="border p-1 rounded w-24 text-right text-sm"
                        />
                      ) : (
                        `+₹${item.amount}`
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editingIncomeId === item._id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => saveEditIncome(item._id)}
                            className="text-green-600 hover:text-green-800 font-bold px-2 py-1 transition-colors"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditIncome}
                            className="text-gray-500 hover:text-gray-700 font-bold px-2 py-1 transition-colors"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEditIncome(item)}
                            className="text-blue-500 hover:text-blue-700 font-bold px-2 py-1 transition-colors"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button 
                            onClick={() => deleteIncome(item._id)}
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
                    No income records found
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

export default Income;
