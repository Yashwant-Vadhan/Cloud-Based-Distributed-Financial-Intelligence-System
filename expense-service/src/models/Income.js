const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  date: { type: String, required: true },
  month: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Income", IncomeSchema);
