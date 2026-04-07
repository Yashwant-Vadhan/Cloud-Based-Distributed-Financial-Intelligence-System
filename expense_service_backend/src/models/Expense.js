const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  month: { type: String, required: true }, // Format: YYYY-MM (for filtering)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", ExpenseSchema);