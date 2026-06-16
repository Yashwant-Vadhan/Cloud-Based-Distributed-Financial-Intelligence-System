import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ToastContainer, useToast } from "../components/Toast";
import { useLanguage, useChartTheme } from "../utils/AppContext";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";

/* ─── helpers ─────────────────────────────────────────────── */
const pad2 = (n) => String(n).padStart(2, "0");
const toYM  = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

function getMonthsInRange(start, end) {
  const months = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push(toYM(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getLocalDateString = (dateInput) => {
  if (!dateInput) return "";
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch { return ""; }
};

function Analytics() {
  const { t, language } = useLanguage();
  const chartTheme = useChartTheme();
  const [income, setIncome] = useState(0);
  const [incomeHistory, setIncomeHistory] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  // Tab state
  const [filterMode, setFilterMode] = useState("month"); // "month" | "custom"

  // Month/Week state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonthNum, setSelectedMonthNum] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [selectedWeek, setSelectedWeek] = useState("all");

  // Custom date state
  const today = new Date();
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL || process.env.REACT_APP_AUTH_URL;
  const month = `${selectedYear}-${selectedMonthNum}`;
  const { toasts, toast, removeToast } = useToast();

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

  useEffect(() => {
    if (filterMode !== "month") return;
    
    const loadAnalyticsData = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const incomeRes = await fetch(`${EXPENSE_API}/api/income/${month}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const incomeData = await incomeRes.json();
        setIncome(incomeData.income || 0);
        setIncomeHistory(incomeData.incomeHistory || []);

        const expenseRes = await fetch(`${EXPENSE_API}/api/expenses/${month}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const expenseData = await expenseRes.json();
        setExpenses(expenseData.expenses || []);

        setSelectedWeek("all");
      } catch (err) {
        console.error("Analytics data fetch error:", err);
      }
    };
    loadAnalyticsData();
  }, [month, EXPENSE_API, filterMode]);

  // --- CUSTOM RANGE RUN ---
  const handleCustomRun = async () => {
    if (!customFrom || !customTo) {
      toast.error(t("fillAllFieldsError"));
      return;
    }
    if (customFrom > customTo) {
      toast.error(t("cannotConnectServerError") /* date validation fallback */);
      return;
    }

    setLoading(true);
    setHasRun(true);

    const token = sessionStorage.getItem("token");
    const start = parseLocalDate(customFrom);
    const end = parseLocalDate(customTo);
    const months = getMonthsInRange(start, end);

    let totalIncome = 0;
    let allExpenses = [];
    let allIncomeHistory = [];

    try {
      await Promise.all(
        months.map(async (m) => {
          const [incRes, expRes] = await Promise.all([
            fetch(`${EXPENSE_API}/api/income/${m}`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${EXPENSE_API}/api/expenses/${m}`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          const incData = await incRes.json();
          const expData = await expRes.json();

          const filteredInc = (incData.incomeHistory || []).filter((e) => {
            const eDateStr = getLocalDateString(e.date);
            if (!eDateStr) return true;
            return eDateStr >= customFrom && eDateStr <= customTo;
          });
          const filteredExp = (expData.expenses || []).filter((e) => {
            const eDateStr = getLocalDateString(e.date);
            if (!eDateStr) return true;
            return eDateStr >= customFrom && eDateStr <= customTo;
          });

          totalIncome += filteredInc.reduce((s, e) => s + Number(e.amount), 0);
          allExpenses.push(...filteredExp);
          allIncomeHistory.push(...filteredInc);
        })
      );
      
      setIncome(totalIncome);
      setExpenses(allExpenses);
      setIncomeHistory(allIncomeHistory);
    } catch (err) {
      console.error("Custom range fetch error:", err);
      toast.error(t("cannotConnectServerError"));
    } finally {
      setLoading(false);
    }
  };

  // --- CALENDAR LOGIC ---
  const getCalendarWeeks = (monthStr) => {
    const [year, monthIdx] = monthStr.split("-").map(Number);
    const firstDayOfMonth = new Date(year, monthIdx - 1, 1);
    const lastDayOfMonth = new Date(year, monthIdx, 0);

    const localeMap = { en: "en-US", hi: "hi-IN", ta: "ta-IN" };
    const monthName = firstDayOfMonth.toLocaleString(localeMap[language] || "en-US", { month: 'long' });

    const weeks = [];
    let currentStart = new Date(firstDayOfMonth);

    while (currentStart <= lastDayOfMonth) {
      let currentEnd = new Date(currentStart);
      const daysUntilSaturday = 6 - currentEnd.getDay();
      currentEnd.setDate(currentEnd.getDate() + daysUntilSaturday);

      if (currentEnd > lastDayOfMonth) {
        currentEnd = new Date(lastDayOfMonth);
      }

      const formatDay = (d) => String(d.getDate()).padStart(2, '0');

      weeks.push({
        label: `${language === "hi" ? "सप्ताह" : language === "ta" ? "வாரம்" : "Week"} ${weeks.length + 1}: ${monthName} ${formatDay(currentStart)} - ${monthName} ${formatDay(currentEnd)}`,
        start: new Date(currentStart),
        end: new Date(currentEnd)
      });

      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() + 1);
    }
    return weeks;
  };

  const currentWeeks = getCalendarWeeks(month);

  // --- FILTERING LOGIC ---
  const getFilteredData = () => {
    let filtered = expenses;
    if (selectedWeek !== "all") {
      const weekIndex = parseInt(selectedWeek);
      if (!isNaN(weekIndex) && currentWeeks[weekIndex]) {
        const weekObj = currentWeeks[weekIndex];
        filtered = expenses.filter(e => {
          if (!e.date) return false;
          const expenseDate = new Date(e.date);
          expenseDate.setHours(0, 0, 0, 0);
          const start = new Date(weekObj.start).setHours(0, 0, 0, 0);
          const end = new Date(weekObj.end).setHours(0, 0, 0, 0);
          return expenseDate >= start && expenseDate <= end;
        });
      }
    }
    return filtered;
  };

  const filteredExpenses = getFilteredData();
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const savings = income - totalExpenses;

  const downloadCSV = () => {
    if (filteredExpenses.length === 0 && income === 0) {
      toast.warning("No data to download for the selected range.");
      return;
    }

    const lines = [];

    // ── Summary Section ──
    lines.push("--- FINANCIAL SUMMARY ---");
    lines.push(`Total Income (₹),${income}`);
    lines.push(`Total Expenses (₹),${totalExpenses}`);
    lines.push(`Savings / Remaining (₹),${savings}`);
    lines.push("");

    // ── Income Details Section ──
    lines.push("--- INCOME DETAILS ---");
    if (incomeHistory.length > 0) {
      lines.push("Date,Source / Type,Amount (₹)");
      incomeHistory.forEach(e => {
        const src = (e.source || e.type || "Income").replace(/,/g, " ");
        lines.push(`${e.date || ""},${src},${e.amount || 0}`);
      });
    } else {
      lines.push("No income records found for this period.");
    }
    lines.push("");

    // ── Expense Details Section ──
    lines.push("--- EXPENSE DETAILS ---");
    if (filteredExpenses.length > 0) {
      lines.push("Date,Category,Amount (₹),Description");
      filteredExpenses.forEach(e => {
        const cat  = (e.category || "").replace(/,/g, " ");
        const desc = (e.description || "").replace(/,/g, " ");
        lines.push(`${e.date || ""},${cat},${e.amount || 0},"${desc}"`);
      });
    } else {
      lines.push("No expense records found for this period.");
    }

    const csvContent = "data:text/csv;charset=utf-8," + lines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Report_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded!");
  };

  const downloadPDF = async () => {
    const chartIds = [
      { id: "chart-pie",  title: t("expenseVsSavingsChart") },
      { id: "chart-bar",  title: t("dailyBreakdownChart") },
      { id: "chart-line", title: t("trendChart") },
    ];

    const availableCharts = chartIds.filter(c => document.getElementById(c.id));
    if (availableCharts.length === 0) {
      toast.warning("No charts to export. Please run analysis first.");
      return;
    }

    toast.info("Generating PDF — please wait…");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentW = pageW - margin * 2;
    const reportPeriod = filterMode === "custom" ? `${customFrom} to ${customTo}` : month;

    for (let i = 0; i < availableCharts.length; i++) {
      const { id, title } = availableCharts[i];
      const el = document.getElementById(id);
      if (!el) continue;

      if (i > 0) pdf.addPage();

      // ── Header bar ──
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageW, 22, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text("Smart Financial Intelligence System — Analytics Report", margin, 14);

      // ── Chart title ──
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Chart ${i + 1}: ${title}`, margin, 34);

      // ── Subtitle (period) ──
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Period: ${reportPeriod}   |   ${t("totalIncome")}: ₹${income}   |   ${t("totalExpenses")}: ₹${totalExpenses}   |   ${t("savings")}: ₹${savings}`, margin, 41);

      // ── Separator line ──
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 44, pageW - margin, 44);

      // ── Chart image ──
      try {
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const maxImgH = pageH - 70;
        const imgH = Math.min((canvas.height * contentW) / canvas.width, maxImgH);
        pdf.addImage(imgData, "PNG", margin, 48, contentW, imgH);
      } catch (err) {
        pdf.setTextColor(200, 50, 50);
        pdf.text("[Chart could not be rendered]", margin, 60);
      }

      // ── Footer ──
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Page ${i + 1} of ${availableCharts.length}   •   Generated on ${new Date().toLocaleString()}`,
        margin,
        pageH - 8
      );
      pdf.line(margin, pageH - 12, pageW - margin, pageH - 12);
    }

    pdf.save(`Analytics_Charts_${month}.pdf`);
    toast.success("PDF report downloaded!");
  };

  // --- CHART DATA GENERATION ---
  const categoryMap = {};
  filteredExpenses.forEach((e) => {
    if (!e.category) return;
    categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
  });

  const pieData = [
    ...Object.keys(categoryMap).map(key => ({ name: getLocalizedCategory(key), value: categoryMap[key] })),
    { name: t("savings"), value: savings > 0 ? savings : 0 }
  ];

  const totalValue = pieData.reduce((sum, entry) => sum + entry.value, 0);

  const colorMap = {
    "Food": "#4285F4", "Travel": "#AB47BC", "Shopping": "#DB4437",
    "Bills": "#FF7043", "Education": "#F4B400", "Health": "#00ACC1",
    "Entertainment": "#E91E63", "Savings": "#22c55e", "Others": "#FF9800",
  };

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h = ((hash % 360) + 360) % 360;
    return `hsl(${h}, 70%, 50%)`;
  };

  const getColor = (name) => colorMap[name] || stringToColor(name);

  const renderLegendText = (value, entry) => {
    const { payload } = entry;
    const percent = totalValue > 0 ? ((payload.value / totalValue) * 100).toFixed(1) : 0;
    return <span style={{ color: chartTheme.textColor, fontWeight: '500', marginRight: '10px' }}>{`${value}: ${percent}%`}</span>;
  };

  const dateMap = {};
  const allCategories = new Set();
  filteredExpenses.forEach((e) => {
    const d = e.date || "Unknown";
    const c = e.category || "Other";
    allCategories.add(c);
    if (!dateMap[d]) dateMap[d] = { name: d };
    dateMap[d][c] = (dateMap[d][c] || 0) + Number(e.amount);
  });
  const weeklyChartData = Object.values(dateMap).sort((a, b) => {
    if (a.name === "Unknown") return -1;
    if (b.name === "Unknown") return 1;
    return new Date(a.name) - new Date(b.name);
  });
  const categoryList = Array.from(allCategories);

  const trendMap = {};
  filteredExpenses.forEach((e) => {
    const d = e.date || "Unknown";
    trendMap[d] = (trendMap[d] || 0) + Number(e.amount);
  });
  const trendData = Object.keys(trendMap).sort().map((date) => {
    const dailyExpense = trendMap[date];
    const dailyIncomeChunk = income / (Object.keys(trendMap).length || 1);
    return { date, expense: dailyExpense, savings: Math.max(0, dailyIncomeChunk - dailyExpense) };
  });

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{t("analytics")}</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadCSV} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-lg shadow transition">{t("downloadCSV")}</button>
          <button onClick={downloadPDF} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-semibold rounded-lg shadow transition">{t("downloadPDF")}</button>
        </div>
      </div>

      {/* ── Filter Tabs ───────────────────────────────────── */}
      <div className="rounded-2xl shadow-md border p-4 mb-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{t("selectAnalysisPeriod")}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { id: "month", label: t("monthWeekView") },
            { id: "custom", label: t("customRange") }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border
                ${filterMode === tab.id
                  ? "text-white border-transparent shadow-md scale-105"
                  : "border-opacity-50 hover:scale-105"
                }`}
              style={filterMode === tab.id
                ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' }
                : { backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filterMode === "month" && (
          <div className="flex flex-wrap gap-4 items-end mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            {/* YEAR SCROLLER */}
            <div className="flex flex-col flex-1 min-w-[120px]">
              <label className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{t("yearLabel")}</label>
              <div className="flex items-center justify-between border p-1.5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
                <button onClick={() => setSelectedYear(prev => (parseInt(prev) - 1).toString())} className="px-3 font-bold hover:opacity-80" style={{ color: 'var(--text-primary)' }}>{"<"}</button>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{selectedYear}</span>
                <button onClick={() => setSelectedYear(prev => (parseInt(prev) + 1).toString())} className="px-3 font-bold hover:opacity-80" style={{ color: 'var(--text-primary)' }}>{">"}</button>
              </div>
            </div>

            {/* MONTH SELECTOR */}
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{t("monthLabel")}</label>
              <select
                value={selectedMonthNum}
                onChange={(e) => setSelectedMonthNum(e.target.value)}
                className="themed-input p-2 rounded-xl border shadow-sm text-sm font-medium outline-none cursor-pointer"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* WEEK TRACKER */}
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{t("weekTracker")}</label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="themed-input p-2 rounded-xl border shadow-sm text-sm font-medium outline-none cursor-pointer"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              >
                <option value="all">{t("fullMonthView")}</option>
                {currentWeeks.map((w, index) => <option key={index} value={index}>{w.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {filterMode === "custom" && (
          <div className="flex flex-wrap gap-3 items-end mt-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col gap-1">
              <input
                type="date"
                value={customFrom}
                max={customTo || today.toISOString().split("T")[0]}
                placeholder="dd--mm--yyyy"
                onChange={(e) => setCustomFrom(e.target.value)}
                className={`themed-input border rounded-xl px-3 py-2 text-sm outline-none transition-all${customFrom ? " has-value" : ""}`}
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={today.toISOString().split("T")[0]}
                placeholder="dd--mm--yyyy"
                onChange={(e) => setCustomTo(e.target.value)}
                className={`themed-input border rounded-xl px-3 py-2 text-sm outline-none transition-all${customTo ? " has-value" : ""}`}
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>
            <button
              onClick={handleCustomRun}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-md"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> {t("pleaseWaitBtn")}</>
              ) : (
                <><span>⚡</span> {t("runAnalysis")}</>
              )}
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-60 gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-indigo-300 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.7s" }}></div>
          </div>
          <p className="text-lg font-bold text-blue-700 animate-pulse">{t("loadingAnalysis")}</p>
        </div>
      )}

      {!loading && !hasRun && filterMode === "custom" && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <span className="text-5xl">📊</span>
          <p className="text-base font-semibold">{t("selectRangePrompt")}</p>
        </div>
      )}

      {!loading && (filterMode === "month" || (filterMode === "custom" && hasRun)) && (
        <div id="analytics-dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 rounded-xl shadow-md border-l-4 border-green-500" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>{t("totalIncome")}</h3>
            <p className="text-green-600 text-2xl font-bold mt-1">₹{income}</p>
          </div>
          <div className="p-6 rounded-xl shadow-md border-l-4 border-red-500" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>{t("expensesSelection")}</h3>
            <p className="text-red-500 text-2xl font-bold mt-1">₹{totalExpenses}</p>
          </div>
          <div className="p-6 rounded-xl shadow-md border-l-4 border-blue-500" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>{t("savingsRemaining")}</h3>
            <p className="text-blue-600 text-2xl font-bold mt-1">₹{savings}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="chart-pie" className="p-6 rounded-xl shadow-md flex flex-col items-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="mb-4 self-start font-bold text-sm md:text-base" style={{ color: 'var(--text-primary)' }}>{t("expenseVsSavingsChart")}</h3>
            <div className="w-full h-[320px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}>
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={getColor(entry.name)} />)}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `₹${value}`}
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      color: chartTheme.tooltipColor
                    }}
                    itemStyle={{ color: chartTheme.tooltipColor }}
                    labelStyle={{ color: chartTheme.tooltipColor }}
                  />
                  <Legend verticalAlign="bottom" formatter={renderLegendText} wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div id="chart-bar" className="p-6 rounded-xl shadow-md" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="mb-4 font-bold text-sm md:text-base" style={{ color: 'var(--text-primary)' }}>{t("dailyBreakdownChart")}</h3>
            <div className="w-full h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} style={{ fontSize: '10px' }} stroke={chartTheme.textColor} tick={{ fill: chartTheme.textColor }} />
                  <YAxis style={{ fontSize: '10px' }} stroke={chartTheme.textColor} tick={{ fill: chartTheme.textColor }} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      color: chartTheme.tooltipColor
                    }}
                    itemStyle={{ color: chartTheme.tooltipColor }}
                    labelStyle={{ color: chartTheme.tooltipColor }}
                  />
                  <Legend layout="horizontal" align="center" verticalAlign="top" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                  {categoryList.map((category) => <Bar key={category} dataKey={category} name={getLocalizedCategory(category)} stackId="a" fill={getColor(category)} barSize={15} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div id="chart-line" className="p-6 rounded-xl shadow-md mt-6" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="mb-4 font-bold text-sm md:text-base" style={{ color: 'var(--text-primary)' }}>{t("trendChart")}</h3>
          <div className="w-full h-[320px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -20, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                <XAxis dataKey="date" style={{ fontSize: '10px' }} stroke={chartTheme.textColor} tick={{ fill: chartTheme.textColor }} />
                <YAxis style={{ fontSize: '10px' }} stroke={chartTheme.textColor} tick={{ fill: chartTheme.textColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    color: chartTheme.tooltipColor
                  }}
                  itemStyle={{ color: chartTheme.tooltipColor }}
                  labelStyle={{ color: chartTheme.tooltipColor }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="expense" name={t("expenses")} stroke="#DB4437" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="savings" name={t("savings")} stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}
      <div className="h-20"></div>
    </div>
  );
}

export default Analytics;