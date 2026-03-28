function Predictions() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-3xl font-bold mb-6">AI Financial Predictions</h2>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Next Month Expenses</h3>
          <p className="text-2xl font-bold text-red-500">₹20,000</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Predicted Savings</h3>
          <p className="text-2xl font-bold text-green-600">₹25,000</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Spending Alert</h3>
          <p className="text-lg font-semibold text-blue-600">
            Reduce Food Expenses by 10%
          </p>
        </div>

      </div>

    </div>
  );
}

export default Predictions;