import { useState, useEffect } from "react";

function Income() {
  const [income, setIncome] = useState(0);
  const [inputIncome, setInputIncome] = useState("");
  const [incomeSource, setIncomeSource] = useState("Salary");
  const [customSource, setCustomSource] = useState("");
  const [date, setDate] = useState(""); 
  const [incomeHistory, setIncomeHistory] = useState([]);

  // Get current real-time calendar anchors
  const today = new Date();
  
  // Year is now a standard numeric string that can be scrolled up/down indefinitely
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());
  const [selectedMonthNum, setSelectedMonthNum] = useState(
    String(today.getMonth() + 1).padStart(2, "0")
  );

  // Combine them to maintain state sync format "YYYY-MM"
  const selectedMonthStr = `${selectedYear}-${selectedMonthNum}`;

  const AUTH_API = process.env.REACT_APP_AUTH_URL;

  // Static 12-month layout array configuration
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

  // Fetch data records on cluster view boundary changes
  useEffect(() => {
    const loadIncomeData = async () => {
      try {
        const response = await fetch(`${AUTH_API}/api/dashboard/${selectedMonthStr}`);
        const data = await response.json();
        setIncome(data.income || 0);
        setIncomeHistory(data.incomeHistory || []);
      } catch (err) {
        // LocalStorage context recovery fallback
        const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
        const monthData = data[selectedMonthStr] || { income: 0, incomeHistory: [] };
        setIncome(monthData.income || 0);
        setIncomeHistory(monthData.incomeHistory || []);
      }
    };
    loadIncomeData();
  }, [selectedMonthStr, AUTH_API]);

  // Scroller step adjustment functions (Up/Down custom pointers)
  const incrementYear = () => {
    setSelectedYear(prev => (parseInt(prev, 10) + 1).toString());
  };

  const decrementYear = () => {
    setSelectedYear(prev => (parseInt(prev, 10) - 1).toString());
  };

  const handleAddIncome = async () => {
    if (!inputIncome || isNaN(inputIncome)) return;

    let finalDate = date;
    
    // Auto-fallback calculation logic matching screen controller state
    if (!finalDate) {
      const currentActualYearMonth = new Date().toISOString().split('T')[0].slice(0, 7);

      if (selectedMonthStr === currentActualYearMonth) {
        finalDate = new Date().toISOString().split('T')[0];
      } else {
        finalDate = `${selectedYear}-${selectedMonthNum}-01`;
      }
    }
    
    const finalSource = incomeSource === "Other" ? (customSource || "Other") : incomeSource;
    const newAmount = Number(inputIncome);
    
    const newEntry = {
      id: Date.now(),
      date: finalDate, 
      source: finalSource,
      amount: newAmount,
    };

    const targetMonth = finalDate.slice(0, 7);

    try {
      await fetch(`${AUTH_API}/api/income`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEntry, month: targetMonth }),
      });
    } catch (err) {
      console.log("Local cluster fallback backup run.");
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
    }
    
    setInputIncome("");
    setCustomSource("");
    setDate(""); 
  };

  const deleteIncome = async (id) => {
    try {
      await fetch(`${AUTH_API}/api/income/${id}`, { method: "DELETE" });
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
      
      {/* Header and Refactored Scroller Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Income Manager</h2>
        
        {/* Unified Flex Nav Box Controls */}
        <div className="flex items-center gap-2 bg-white p-1.5 border border-gray-200 rounded-xl shadow-sm select-none">
          {/* Month Menu Select */}
          <select
            value={selectedMonthNum}
            onChange={(e) => setSelectedMonthNum(e.target.value)}
            className="p-2 bg-transparent font-medium text-gray-700 outline-none cursor-pointer hover:bg-gray-50 rounded-lg text-sm"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Vertical Divider */}
          <div className="w-[1px] bg-gray-200 h-6 mx-1"></div>

          {/* Custom Year Scroller Box with Up/Down buttons */}
          <div className="flex items-center gap-1.5 px-2">
            <span className="font-semibold text-blue-600 text-sm w-10 text-center">
              {selectedYear}
            </span>
            <div className="flex flex-col justify-center items-center -gap-0.5">
              {/* Up Pointer Button */}
              <button 
                onClick={incrementYear}
                className="text-gray-400 hover:text-blue-600 transition-colors p-0.5"
                title="Increment Year"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              {/* Down Pointer Button */}
              <button 
                onClick={decrementYear}
                className="text-gray-400 hover:text-blue-600 transition-colors p-0.5"
                title="Decrement Year"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Section Dashboard */}
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

      {/* Ledger Table Layout */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Income Ledger</h3>
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
                  <tr key={item.id} className="border-b hover:bg-gray-50 text-gray-700 transition-colors">
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
                      <button
                        onClick={() => deleteIncome(item.id)}
                        className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 text-sm transition-colors"
                      >
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