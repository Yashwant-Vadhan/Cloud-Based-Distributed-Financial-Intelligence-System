function Analytics() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-3xl font-bold mb-6">Financial Analytics</h2>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Monthly Expenses</h3>
          <p className="text-2xl font-bold text-red-500">₹18,200</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Monthly Income</h3>
          <p className="text-2xl font-bold text-green-600">₹45,000</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500">Savings Rate</h3>
          <p className="text-2xl font-bold text-blue-600">59%</p>
        </div>

      </div>

      {/* Chart Placeholder */}
      <div className="bg-white p-6 rounded-xl shadow-lg mt-6 h-64 flex items-center justify-center">
        <p className="text-gray-500">Chart will appear here</p>
      </div>

    </div>
  );
}

export default Analytics;