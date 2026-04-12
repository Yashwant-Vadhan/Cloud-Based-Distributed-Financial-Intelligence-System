const express = require("express");
const router = express.Router();

const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ ADD EXPENSE
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { amount, category, date } = req.body;
    const month = date.slice(0, 7);

    const expense = new Expense({
      user_id: req.user.user_id,
      amount,
      category,
      date,
      month
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ GET EXPENSES BY MONTH
router.get("/:month", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({
      user_id: req.user.user_id,
      month: req.params.month
    });
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ UPDATE EXPENSE
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { amount, category, date } = req.body;
    const month = date.slice(0, 7);

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.user_id },
      { amount, category, date, month },
      { new: true }
    );

    if (!expense) return res.status(404).json({ msg: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ DELETE EXPENSE
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Expense.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.user_id
    });
    res.json({ msg: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;