const express = require("express");
const axios = require("axios");
const router = express.Router();

// Default to local ML Service or Production URL from test.js
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

// @route   POST /predict
// @desc    Get complete AI prediction (expense, suggestions, etc)
// @access  Public (or add authMiddleware if needed)
router.post("/", async (req, res) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/predict`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error connecting to ML Service for /predict:", error.message);
        res.status(500).json({ error: "Failed to communicate with ML AI service." });
    }
});

// @route   POST /predict/overspending
// @desc    Check overspending status via AI
router.post("/overspending", async (req, res) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/overspending`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error connecting to ML Service for /overspending:", error.message);
        res.status(500).json({ error: "Failed to communicate with ML AI service." });
    }
});

// @route   POST /predict/credit-score
// @desc    Check credit score via AI
router.post("/credit-score", async (req, res) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/credit-score`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error connecting to ML Service for /credit-score:", error.message);
        res.status(500).json({ error: "Failed to communicate with ML AI service." });
    }
});

module.exports = router;
