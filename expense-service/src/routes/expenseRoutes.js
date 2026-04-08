const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// GET expenses for a specific month
router.get("/:month", async (req, res) => {
  try {
    const expenses = await Expense.find({ month: req.params.month });
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new expense
router.post("/", async (req, res) => {
  const { amount, category, date, month } = req.body;
  const newExpense = new Expense({ amount, category, date, month });

  try {
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an expense
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;