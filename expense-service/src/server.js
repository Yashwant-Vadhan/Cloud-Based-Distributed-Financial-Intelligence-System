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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Expense service running on port ${PORT}`);
});