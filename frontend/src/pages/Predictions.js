import { useEffect, useState } from "react";
import { getMonth } from "../utils/month";

function Predictions() {
  const [loading, setLoading] = useState(true);
  const [aiData, setAiData] = useState({
    nextMonth: 0,
    savings: 0,
    alert: "Fetch complete. AI analysis pending...",
    detailedSummary: "",
    recommendations: [],
    riskStatus: "Safe"
  });

  const ML_API = process.env.REACT_APP_ML_URL;
  const EXPENSE_API = process.env.REACT_APP_EXPENSE_URL;

  useEffect(() => {
    const runAnalysis = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const currentMonth = getMonth();

      try {
        const incomeRes = await fetch(`${EXPENSE_API}/api/income/${currentMonth}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const incomeData = await incomeRes.json();
        const totalIncome = incomeData.income || 0;

        const expenseRes = await fetch(`${EXPENSE_API}/api/expenses/${currentMonth}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const expenseData = await expenseRes.json();
        const expenses = expenseData.expenses || [];

        const categoryMap = { food: 0, travel: 0, entertainment: 0, rent: 0 };
        expenses.forEach(e => {
          const cat = e.category ? e.category.toLowerCase() : "";
          if (categoryMap.hasOwnProperty(cat)) {
            categoryMap[cat] += Number(e.amount);
          } else if (cat === "bills" || cat === "education" || cat === "housing") {
             categoryMap.rent += Number(e.amount); 
          }
        });

        const mlRes = await fetch(`${ML_API}/api/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            month: parseInt(currentMonth.split("-")[1]),
            income: totalIncome,
            ...categoryMap
          })
        });

        if (!mlRes.ok) throw new Error("ML Service Error");

        const data = await mlRes.json();
        setAiData({
          nextMonth: data.nextMonth || 0,
          savings: data.savings || 0,
          alert: data.alert || "Analyzed successfully.",
          detailedSummary: data.detailedSummary || "No detailed summary available.",
          recommendations: data.recommendations || [],
          riskStatus: data.riskStatus || "Safe"
        });
      } catch (err) {
        console.error("AI Analysis failed:", err);
        setAiData(prev => ({ ...prev, alert: "AI Analysis currently unavailable. Please try again later." }));
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [ML_API, EXPENSE_API]);

  const getRiskColor = (status) => {
    switch (status) {
      case "Critical": return "bg-red-100 text-red-700 border-red-200";
      case "Warning": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI Financial Intelligence</h2>
        {!loading && (
          <div className={`px-4 py-1.5 rounded-full border text-sm font-bold uppercase ${getRiskColor(aiData.riskStatus)}`}>
            Status: {aiData.riskStatus}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-medium text-blue-800 animate-pulse">Running Deep AI Model Analysis...</p>
        </div>
      ) : (
        <>
          {/* Main Triple Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-red-500 hover:scale-[1.02] transition-transform duration-300">
              <h3 className="text-gray-500 font-semibold mb-2 uppercase tracking-wider text-xs">Next Month Forecast</h3>
              <p className="text-4xl font-black text-red-600">₹{aiData.nextMonth.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2 italic">*Based on recent spending velocity</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-green-500 hover:scale-[1.02] transition-transform duration-300">
              <h3 className="text-gray-500 font-semibold mb-2 uppercase tracking-wider text-xs">Predicted Savings</h3>
              <p className="text-4xl font-black text-green-600">₹{aiData.savings.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2 italic">*Projected capital surplus</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-blue-500 hover:scale-[1.02] transition-transform duration-300">
              <h3 className="text-gray-500 font-semibold mb-2 uppercase tracking-wider text-xs">AI Insight</h3>
              <p className="text-xl font-bold text-blue-700 leading-tight">
                {aiData.alert}
              </p>
            </div>
          </div>

          {/* New Detailed Insights Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-md border-l-8 border-indigo-500">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📊</span> Financial Deep Dive
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {aiData.detailedSummary}
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border-l-8 border-amber-500">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">💡</span> Strategic Recommendations
              </h3>
              <ul className="space-y-4">
                {aiData.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-1">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 font-medium">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
      
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center space-x-6">
          <div className="text-3xl">🤖</div>
          <div>
            <h3 className="text-blue-900 font-bold mb-1">Financial Intelligence Engine</h3>
            <p className="text-blue-700 text-sm max-w-2xl">
              Our distributed ML fleet analyzes raw categorical metadata across your income vectors and expense horizons. 
              By leveraging Groq's high-speed LPU infrastructure and OpenAI's reasoning, we provide predictive liquidity 
              modeling to optimize your net worth progression.
            </p>
          </div>
        </div>
      </footer>

      <div className="h-20"></div>
    </div>
  );
}

export default Predictions;