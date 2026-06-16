import { useState, useEffect, useCallback } from "react";
import { ToastContainer, useToast } from "../components/Toast";
import { useLanguage } from "../utils/AppContext";

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
};

function Income() {
  const { t } = useLanguage();
  const [income, setIncome] = useState(0);
  const [inputIncome, setInputIncome] = useState("");
  const [incomeSource, setIncomeSource] = useState("Salary");
  const [customSource, setCustomSource] = useState("");
  const [date, setDate] = useState("");
  const [incomeHistory, setIncomeHistory] = useState([]);
  const [editingIncome, setEditingIncome] = useState(null);

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

  const handleUpdateIncome = async () => {
    if (!editingIncome.amount || isNaN(editingIncome.amount)) {
      toast.error(t("invalidAmountError"));
      return;
    }
    if (!editingIncome.date) {
      toast.error(t("selectDateError"));
      return;
    }

    const finalSource = editingIncome.source === "Other" ? (editingIncome.customSource || "Other") : editingIncome.source;
    const updatedEntry = {
      ...editingIncome,
      amount: Number(editingIncome.amount),
      source: finalSource
    };
    const targetMonth = updatedEntry.date.slice(0, 7);

    try {
      const response = await fetch(`${EXPENSE_API}/api/income/${updatedEntry._id || updatedEntry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedEntry),
      });

      if (response.ok) {
        await loadIncomeData();
        toast.success("Income updated successfully");
        setEditingIncome(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.msg || "Failed to update income");
      }
    } catch (err) {
      console.log("Offline mode: updating income locally.");
      const data = JSON.parse(localStorage.getItem("monthlyData")) || {};

      const monthData = data[targetMonth] || { income: 0, incomeHistory: [] };
      const updatedHistory = monthData.incomeHistory.map(item =>
        (item._id || item.id) === (updatedEntry._id || updatedEntry.id) ? updatedEntry : item
      );

      const updatedTotalIncome = updatedHistory.reduce((sum, item) => sum + item.amount, 0);

      data[targetMonth] = { ...monthData, income: updatedTotalIncome, incomeHistory: updatedHistory };
      localStorage.setItem("monthlyData", JSON.stringify(data));

      if (targetMonth === selectedMonthStr) {
        setIncome(updatedTotalIncome);
        setIncomeHistory(sortNewestFirst(updatedHistory));
      } else {
        await loadIncomeData();
      }
      toast.warning("Updated offline (no internet connection).");
      setEditingIncome(null);
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
    <div className="p-4 sm:p-6 h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{t("income")}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Total Income card */}
        <div className="p-5 rounded-xl shadow-md border-l-4 border-green-500 flex flex-col justify-center" style={{ backgroundColor: 'var(--bg-surface)', minHeight: '120px' }}>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>{t("totalIncome")} ({getActiveMonthLabel()})</h3>
          <p className="text-3xl font-bold text-green-500 mt-1">₹{income}</p>
        </div>

        {/* Add Income card */}
        <div className="p-5 rounded-xl shadow-md lg:col-span-2 flex flex-col justify-center" style={{ backgroundColor: 'var(--bg-surface)', minHeight: '120px' }}>
          <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--text-primary)' }}>{t("addIncome")}</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
            <input
              type="number"
              value={inputIncome}
              onChange={(e) => setInputIncome(e.target.value)}
              placeholder={t("amountPlaceholder")}
              className="themed-input border p-2 rounded-lg flex-1 w-full outline-none h-11"
              style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            />
            <select
              value={incomeSource}
              onChange={(e) => setIncomeSource(e.target.value)}
              className="themed-input border p-2 rounded-lg outline-none flex-1 w-full h-11"
              style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
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
                className="themed-input border p-2 rounded-lg flex-1 w-full outline-none h-11"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            )}

            <input
              type="date"
              value={date}
              placeholder="dd--mm--yyyy"
              onChange={(e) => setDate(e.target.value)}
              className={`themed-input border p-2 rounded-lg outline-none flex-1 w-full h-11${date ? " has-value" : ""}`}
              style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            />

            <button
              onClick={handleAddIncome}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 rounded-lg transition-colors whitespace-nowrap h-11 w-full sm:w-auto"
            >
              {t("addButton")}
            </button>
          </div>
        </div>
      </div>

      {/* Income Ledger */}
      <div className="rounded-xl shadow-md" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex flex-wrap justify-between items-center gap-3 p-4 sm:p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t("ledgerIncome")}</h3>

          {/* Month / Year picker */}
          <div className="flex items-center gap-2 p-1 border rounded-xl shadow-sm select-none" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
            <select
              value={selectedMonthNum}
              onChange={(e) => setSelectedMonthNum(e.target.value)}
              className="p-1.5 bg-transparent font-medium outline-none cursor-pointer rounded-lg text-xs"
              style={{ color: 'var(--text-primary)' }}
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <div className="w-[1px] h-4 mx-0.5" style={{ backgroundColor: 'var(--border-color)' }}></div>
            <div className="flex items-center gap-1.5 px-1">
              <span className="font-semibold text-xs w-8 text-center" style={{ color: 'var(--color-primary)' }}>{selectedYear}</span>
              <div className="flex flex-col justify-center items-center">
                <button onClick={incrementYear} style={{ color: 'var(--text-muted)' }} className="hover:opacity-80 transition-opacity p-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button onClick={decrementYear} style={{ color: 'var(--text-muted)' }} className="hover:opacity-80 transition-opacity p-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="max-h-[380px] overflow-y-auto ledger-scroll">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
                <tr className="border-b text-sm font-semibold" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th className="py-3 px-4">{t("dateCol")}</th>
                  <th className="py-3 px-4">{t("categoryCol")}</th>
                  <th className="py-3 px-4 text-right">{t("amountCol")}</th>
                  <th className="py-3 px-4 text-center">{t("actionCol")}</th>
                </tr>
              </thead>
              <tbody>
                {incomeHistory.length > 0 ? (
                  incomeHistory.map((item) => (
                    <tr key={item._id || item.id} className="border-b transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">{formatDisplayDate(item.date)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-green-500/10 text-green-500 rounded-md text-xs font-semibold uppercase tracking-wider">
                          {getLocalizedSource(item.source)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-500 whitespace-nowrap">
                        +₹{item.amount}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setEditingIncome({ ...item, customSource: "" })}
                          className="text-blue-400 hover:text-blue-600 px-2 py-1 text-sm transition-colors mr-2"
                          title={t("editButton") || "Edit"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => deleteIncome(item._id || item.id)}
                          className="text-red-400 hover:text-red-600 px-2 py-1 text-sm transition-colors"
                          title={t("deleteButton") || "Delete"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center italic text-sm" style={{ color: 'var(--text-muted)' }}>
                      {t("noIncomeFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="h-20"></div>

      {/* Edit Modal */}
      {editingIncome && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="p-6 rounded-2xl shadow-2xl max-w-md w-full border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Edit Income</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Amount</label>
                <input
                  type="number"
                  value={editingIncome.amount}
                  onChange={(e) => setEditingIncome({ ...editingIncome, amount: e.target.value })}
                  className="themed-input w-full border p-2 rounded-lg outline-none"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Source</label>
                <select
                  value={editingIncome.source}
                  onChange={(e) => setEditingIncome({ ...editingIncome, source: e.target.value })}
                  className="themed-input w-full border p-2 rounded-lg outline-none"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                >
                  <option value="Salary">{t("cat_salary")}</option>
                  <option value="Gift">{t("cat_gift")}</option>
                  <option value="Loan">{t("cat_loan")}</option>
                  <option value="Freelance">{t("cat_freelance")}</option>
                  <option value="Investment">{t("cat_investment")}</option>
                  <option value="Other">{t("cat_other")}</option>
                </select>
              </div>
              {editingIncome.source === "Other" && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Specify Source</label>
                  <input
                    type="text"
                    value={editingIncome.customSource || ""}
                    onChange={(e) => setEditingIncome({ ...editingIncome, customSource: e.target.value })}
                    className="themed-input w-full border p-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
                <input
                  type="date"
                  value={editingIncome.date}
                  placeholder="dd--mm--yyyy"
                  onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
                  className={`themed-input w-full border p-2 rounded-lg outline-none${editingIncome.date ? " has-value" : ""}`}
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingIncome(null)}
                className="px-4 py-2 rounded-lg font-medium transition-colors border"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateIncome}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Income;