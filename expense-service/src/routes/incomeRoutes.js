const express = require("express");
const router = express.Router();

const Income = require("../models/Income");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ ADD INCOME
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { amount, source, date, month } = req.body;

    const income = new Income({
      user_id: req.user.user_id,
      amount,
      source,
      date,
      month
    });

    await income.save();
    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ GET INCOME BY MONTH
router.get("/:month", authMiddleware, async (req, res) => {
  try {
    const incomeHistory = await Income.find({
      user_id: req.user.user_id,
      month: req.params.month
    });
    
    const totalIncome = incomeHistory.reduce((sum, item) => sum + item.amount, 0);
    
    res.json({ income: totalIncome, incomeHistory });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ UPDATE INCOME
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { amount, source, date } = req.body;

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.user_id },
      { amount, source, date },
      { new: true }
    );

    if (!income) return res.status(404).json({ msg: "Income not found" });
    res.json(income);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ DELETE INCOME
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Income.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.user_id
    });
    res.json({ msg: "Income deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
