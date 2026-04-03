require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

app.use(express.json());

// connect to database
connectDB();

app.get("/", (req, res) => {
  res.send("Expense Service Running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const axios = require("axios");

app.get("/test-ml", async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.ML_SERVICE_URL}/`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "ML service not reachable" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Expense service running on port ${PORT}`);
});