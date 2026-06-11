import { useState, useEffect, useCallback } from "react";
import { ToastContainer, useToast } from "../components/Toast";
import { useLanguage } from "../utils/AppContext";

function Income() {
  const { t } = useLanguage();
  const [income, setIncome] = useState(0);
  const [inputIncome, setInputIncome] = useState("");
  const [incomeSource, setIncomeSource] = useState("Salary");
  const [customSource, setCustomSource] = useState("");
  const [date, setDate] = useState("");
  const [incomeHistory, setIncomeHistory] = useState([]);

  const { toasts, toast, removeToast } = useToast();

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());
  const [selectedMonthNum, setSelectedMonthNum] = useState(
    String(today.getMonth() + 1).padStart(2, "0")
  );

  const selectedMonthStr = `${selectedYear}-${selectedMonthNum}`;
  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL || process.env.REACT_APP_AUTH_URL;
  const authToken = sessionStorage.getItem("token");

  const monthsList = [
    { value: "01", label: t("january") },
    { value: "02", label: t("february") },
    { value: "03", label: t("march") },
    { value: "04", label: t("april") },
    { value: "05", label: t("may") },
    { value: "06", label: t("june") },
    { value: "07", label: t("july") },
    { value: "08", label: t("august") },
    { value: "09", label: t("september") },
    { value: "10", label: t("october") },
    { value: "11", label: t("november") },
    { value: "12", label: t("december") },
  ];

  const getLocalizedSource = (source) => {
    if (!source) return "";
    const key = `cat_${source.toLowerCase()}`;
    const localized = t(key);
    return localized === key ? source : localized;
  };

  // Sort: newest date first; use id as tiebreaker for same-day entries
  const sortNewestFirst = (arr) =>
    [...arr].sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date);
      if (diff !== 0) return diff;
      const aId = a._id || a.id || 0;
      const bId = b._id || b.id || 0;
      return String(bId).localeCompare(String(aId));
    });

  const loadIncomeData = useCallback(async () => {
    try {
      const response = await fetch(`${EXPENSE_API}/api/income/${selectedMonthStr}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      const fetchedIncome = data.income || 0;
      const fetchedHistory = sortNewestFirst(data.incomeHistory || []);

      setIncome(fetchedIncome);
      setIncomeHistory(fetchedHistory);

      // Keep localStorage in sync
      const localData = JSON.parse(localStorage.getItem("monthlyData")) || {};
      localData[selectedMonthStr] = {
        ...localData[selectedMonthStr],
        income: fetchedIncome,
        incomeHistory: fetchedHistory,
      };
      localStorage.setItem("monthlyData", JSON.stringify(localData));
    } catch (err) {
      console.log("Offline mode: loading income data from localStorage.");
      const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
      const monthData = data[selectedMonthStr] || { income: 0, incomeHistory: [] };
      setIncome(monthData.income || 0);
      setIncomeHistory(sortNewestFirst(monthData.incomeHistory || []));
    }
  }, [selectedMonthStr, EXPENSE_API, authToken]);

  useEffect(() => {
    loadIncomeData();
  }, [loadIncomeData]);

  const incrementYear = () => setSelectedYear((prev) => (parseInt(prev, 10) + 1).toString());
  const decrementYear = () => setSelectedYear((prev) => (parseInt(prev, 10) - 1).toString());

  const handleAddIncome = async () => {
    if (!inputIncome || isNaN(inputIncome)) {
      toast.error(t("invalidAmountError"));
      return;
    }
    if (!date) {
      toast.error(t("selectDateError"));
      return;
    }

    const finalSource = incomeSource === "Other" ? customSource || "Other" : incomeSource;
    const newAmount = Number(inputIncome);
    const newEntry = { id: Date.now(), date, source: finalSource, amount: newAmount };
    const targetMonth = date.slice(0, 7);
    let success = false;

    // Optimistic update
    if (targetMonth === selectedMonthStr) {
      setIncome((prev) => prev + newAmount);
      setIncomeHistory((prev) => sortNewestFirst([newEntry, ...prev]));
    }

    try {
      const response = await fetch(`${EXPENSE_API}/api/income/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ ...newEntry, month: targetMonth }),
      });

      if (response.ok) {
        success = true;
        await loadIncomeData();
        toast.success(t("incomeAddedSuccess"));
      } else {
        if (targetMonth === selectedMonthStr) {
          setIncome((prev) => prev - newAmount);
          setIncomeHistory((prev) => prev.filter((i) => i.id !== newEntry.id));
        }
        const errorData = await response.json();
        toast.error(errorData.msg || t("profileSaveFailError"));
      }
    } catch (err) {
      console.log("Offline mode: saving income locally.");
      const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
      const targetMonthData = data[targetMonth] || { income: 0, incomeHistory: [] };
      const updatedTotalIncome = (targetMonthData.income || 0) + newAmount;
      const updatedHistory = sortNewestFirst([...(targetMonthData.incomeHistory || []), newEntry]);

      data[targetMonth] = { ...targetMonthData, income: updatedTotalIncome, incomeHistory: updatedHistory };
      localStorage.setItem("monthlyData", JSON.stringify(data));

      if (targetMonth === selectedMonthStr) {
        setIncome(updatedTotalIncome);
        setIncomeHistory(updatedHistory);
      }
      toast.warning("Saved offline (no internet connection).");
      success = true;
    }

    if (success) {
      setInputIncome("");
      setCustomSource("");
      setDate("");
    }
  };

  const deleteIncome = async (id) => {
    try {
      const response = await fetch(`${EXPENSE_API}/api/income/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        await loadIncomeData();
        toast.success(t("incomeDeleteSuccess"));
      } else {
        const errorData = await response.json();
        toast.error(errorData.msg || t("profileSaveFailError"));
      }
    } catch (err) {
      console.log("Offline mode: deleting income locally.");
      const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
      const currentMonthData = data[selectedMonthStr];
      if (!currentMonthData) return;

      const entryToDelete = currentMonthData.incomeHistory.find((item) => item.id === id);
      if (!entryToDelete) return;

      const updatedHistory = sortNewestFirst(
        currentMonthData.incomeHistory.filter((item) => item.id !== id)
      );
      const updatedTotalIncome = currentMonthData.income - entryToDelete.amount;

      data[selectedMonthStr] = { ...currentMonthData, income: updatedTotalIncome, incomeHistory: updatedHistory };
      localStorage.setItem("monthlyData", JSON.stringify(data));

      setIncome(updatedTotalIncome);
      setIncomeHistory(updatedHistory);
      toast.warning("Deleted offline (no internet connection).");
    }
  };

  const getActiveMonthLabel = () => {
    const active = monthsList.find((m) => m.value === selectedMonthNum);
    return active ? `${active.label} ${selectedYear}` : selectedMonthStr;
  };

  return (
    <div className="p-6 bg-gray-100 h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-y-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{t("income")}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Income card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex flex-col justify-between h-[140px]">
          <h3 className="text-gray-400 font-medium text-sm">{t("totalIncome")} ({getActiveMonthLabel()})</h3>
          <p className="text-3xl font-bold text-green-600">₹{income}</p>
        </div>

        {/* Add Income card */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2 flex flex-col justify-between min-h-[140px]">
          <h3 className="text-gray-800 font-semibold text-base mb-2">{t("addIncome")}</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="number"
              value={inputIncome}
              onChange={(e) => setInputIncome(e.target.value)}
              placeholder={t("amountPlaceholder")}
              className="border border-gray-300 p-2 rounded-lg flex-1 min-w-[120px] outline-none bg-white text-gray-700 focus:border-blue-500"
            />
            <select
              value={incomeSource}
              onChange={(e) => setIncomeSource(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg bg-white text-gray-700 outline-none flex-1 min-w-[120px]"
            >
              <option value="Salary">{t("cat_salary")}</option>
              <option value="Gift">{t("cat_gift")}</option>
              <option value="Loan">{t("cat_loan")}</option>
              <option value="Freelance">{t("cat_freelance")}</option>
              <option value="Investment">{t("cat_investment")}</option>
              <option value="Other">{t("cat_other")}</option>
            </select>

            {incomeSource === "Other" && (
              <input
                type="text"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                placeholder={t("specifyType")}
                className="border border-gray-300 p-2 rounded-lg flex-1 min-w-[120px] outline-none bg-white text-gray-700"
              />
            )}

            <input
              type="date"
              placeholder="dd-mm-yyyy"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`border border-gray-300 p-2 rounded-lg outline-none flex-1 min-w-[160px] text-gray-700 bg-white focus:border-blue-500${date ? " has-value" : ""}`}
            />

            <button
              onClick={handleAddIncome}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              {t("addButton")}
            </button>
          </div>
        </div>
      </div>

      {/* Income Ledger */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{t("ledgerIncome")}</h3>

          {/* Month / Year picker */}
          <div className="flex items-center gap-2 bg-gray-50 p-1 border border-gray-200 rounded-xl shadow-sm select-none">
            <select
              value={selectedMonthNum}
              onChange={(e) => setSelectedMonthNum(e.target.value)}
              className="p-1.5 bg-transparent font-medium text-gray-700 outline-none cursor-pointer hover:bg-gray-100 rounded-lg text-xs"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <div className="w-[1px] bg-gray-200 h-4 mx-0.5"></div>
            <div className="flex items-center gap-1.5 px-1">
              <span className="font-semibold text-green-600 text-xs w-8 text-center">{selectedYear}</span>
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
                <th className="py-3 px-4 font-semibold">{t("dateCol")}</th>
                <th className="py-3 px-4 font-semibold">{t("categoryCol")}</th>
                <th className="py-3 px-4 font-semibold text-right">{t("amountCol")}</th>
                <th className="py-3 px-4 font-semibold text-center">{t("actionCol")}</th>
              </tr>
            </thead>
            <tbody>
              {incomeHistory.length > 0 ? (
                incomeHistory.map((item) => (
                  <tr key={item._id || item.id} className="border-b hover:bg-gray-50 text-gray-700 transition-colors">
                    <td className="py-3 px-4 text-sm">{item.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold uppercase tracking-wider">
                        {getLocalizedSource(item.source)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      +₹{item.amount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                         onClick={() => deleteIncome(item._id || item.id)}
                         className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 text-sm transition-colors"
                      >
                        {t("deleteButton")}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400 italic text-sm">
                    {t("noIncomeFound")}
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