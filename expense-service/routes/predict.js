const express = require("express");
const router = express.Router();
const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5003";

router.post("/", async (req, res) => {
    try {
        const response = await axios.post(
            `${ML_SERVICE_URL}/predict`,
            req.body
        );
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "ML error" });
    }
});

module.exports = router;