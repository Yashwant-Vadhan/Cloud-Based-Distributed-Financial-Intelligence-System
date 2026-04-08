const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // ✅ ADD THIS

  amount: { type: Number, required: true },
  category: { type: String, required: true },

  date: { type: String, required: true },
  month: { type: String, required: true },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", ExpenseSchema);