import { useEffect, useState, useCallback, useRef } from "react";
import { ToastContainer, useToast } from "../components/Toast";

/* ─── helpers ─────────────────────────────────────────────── */
const pad2 = (n) => String(n).padStart(2, "0");
const toYMD = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toYM  = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { start: mon, end: sun };
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

function getMonthsInRange(start, end) {
  const months = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push(toYM(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

function formatRangeLabel(start, end) {
  const opts = { day: "numeric", month: "short", year: "numeric" };
  return `${start.toLocaleDateString("en-IN", opts)} – ${end.toLocaleDateString("en-IN", opts)}`;
}

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getLocalDateString = (dateInput) => {
  if (!dateInput) return "";
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch (err) {
    return "";
  }
};

/* ─── component ───────────────────────────────────────────── */
export default function Predictions() {
  const ML_API      = process.env.REACT_APP_ML_URL;
  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL;

  const today = new Date();
  const todayStr = toYMD(today);

  const [filterMode,  setFilterMode]  = useState("month");   // week | month | custom
  const [customFrom,  setCustomFrom]  = useState("");
  const [customTo,    setCustomTo]    = useState("");
  const [loading,     setLoading]     = useState(false);
  const [aiData,      setAiData]      = useState(null);
  const [rangeLabel,  setRangeLabel]  = useState("");
  const [hasRun,      setHasRun]      = useState(false);

  const { toasts, toast, removeToast } = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  /* ── core analysis function ─────────────────────────────── */
  const runAnalysis = useCallback(async (range) => {
    if (!range) return;
    setLoading(true);
    setHasRun(true);
    setRangeLabel(formatRangeLabel(range.start, range.end));

    const token  = sessionStorage.getItem("token");
    const months = getMonthsInRange(range.start, range.end);
    const fromStr = toYMD(range.start);
    const toStr   = toYMD(range.end);

    let totalIncome = 0;
    let allExpenses = [];

    // ── STEP 1: Fetch income & expense data ──────────────────
    try {
      await Promise.all(
        months.map(async (month) => {
          const [incRes, expRes] = await Promise.all([
            fetch(`${EXPENSE_API}/api/income/${month}`,   { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${EXPENSE_API}/api/expenses/${month}`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          const incData = await incRes.json();
          const expData = await expRes.json();

          const filteredInc = (incData.incomeHistory || []).filter((e) => {
            const eDateStr = getLocalDateString(e.date);
            if (!eDateStr) return true;
            return eDateStr >= fromStr && eDateStr <= toStr;
          });
          const filteredExp = (expData.expenses || []).filter((e) => {
            const eDateStr = getLocalDateString(e.date);
            if (!eDateStr) return true;
            return eDateStr >= fromStr && eDateStr <= toStr;
          });

          totalIncome += filteredInc.reduce((s, e) => s + Number(e.amount), 0);
          allExpenses.push(...filteredExp);
        })
      );
    } catch (fetchErr) {
      console.warn("Data fetch error:", fetchErr);
      // Continue with whatever data we got — don't abort
    }

    const totalExpense = allExpenses.reduce((s, e) => s + Number(e.amount), 0);

    // Build category map for ML
    const categoryMap = { food: 0, travel: 0, entertainment: 0, rent: 0 };
    allExpenses.forEach((e) => {
      const cat = (e.category || "").toLowerCase();
      if      (["food", "groceries"].includes(cat))              categoryMap.food          += Number(e.amount);
      else if (["travel", "transportation"].includes(cat))       categoryMap.travel        += Number(e.amount);
      else if (["entertainment"].includes(cat))                  categoryMap.entertainment += Number(e.amount);
      else if (["rent", "housing", "bills", "utilities", "education"].includes(cat)) categoryMap.rent += Number(e.amount);
    });

    // ── STEP 2: Call ML Service ───────────────────────────────
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const mlRes = await fetch(`${ML_API}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          month:  new Date().getMonth() + 1,
          income: totalIncome,
          ...categoryMap,
        }),
      });
      clearTimeout(timeout);

      if (!mlRes.ok) throw new Error(`ML responded with status ${mlRes.status}`);
      const data = await mlRes.json();

      setAiData({
        nextMonth:       data.nextMonth       ?? Math.round(totalExpense * 1.05),
        savings:         data.savings         ?? Math.round(totalIncome - totalExpense * 1.05),
        alert:           data.alert           || "Analysis complete.",
        detailedSummary: data.detailedSummary || "Your financial data has been analysed successfully.",
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
        riskStatus:      data.riskStatus      || "Safe",
        totalIncome,
        totalExpense,
        entryCount: allExpenses.length,
      });
    } catch (mlErr) {
      // ML service unavailable — show intelligent rule-based fallback
      console.warn("ML service unavailable:", mlErr.message);
      try { toastRef.current?.warning("AI engine offline — using built-in predictive model."); } catch (_) {}

      const predictedExpense = totalExpense > 0 ? Math.round(totalExpense * 1.05) : 0;
      const predictedSavings = Math.round(totalIncome - predictedExpense);
      const ratio = totalIncome > 0 ? (totalExpense / totalIncome) : 0;
      const risk  = ratio < 0.5 ? "Safe" : ratio < 0.8 ? "Warning" : "Critical";

      const summaryLines = [];
      if (totalIncome === 0 && totalExpense === 0) {
        summaryLines.push("No transactions found in the selected period. Add income and expenses to get personalised insights.");
      } else {
        summaryLines.push(`Your total spend is ₹${totalExpense.toLocaleString()} against an income of ₹${totalIncome.toLocaleString()} (${Math.round(ratio * 100)}% spend ratio).`);
        summaryLines.push(risk === "Safe"
          ? "Your finances are in a healthy state. Keep maintaining this discipline."
          : risk === "Warning"
          ? "You are spending a significant portion of your income. Review discretionary categories."
          : "Your expenses are critically high. Immediate cost reduction is recommended.");
        summaryLines.push(`Based on your current trend, next month's expenses are estimated at ₹${predictedExpense.toLocaleString()}.`);
      }

      setAiData({
        nextMonth: predictedExpense,
        savings:   predictedSavings,
        alert: totalExpense === 0
          ? "No expense data found for this period. Start adding expenses to get predictions."
          : ratio < 0.5
          ? "Great discipline! You are spending well within your income."
          : ratio < 0.8
          ? "Moderate spending detected — consider reviewing your variable expenses."
          : "High spend ratio detected — take immediate action to reduce costs.",
        detailedSummary: summaryLines.join(" "),
        recommendations: [
          "Track your daily variable expenses more closely.",
          "Set a monthly budget for each spending category.",
          "Aim to save at least 20% of your income every month.",
        ],
        riskStatus: risk,
        totalIncome,
        totalExpense,
        entryCount: allExpenses.length,
      });
    } finally {
      setLoading(false);
    }
  }, [ML_API, EXPENSE_API]); // eslint-disable-line

  /* ── auto-run on tab change (not custom until user clicks) ─ */
  useEffect(() => {
    if (filterMode === "week")  runAnalysis(getWeekRange());
    if (filterMode === "month") runAnalysis(getMonthRange());
  }, [filterMode]); // eslint-disable-line

  const handleCustomRun = () => {
    if (!customFrom || !customTo) {
      toast.error("Please select both From and To dates.");
      return;
    }
    if (customFrom > customTo) {
      toast.error("'From' date must be before 'To' date.");
      return;
    }
    const start = parseLocalDate(customFrom);
    const end   = parseLocalDate(customTo);
    if (!start || !end) {
      toast.error("Invalid dates selected. Please try again.");
      return;
    }
    runAnalysis({ start, end });
  };

  /* ── risk colours ───────────────────────────────────────── */
  const riskStyles = {
    Critical: { badge: "bg-red-100 text-red-700 border-red-300",    dot: "bg-red-500",   bar: "text-red-600"   },
    Warning:  { badge: "bg-amber-100 text-amber-700 border-amber-300", dot: "bg-amber-500", bar: "text-amber-600" },
    Safe:     { badge: "bg-emerald-100 text-emerald-700 border-emerald-300", dot: "bg-emerald-500", bar: "text-emerald-600" },
    Unknown:  { badge: "bg-gray-100 text-gray-600 border-gray-300",  dot: "bg-gray-400",  bar: "text-gray-500"  },
  };
  const rs = riskStyles[aiData?.riskStatus] || riskStyles.Unknown;

  /* ── tab meta ───────────────────────────────────────────── */
  const tabs = [
    { id: "week",   label: "📅 This Week"  },
    { id: "month",  label: "🗓️ This Month" },
    { id: "custom", label: "🔍 Custom Range" },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] overflow-y-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
            🤖 AI Financial Intelligence
          </h2>
          {rangeLabel && !loading && (
            <p className="text-xs text-gray-500 mt-1 font-medium">Analysing: {rangeLabel}</p>
          )}
        </div>
        {aiData && !loading && (
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${rs.badge}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${rs.dot}`}></span>
            Status: {aiData.riskStatus}
          </div>
        )}
      </div>

      {/* ── Filter Tabs ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Select Analysis Period</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border
                ${filterMode === tab.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-105"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom date pickers */}
        {filterMode === "custom" && (
          <div className="flex flex-wrap gap-3 items-end mt-2 pt-3 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">From</label>
              <input
                type="date"
                value={customFrom}
                max={customTo || todayStr}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">To</label>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={todayStr}
                onChange={(e) => setCustomTo(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              onClick={handleCustomRun}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-md shadow-blue-200"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Analysing...</>
              ) : (
                <><span>⚡</span> Run Analysis</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Loading State ─────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-60 gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-indigo-300 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.7s" }}></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-700 animate-pulse">Running Deep AI Analysis...</p>
            <p className="text-sm text-gray-400 mt-1">Crunching your financial data 🧠</p>
          </div>
        </div>
      )}

      {/* ── Not yet run (custom tab, no result) ───────────── */}
      {!loading && !hasRun && filterMode === "custom" && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <span className="text-5xl">📊</span>
          <p className="text-base font-semibold">Select a date range and click <span className="text-blue-600">Run Analysis</span></p>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────── */}
      {!loading && aiData && (
        <>
          {/* Quick-stat bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Period Income</span>
              <span className="text-xl font-black text-emerald-600">₹{(aiData.totalIncome || 0).toLocaleString()}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Period Expense</span>
              <span className="text-xl font-black text-red-500">₹{(aiData.totalExpense || 0).toLocaleString()}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1 col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transactions</span>
              <span className="text-xl font-black text-blue-600">{aiData.entryCount ?? 0} entries</span>
            </div>
          </div>

          {/* Main forecast cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {/* Next Month Forecast */}
            <div className="group bg-white rounded-2xl shadow-md border-t-4 border-red-500 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📈</span>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next Month Forecast</h3>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-red-600">₹{(aiData.nextMonth || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2 italic">*Based on recent spending velocity</p>
            </div>

            {/* Predicted Savings */}
            <div className="group bg-white rounded-2xl shadow-md border-t-4 border-emerald-500 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💰</span>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Predicted Savings</h3>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600">₹{(aiData.savings || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2 italic">*Projected capital surplus</p>
            </div>

            {/* AI Insight */}
            <div className="group bg-white rounded-2xl shadow-md border-t-4 border-blue-500 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Insight</h3>
              </div>
              <p className="text-base font-bold text-blue-700 leading-snug">{aiData.alert}</p>
            </div>
          </div>

          {/* Deep insights */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-2xl shadow-md border-l-4 border-indigo-500 p-6">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>📊</span> Financial Deep Dive
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">{aiData.detailedSummary}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border-l-4 border-amber-500 p-6">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🎯</span> Strategic Recommendations
              </h3>
              {aiData.recommendations.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No recommendations yet.</p>
              ) : (
                <ul className="space-y-3">
                  {aiData.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-gray-700 text-sm font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="mt-4 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">🤖</div>
          <div>
            <h3 className="text-blue-900 font-bold text-sm mb-1">Financial Intelligence Engine</h3>
            <p className="text-blue-700 text-xs leading-relaxed max-w-2xl">
              Our distributed ML fleet analyses raw categorical metadata across your income vectors and expense horizons.
              By leveraging Groq's high-speed LPU infrastructure and OpenAI's reasoning, we provide predictive liquidity
              modelling to optimise your net worth progression.
            </p>
          </div>
        </div>
      </footer>

      <div className="h-16"></div>
    </div>
  );
}