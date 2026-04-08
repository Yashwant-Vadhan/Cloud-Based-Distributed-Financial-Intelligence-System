const express = require("express");
const router = express.Router();

const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { amount, category, date } = req.body;

    const month = date.slice(0, 7);

    const expense = new Expense({
      user_id: req.user.user_id, // ✅ FROM TOKEN
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

module.exports = router;