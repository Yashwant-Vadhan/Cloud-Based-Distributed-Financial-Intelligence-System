import { useEffect, useState } from "react";

function Predictions() {
  const [aiData, setAiData] = useState({
    nextMonth: 20000,
    savings: 25000,
    alert: "Reduce Food Expenses by 10%"
  });

  const ML_API = process.env.REACT_APP_ML_URL;

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch(`${ML_API}/api/predict`);
        const data = await response.json();
        setAiData({
          nextMonth: data.nextMonth || 20000,
          savings: data.savings || 25000,
          alert: data.alert || "Reduce Food Expenses by 10%"
        });
      } catch (err) {
        console.error("ML service unreachable, using default values");
      }
    };
    fetchPredictions();
  }, [ML_API]); // Added ML_API to fix the warning you were seeing

  return (
    /* Added h-screen and overflow-y-auto to allow scrolling without breaking the layout */
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6">AI Financial Predictions</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Next Month Expenses</h3>
          <p className="text-2xl font-bold text-red-500">₹{aiData.nextMonth.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Predicted Savings</h3>
          <p className="text-2xl font-bold text-green-600">₹{aiData.savings.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Spending Alert</h3>
          <p className="text-lg font-semibold text-blue-600">
            {aiData.alert}
          </p>
        </div>
      </div>
      
      {/* Extra space at the bottom for better scroll experience */}
      <div className="h-20"></div>
    </div>
  );
}

export default Predictions;