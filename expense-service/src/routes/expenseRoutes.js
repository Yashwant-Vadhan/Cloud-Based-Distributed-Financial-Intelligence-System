const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ REPLACE THIS ENTIRE ROUTE
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { amount, category } = req.body;

    const expense = new Expense({
      amount,
      category,
      user: req.user.id, // 🔥 IMPORTANT
    });

    await expense.save();

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;