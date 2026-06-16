import { useEffect, useState, useCallback, useRef } from "react";
import { ToastContainer, useToast } from "../components/Toast";
import { useLanguage } from "../utils/AppContext";

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
  const { t, language } = useLanguage();
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

  const formatRangeLabel = useCallback((start, end) => {
    const localeMap = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };
    const opts = { day: "numeric", month: "short", year: "numeric" };
    return `${start.toLocaleDateString(localeMap[language] || "en-IN", opts)} – ${end.toLocaleDateString(localeMap[language] || "en-IN", opts)}`;
  }, [language]);

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

    // ── STEP 2: Call ML Service with language handoff ─────────
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
          language: language === "hi" ? "Hindi" : language === "ta" ? "Tamil" : "English",
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
      try { toastRef.current?.warning(t("aiOffline")); } catch (_) {}

      const predictedExpense = totalExpense > 0 ? Math.round(totalExpense * 1.05) : 0;
      const predictedSavings = Math.round(totalIncome - predictedExpense);
      const ratio = totalIncome > 0 ? (totalExpense / totalIncome) : 0;
      const risk  = ratio < 0.5 ? "Safe" : ratio < 0.8 ? "Warning" : "Critical";

      const summaryLines = [];
      if (totalIncome === 0 && totalExpense === 0) {
        summaryLines.push(t("noTransactionsFoundPeriod"));
      } else {
        const keyOutpaced = ratio < 0.5 ? "risk_safe" : ratio < 0.8 ? "risk_warning" : "risk_critical";
        summaryLines.push(
          language === "hi"
            ? `आपका कुल खर्च ₹${totalExpense.toLocaleString()} है, जबकि आपकी आय ₹${totalIncome.toLocaleString()} (${Math.round(ratio * 100)}% खर्च अनुपात) है।`
            : language === "ta"
            ? `உங்களது மொத்தச் செலவு ₹${totalExpense.toLocaleString()} ஆகும், உங்களது வருமானம் ₹${totalIncome.toLocaleString()} (${Math.round(ratio * 100)}% செலவு விகிதம்) ஆகும்.`
            : `Your total spend is ₹${totalExpense.toLocaleString()} against an income of ₹${totalIncome.toLocaleString()} (${Math.round(ratio * 100)}% spend ratio).`
        );
        summaryLines.push(
          keyOutpaced === "risk_safe"
            ? (language === "hi" ? "आपकी वित्तीय स्थिति स्वस्थ है। इसी तरह अनुशासन बनाए रखें।" : language === "ta" ? "உங்கள் நிதி நிலை ஆரோக்கியமாக உள்ளது. இதை தொடர்ந்து பராமரிக்கவும்." : "Your finances are in a healthy state. Keep maintaining this discipline.")
            : keyOutpaced === "risk_warning"
            ? (language === "hi" ? "आप अपनी आय का एक बड़ा हिस्सा खर्च कर रहे हैं। श्रेणियों की समीक्षा करें।" : language === "ta" ? "உங்கள் வருமானத்தில் கணிசமான பகுதியை செலவிடுகிறீர்கள். செலவுகளை சரிபார்க்கவும்." : "You are spending a significant portion of your income. Review discretionary categories.")
            : (language === "hi" ? "आपका खर्च गंभीर रूप से अधिक है। तत्काल लागत में कमी की सिफारिश की जाती है।" : language === "ta" ? "உங்கள் செலவுகள் மிகவும் அதிகமாக உள்ளன. உடனடியாக செலவைக் குறைக்க பரிந்துரைக்கப்படுகிறது." : "Your expenses are critically high. Immediate cost reduction is recommended.")
        );
        summaryLines.push(
          language === "hi"
            ? `आपके वर्तमान रुझान के आधार पर, अगले महीने का खर्च ₹${predictedExpense.toLocaleString()} अनुमानित है।`
            : language === "ta"
            ? `உங்களது தற்போதைய போக்கின் அடிப்படையில், அடுத்த மாத செலவுகள் ₹${predictedExpense.toLocaleString()} ஆக இருக்கும் என கணிக்கப்பட்டுள்ளது.`
            : `Based on your current trend, next month's expenses are estimated at ₹${predictedExpense.toLocaleString()}.`
        );
      }

      setAiData({
        nextMonth: predictedExpense,
        savings:   predictedSavings,
        alert: totalExpense === 0
          ? t("noTransactionsFoundPeriod")
          : ratio < 0.5
          ? (language === "hi" ? "बढ़िया अनुशासन! आप अपनी आय के दायरे में खर्च कर रहे हैं।" : language === "ta" ? "நல்ல ஒழுக்கம்! உங்கள் வருமானத்திற்குள் செலவிடுகிறீர்கள்." : "Great discipline! You are spending well within your income.")
          : ratio < 0.8
          ? (language === "hi" ? "मध्यम खर्च पाया गया — अपने परिवर्तनीय खर्चों की समीक्षा करने पर विचार करें।" : language === "ta" ? "மிதமான செலவு கண்டறியப்பட்டது — உங்கள் செலவுகளை மறுபரிசீலனை செய்யவும்." : "Moderate spending detected — consider reviewing your variable expenses.")
          : (language === "hi" ? "उच्च खर्च अनुपात पाया गया — लागत को कम करने के लिए तत्काल कार्रवाई करें।" : language === "ta" ? "அதிக செலவு விகிதம் கண்டறியப்பட்டது — செலவைக் குறைக்க உடனடியாக நடவடிக்கை எடுக்கவும்." : "High spend ratio detected — take immediate action to reduce costs."),
        detailedSummary: summaryLines.join(" "),
        recommendations: [
          language === "hi" ? "अपने दैनिक परिवर्तनीय खर्चों पर कड़ी नज़र रखें।" : language === "ta" ? "உங்கள் தினசரி மாறிவரும் செலவுகளை உன்னிப்பாகக் கண்காணிக்கவும்." : "Track your daily variable expenses more closely.",
          language === "hi" ? "प्रत्येक खर्च श्रेणी के लिए एक मासिक बजट निर्धारित करें।" : language === "ta" ? "ஒவ்வொரு செலவு வகையிலும் மாதாந்திர பட்ஜெட்டை அமைக்கவும்." : "Set a monthly budget for each spending category.",
          language === "hi" ? "हर महीने अपनी आय का कम से कम 20% बचाने का लक्ष्य रखें।" : language === "ta" ? "ஒவ்வொரு மாதமும் உங்கள் வருமானத்தில் குறைந்தது 20% சேமிக்க இலக்கு வைக்கவும்." : "Aim to save at least 20% of your income every month.",
        ],
        riskStatus: risk,
        totalIncome,
        totalExpense,
        entryCount: allExpenses.length,
      });
    } finally {
      setLoading(false);
    }
  }, [ML_API, EXPENSE_API, language, t, formatRangeLabel]);

  /* ── auto-run on tab change (not custom until user clicks) ─ */
  useEffect(() => {
    if (filterMode === "week")  runAnalysis(getWeekRange());
    if (filterMode === "month") runAnalysis(getMonthRange());
  }, [filterMode, runAnalysis]);

  const handleCustomRun = () => {
    if (!customFrom || !customTo) {
      toast.error(t("fillAllFieldsError"));
      return;
    }
    if (customFrom > customTo) {
      toast.error(t("cannotConnectServerError"));
      return;
    }
    const start = parseLocalDate(customFrom);
    const end   = parseLocalDate(customTo);
    if (!start || !end) {
      toast.error(t("cannotConnectServerError"));
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
  const riskKey = `risk_${(aiData?.riskStatus || "Unknown").toLowerCase()}`;

  /* ── tab meta ───────────────────────────────────────────── */
  const tabs = [
    { id: "week",   label: `📅 ${language === "hi" ? "इस सप्ताह" : language === "ta" ? "இந்த வாரம்" : "This Week"}` },
    { id: "month",  label: `🗓️ ${language === "hi" ? "इस महीने" : language === "ta" ? "இந்த மாதம்" : "This Month"}` },
    { id: "custom", label: `${t("customRange")}` },
  ];

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
            {t("aiTitle")}
          </h2>
          {rangeLabel && !loading && (
            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
              {language === "hi" ? `विश्लेषण: ${rangeLabel}` : language === "ta" ? `பகுப்பாய்வு: ${rangeLabel}` : `Analysing: ${rangeLabel}`}
            </p>
          )}
        </div>
        {aiData && !loading && (
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${rs.badge}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${rs.dot}`}></span>
            {language === "hi" ? "स्थिति: " : language === "ta" ? "நிலை: " : "Status: "} {t(riskKey)}
          </div>
        )}
      </div>

      {/* ── Filter Tabs ───────────────────────────────────── */}
      <div className="rounded-2xl shadow-md border p-4 mb-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{t("selectAnalysisPeriod")}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {tabs.map((tab) => (
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

        {/* Custom date pickers */}
        {filterMode === "custom" && (
          <div className="flex flex-wrap gap-3 items-end mt-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{t("fromLabel")}</label>
              <input
                type="date"
                value={customFrom}
                max={customTo || todayStr}
                onChange={(e) => setCustomFrom(e.target.value)}
                className={`themed-input border rounded-xl px-3 py-2 text-sm outline-none transition-all${customFrom ? " has-value" : ""}`}
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{t("toLabel")}</label>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={todayStr}
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

      {/* ── Loading State ─────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-60 gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-indigo-300 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.7s" }}></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-700 animate-pulse">{t("runningAi")}</p>
            <p className="text-sm text-gray-400 mt-1">{t("crunchingData")}</p>
          </div>
        </div>
      )}

      {/* ── Not yet run (custom tab, no result) ───────────── */}
      {!loading && !hasRun && filterMode === "custom" && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <span className="text-5xl">📊</span>
          <p className="text-base font-semibold">{t("selectRangePrompt")}</p>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────── */}
      {!loading && aiData && (
        <>
          {/* Quick-stat bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl p-4 shadow-sm border flex flex-col gap-1" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t("periodIncome")}</span>
              <span className="text-xl font-black text-emerald-500">₹{(aiData.totalIncome || 0).toLocaleString()}</span>
            </div>
            <div className="rounded-2xl p-4 shadow-sm border flex flex-col gap-1" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t("periodExpense")}</span>
              <span className="text-xl font-black text-red-500">₹{(aiData.totalExpense || 0).toLocaleString()}</span>
            </div>
            <div className="rounded-2xl p-4 shadow-sm border flex flex-col gap-1 col-span-2 sm:col-span-1" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t("transactionsCount")}</span>
              <span className="text-xl font-black text-blue-600">
                {aiData.entryCount ?? 0} {language === "hi" ? "प्रविष्टियाँ" : language === "ta" ? "பதிவுகள்" : "entries"}
              </span>
            </div>
          </div>

          {/* Main forecast cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {/* Next Month Forecast */}
            <div className="group rounded-2xl shadow-md border-t-4 border-red-500 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📈</span>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{t("nextMonthForecast")}</h3>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-red-500">₹{(aiData.nextMonth || 0).toLocaleString()}</p>
              <p className="text-xs mt-2 italic" style={{ color: 'var(--text-muted)' }}>
                {language === "hi" ? "*हालिया खर्च वेग के आधार पर" : language === "ta" ? "*சமீபத்திய செலவு வேகத்தின் அடிப்படையில்" : "*Based on recent spending velocity"}
              </p>
            </div>

            {/* Predicted Savings */}
            <div className="group rounded-2xl shadow-md border-t-4 border-emerald-500 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💰</span>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{t("predictedSavings")}</h3>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-500">₹{(aiData.savings || 0).toLocaleString()}</p>
              <p className="text-xs mt-2 italic" style={{ color: 'var(--text-muted)' }}>
                {language === "hi" ? "*अनुमानित पूंजी अधिशेष" : language === "ta" ? "*கணிக்கப்பட்ட மூலதன உபரி" : "*Projected capital surplus"}
              </p>
            </div>

            {/* AI Insight */}
            <div className="group rounded-2xl shadow-md border-t-4 border-blue-500 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{t("aiInsight")}</h3>
              </div>
              <p className="text-base font-bold leading-snug" style={{ color: 'var(--color-primary)' }}>{aiData.alert}</p>
            </div>
          </div>

          {/* Deep insights */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
            <div className="rounded-2xl shadow-md border-l-4 border-indigo-500 p-6" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span>📊</span> {t("financialDeepDive")}
              </h3>
              <p className="leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>{aiData.detailedSummary}</p>
            </div>

            <div className="rounded-2xl shadow-md border-l-4 border-amber-500 p-6" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span>🎯</span> {t("strategicRecommendations")}
              </h3>
              {aiData.recommendations.length === 0 ? (
                <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                  {language === "hi" ? "कोई सिफारिश नहीं।" : language === "ta" ? "பரிந்துரைகள் எதுவும் இல்லை." : "No recommendations yet."}
                </p>
              ) : (
                <ul className="space-y-3">
                  {aiData.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="mt-4 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="p-5 rounded-2xl border flex items-start gap-4" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
          <div className="text-3xl flex-shrink-0">🤖</div>
          <div>
            <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{t("intelligenceEngine")}</h3>
            <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              {t("engineDescription")}
            </p>
          </div>
        </div>
      </footer>

      <div className="h-16"></div>
    </div>
  );
}