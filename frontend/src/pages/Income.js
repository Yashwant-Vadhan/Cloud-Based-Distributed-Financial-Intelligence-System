import { useState, useEffect, useCallback } from "react";

function Income() {
  const [income, setIncome] = useState(0);
  const [inputIncome, setInputIncome] = useState("");
  const [incomeSource, setIncomeSource] = useState("Salary");
  const [customSource, setCustomSource] = useState("");
  const [date, setDate] = useState(""); 
  const [incomeHistory, setIncomeHistory] = useState([]);

  const today = new Date();
  
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());
  const [selectedMonthNum, setSelectedMonthNum] = useState(
    String(today.getMonth() + 1).padStart(2, "0")
  );

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

  const loadIncomeData = useCallback(async () => {
    try {
      const response = await fetch(`${EXPENSE_API}/api/income/${selectedMonthStr}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      setIncome(data.income || 0);
      setIncomeHistory(data.incomeHistory || []);
    } catch (err) {
      const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
      const monthData = data[selectedMonthStr] || { income: 0, incomeHistory: [] };
      setIncome(monthData.income || 0);
      setIncomeHistory(monthData.incomeHistory || []);
    }
  }, [selectedMonthStr, EXPENSE_API, authToken]);

  useEffect(() => {
    loadIncomeData();
  }, [loadIncomeData]);

  const incrementYear = () => setSelectedYear(prev => (parseInt(prev, 10) + 1).toString());
  const decrementYear = () => setSelectedYear(prev => (parseInt(prev, 10) - 1).toString());

  const handleAddIncome = async () => {
    if (!inputIncome || isNaN(inputIncome)) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!date) {
      alert("Please select a date for this income entry.");
      return;
    }
    
    const finalSource = incomeSource === "Other" ? (customSource || "Other") : incomeSource;
    const newAmount = Number(inputIncome);
    
    const newEntry = {
      id: Date.now(),
      date: date, 
      source: finalSource,
      amount: newAmount,
    };

    const targetMonth = date.slice(0, 7);

    try {
      await fetch(`${EXPENSE_API}/api/income/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ ...newEntry, month: targetMonth }),
      });
    } catch (err) {
      console.log("Local fallback executed.");
    }

    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const targetMonthData = data[targetMonth] || { income: 0, expenses: [], incomeHistory: [] };
    const updatedTotalIncome = (targetMonthData.income || 0) + newAmount;
    const updatedHistory = [...(targetMonthData.incomeHistory || []), newEntry];

    data[targetMonth] = { ...targetMonthData, income: updatedTotalIncome, incomeHistory: updatedHistory };
    localStorage.setItem("monthlyData", JSON.stringify(data));

    if (targetMonth === selectedMonthStr) {
      setIncome(updatedTotalIncome);
      setIncomeHistory(updatedHistory);
    } else {
      loadIncomeData();
    }
    
    setInputIncome("");
    setCustomSource("");
    setDate(""); 
  };

  const deleteIncome = async (id) => {
    try {
      await fetch(`${EXPENSE_API}/api/income/${id}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
    } catch (err) {
      console.log("Sync deletion deferral executed.");
    }

    const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
    const currentMonthData = data[selectedMonthStr];
    if (!currentMonthData) return;

    const entryToDelete = currentMonthData.incomeHistory.find((item) => item.id === id);
    if (!entryToDelete) return;

    const updatedHistory = currentMonthData.incomeHistory.filter((item) => item.id !== id);
    const updatedTotalIncome = currentMonthData.income - entryToDelete.amount;

    data[selectedMonthStr] = { ...currentMonthData, income: updatedTotalIncome, incomeHistory: updatedHistory };
    localStorage.setItem("monthlyData", JSON.stringify(data));

    setIncome(updatedTotalIncome);
    setIncomeHistory(updatedHistory);
  };

  const getActiveMonthLabel = () => {
    const active = monthsList.find(m => m.value === selectedMonthNum);
    return active ? `${active.label} ${selectedYear}` : selectedMonthStr;
  };

  return (
    <div className="p-6 bg-gray-100 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Income Manager</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex flex-col justify-between h-[140px]">
          <h3 className="text-gray-400 font-medium text-sm">Total Income ({getActiveMonthLabel()})</h3>
          <p className="text-3xl font-bold text-green-600">₹{income}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 flex flex-col justify-between min-h-[140px]">
          <h3 className="text-gray-800 font-semibold text-base mb-2">Add Income Source</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="number"
              value={inputIncome}
              onChange={(e) => setInputIncome(e.target.value)}
              placeholder="Amount ₹"
              className="border border-gray-300 p-2 rounded-lg flex-1 min-w-[120px] outline-none focus:border-blue-500"
            />

            <select
              value={incomeSource}
              onChange={(e) => setIncomeSource(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg bg-white text-gray-700 outline-none flex-1 min-w-[120px]"
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
                placeholder="Specify Type"
                className="border border-gray-300 p-2 rounded-lg flex-1 min-w-[120px] outline-none"
              />
            )}

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg text-gray-600 outline-none flex-1 min-w-[140px] focus:border-blue-500"
            />

            <button
              onClick={handleAddIncome}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Income Ledger</h3>
          
          <div className="flex items-center gap-2 bg-gray-50 p-1 border border-gray-200 rounded-xl shadow-sm select-none">
            <select
              value={selectedMonthNum}
              onChange={(e) => setSelectedMonthNum(e.target.value)}
              className="p-1.5 bg-transparent font-medium text-gray-700 outline-none cursor-pointer hover:bg-gray-100 rounded-lg text-xs"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <div className="w-[1px] bg-gray-200 h-4 mx-0.5"></div>
            <div className="flex items-center gap-1.5 px-1">
              <span className="font-semibold text-green-600 text-xs w-8 text-center">
                {selectedYear}
              </span>
              <div className="flex flex-col justify-center items-center">
                <button onClick={incrementYear} className="text-gray-400 hover:text-green-600 transition-colors p-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button onClick={decrementYear} className="text-gray-400 hover:text-green-600 transition-colors p-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-400 font-medium text-sm">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Source</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {incomeHistory.length > 0 ? (
                incomeHistory.map((item) => (
                  <tr key={item._id || item.id} className="border-b hover:bg-gray-50 text-gray-700 transition-colors">
                    <td className="py-3 px-4 text-sm">{item.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold uppercase tracking-wider">
                        {item.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      +₹{item.amount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => deleteIncome(item._id || item.id)} className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 text-sm transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400 italic text-sm">
                    No income records found for this month.
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