import { useState, useEffect, useCallback } from "react";
import { ToastContainer, useToast } from "../components/Toast";
import { useLanguage } from "../utils/AppContext";

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
};

function Expenses() {
  const { t } = useLanguage();
  const [expense, setExpense] = useState(0);
  const [inputExpense, setInputExpense] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState("");
  const [expenseHistory, setExpenseHistory] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);

  const { toasts, toast, removeToast } = useToast();

  // Sort: newest date first; tiebreak by id for same-day entries
  const sortNewestFirst = (arr) =>
    [...arr].sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date);
      if (diff !== 0) return diff;
      const aId = a._id || a.id || 0;
      const bId = b._id || b.id || 0;
      return String(bId).localeCompare(String(aId));
    });

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

  const getLocalizedCategory = (cat) => {
    if (!cat) return "";
    const key = `cat_${cat.toLowerCase()}`;
    const localized = t(key);
    return localized === key ? cat : localized;
  };

  const calculateTotal = (history) => history.reduce((sum, item) => sum + Number(item.amount), 0);

  const loadExpenseData = useCallback(async () => {
    try {
      const response = await fetch(`${EXPENSE_API}/api/expenses/${selectedMonthStr}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      const history = data.expenses || [];
      const sortedHistory = sortNewestFirst(history);
      const computedTotal = calculateTotal(sortedHistory);

      setExpenseHistory(sortedHistory);
      setExpense(computedTotal);

      // Keep localStorage in sync
      const localData = JSON.parse(localStorage.getItem("monthlyData")) || {};
      localData[selectedMonthStr] = {
        ...localData[selectedMonthStr],
        expense: computedTotal,
        expenses: sortedHistory
      };
      localStorage.setItem("monthlyData", JSON.stringify(localData));
    } catch (err) {
      console.log("Offline mode: loading expense data from localStorage.");
      const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
      const monthData = data[selectedMonthStr] || { expense: 0, expenses: [] };
      const sortedHistory = sortNewestFirst(monthData.expenses || []);
      setExpenseHistory(sortedHistory);
      setExpense(monthData.expense || 0);
    }
  }, [selectedMonthStr, EXPENSE_API, authToken]);

  useEffect(() => {
    loadExpenseData();
  }, [loadExpenseData]);

  const incrementYear = () => setSelectedYear(prev => (parseInt(prev, 10) + 1).toString());
  const decrementYear = () => setSelectedYear(prev => (parseInt(prev, 10) - 1).toString());

  const handleAddExpense = async () => {
    if (!inputExpense || isNaN(inputExpense)) {
      toast.error(t("invalidAmountError"));
      return;
    }
    if (!date) {
      toast.error(t("selectDateError"));
      return;
    }

    const finalCategory = expenseCategory === "Other" ? (customCategory || "Other") : expenseCategory;
    const newAmount = Number(inputExpense);
    const newEntry = { id: Date.now(), date, category: finalCategory, amount: newAmount };
    const targetMonth = date.slice(0, 7);
    let success = false;

    // Optimistic update
    if (targetMonth === selectedMonthStr) {
      setExpense((prev) => prev + newAmount);
      setExpenseHistory((prev) => sortNewestFirst([newEntry, ...prev]));
    }

    try {
      const response = await fetch(`${EXPENSE_API}/api/expenses/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ ...newEntry, month: targetMonth }),
      });

      if (response.ok) {
        success = true;
        await loadExpenseData();
        toast.success(t("expenseAddedSuccess"));
      } else {
        if (targetMonth === selectedMonthStr) {
          setExpense((prev) => prev - newAmount);
          setExpenseHistory((prev) => prev.filter((i) => i.id !== newEntry.id));
        }
        const errorData = await response.json();
        toast.error(errorData.msg || t("profileSaveFailError"));
      }
    } catch (err) {
      console.log("Network error: executing local offline fallback for adding expense.");
      const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
      const targetMonthData = data[targetMonth] || { expenses: [] };
      const updatedHistory = [...(targetMonthData.expenses || []), newEntry];

      data[targetMonth] = { ...targetMonthData, expenses: updatedHistory, expense: calculateTotal(updatedHistory) };
      localStorage.setItem("monthlyData", JSON.stringify(data));

      if (targetMonth === selectedMonthStr) {
        setExpenseHistory(sortNewestFirst(updatedHistory));
        setExpense(calculateTotal(updatedHistory));
      }
      toast.warning("Saved offline (no internet connection).");
      success = true;
    }

    if (success) {
      setInputExpense("");
      setCustomCategory("");
      setDate("");
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense.amount || isNaN(editingExpense.amount)) {
      toast.error(t("invalidAmountError"));
      return;
    }
    if (!editingExpense.date) {
      toast.error(t("selectDateError"));
      return;
    }

    const finalCategory = editingExpense.category === "Other" ? (editingExpense.customCategory || "Other") : editingExpense.category;
    const updatedEntry = {
      ...editingExpense,
      amount: Number(editingExpense.amount),
      category: finalCategory
    };
    const targetMonth = updatedEntry.date.slice(0, 7);
    
    // We don't do complex optimistic updates across months here for simplicity,
    // we just wait for the API and reload.
    
    try {
      const response = await fetch(`${EXPENSE_API}/api/expenses/${updatedEntry._id || updatedEntry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(updatedEntry),
      });

      if (response.ok) {
        await loadExpenseData();
        toast.success("Expense updated successfully");
        setEditingExpense(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.msg || "Failed to update expense");
      }
    } catch (err) {
      console.log("Network error: executing local offline fallback for updating expense.");
      const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
      
      // Update in the specific month it belongs to
      const monthData = data[targetMonth] || { expenses: [] };
      const updatedHistory = monthData.expenses.map(item => 
        (item._id || item.id) === (updatedEntry._id || updatedEntry.id) ? updatedEntry : item
      );
      
      data[targetMonth] = { 
        ...monthData, 
        expenses: updatedHistory, 
        expense: calculateTotal(updatedHistory) 
      };
      localStorage.setItem("monthlyData", JSON.stringify(data));

      if (targetMonth === selectedMonthStr) {
        setExpenseHistory(sortNewestFirst(updatedHistory));
        setExpense(calculateTotal(updatedHistory));
      } else {
        // If they changed the date to a different month, reload data to reflect the current month's view
        await loadExpenseData();
      }
      toast.warning("Updated offline (no internet connection).");
      setEditingExpense(null);
    }
  };

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`${EXPENSE_API}/api/expenses/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        await loadExpenseData();
        toast.success(t("expenseDeleteSuccess"));
      } else {
        const errorData = await response.json();
        toast.error(errorData.msg || t("profileSaveFailError"));
      }
    } catch (err) {
      console.log("Network error: executing local offline fallback for deleting expense.");
      const data = JSON.parse(localStorage.getItem("monthlyData")) || {};
      const currentMonthData = data[selectedMonthStr];
      if (!currentMonthData) return;

      const updatedHistory = currentMonthData.expenses.filter((item) => item.id !== id);
      data[selectedMonthStr] = { ...currentMonthData, expenses: updatedHistory, expense: calculateTotal(updatedHistory) };
      localStorage.setItem("monthlyData", JSON.stringify(data));

      setExpenseHistory(updatedHistory);
      setExpense(calculateTotal(updatedHistory));
      toast.warning("Deleted offline (no internet connection).");
    }
  };

  const getActiveMonthLabel = () => {
    const active = monthsList.find(m => m.value === selectedMonthNum);
    return active ? `${active.label} ${selectedYear}` : selectedMonthStr;
  };

  return (
    <div className="p-4 sm:p-6 h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{t("expenses")}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="p-5 rounded-xl shadow-md border-l-4 border-red-500 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-surface)', minHeight: '120px' }}>
          <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>{t("totalExpenses")} ({getActiveMonthLabel()})</h3>
          <p className="text-3xl font-bold text-red-500">₹{expense}</p>
        </div>

        <div className="p-5 rounded-xl shadow-md lg:col-span-2 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-surface)', minHeight: '120px' }}>
          <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--text-primary)' }}>{t("addExpense")}</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <input type="number" value={inputExpense} onChange={(e) => setInputExpense(e.target.value)} placeholder={t("amountPlaceholder")} className="themed-input border p-2 rounded-lg flex-1 min-w-[120px] outline-none" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} />
            <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className="themed-input border p-2 rounded-lg outline-none flex-1 min-w-[120px]" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
              <option value="Food">{t("cat_food")}</option>
              <option value="Groceries">{t("cat_groceries")}</option>
              <option value="Healthcare">{t("cat_healthcare")}</option>
              <option value="Education">{t("cat_education")}</option>
              <option value="Rent">{t("cat_rent")}</option>
              <option value="Utilities">{t("cat_utilities")}</option>
              <option value="Entertainment">{t("cat_entertainment")}</option>
              <option value="Transportation">{t("cat_transportation")}</option>
              <option value="Other">{t("cat_other")}</option>
            </select>
            {expenseCategory === "Other" && <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder={t("specifyCategory")} className="themed-input border p-2 rounded-lg flex-1 min-w-[120px] outline-none" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} />}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`themed-input border p-2 rounded-lg outline-none flex-1 min-w-[150px]${date ? " has-value" : ""}`}
              style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            />
            <button onClick={handleAddExpense} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors whitespace-nowrap">{t("addButton")}</button>
          </div>
        </div>
      </div>

      <div className="rounded-xl shadow-md" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex flex-wrap justify-between items-center gap-3 p-4 sm:p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t("ledgerExpense")}</h3>
          <div className="flex items-center gap-2 p-1 border rounded-xl shadow-sm select-none" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
            <select value={selectedMonthNum} onChange={(e) => setSelectedMonthNum(e.target.value)} className="p-1.5 bg-transparent font-medium outline-none cursor-pointer rounded-lg text-xs" style={{ color: 'var(--text-primary)' }}>
              {monthsList.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <div className="w-[1px] h-4 mx-0.5" style={{ backgroundColor: 'var(--border-color)' }}></div>
            <div className="flex items-center gap-1.5 px-1">
              <span className="font-semibold text-xs w-8 text-center" style={{ color: 'var(--color-primary)' }}>{selectedYear}</span>
              <div className="flex flex-col">
                <button onClick={incrementYear} style={{ color: 'var(--text-muted)' }} className="hover:opacity-80"><svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 15l7-7 7 7" /></svg></button>
                <button onClick={decrementYear} style={{ color: 'var(--text-muted)' }} className="hover:opacity-80"><svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M19 9l-7 7-7-7" /></svg></button>
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
                {expenseHistory.length > 0 ? expenseHistory.map((item) => (
                  <tr key={item._id || item.id} className="border-b transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">{formatDisplayDate(item.date)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-xs font-semibold uppercase">
                        {getLocalizedCategory(item.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-red-500 whitespace-nowrap">-₹{item.amount}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button onClick={() => setEditingExpense({ ...item, customCategory: "" })} className="text-blue-400 hover:text-blue-600 mr-3" title={t("editButton") || "Edit"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => deleteExpense(item._id || item.id)} className="text-red-400 hover:text-red-600" title={t("deleteButton") || "Delete"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" className="py-12 text-center italic text-sm" style={{ color: 'var(--text-muted)' }}>{t("noExpensesFound")}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="p-6 rounded-2xl shadow-2xl max-w-md w-full border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Edit Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Amount</label>
                <input
                  type="number"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                  className="themed-input w-full border p-2 rounded-lg outline-none"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <select
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                  className="themed-input w-full border p-2 rounded-lg outline-none"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                >
                  <option value="Food">{t("cat_food")}</option>
                  <option value="Groceries">{t("cat_groceries")}</option>
                  <option value="Healthcare">{t("cat_healthcare")}</option>
                  <option value="Education">{t("cat_education")}</option>
                  <option value="Rent">{t("cat_rent")}</option>
                  <option value="Utilities">{t("cat_utilities")}</option>
                  <option value="Entertainment">{t("cat_entertainment")}</option>
                  <option value="Transportation">{t("cat_transportation")}</option>
                  <option value="Other">{t("cat_other")}</option>
                </select>
              </div>
              {editingExpense.category === "Other" && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Specify Category</label>
                  <input
                    type="text"
                    value={editingExpense.customCategory || ""}
                    onChange={(e) => setEditingExpense({ ...editingExpense, customCategory: e.target.value })}
                    className="themed-input w-full border p-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
                <input
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                  className={`themed-input w-full border p-2 rounded-lg outline-none${editingExpense.date ? " has-value" : ""}`}
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingExpense(null)}
                className="px-4 py-2 rounded-lg font-medium transition-colors border"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateExpense}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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

export default Expenses;