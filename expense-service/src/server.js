require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());

// Connect DB
connectDB();

// Test log (you can remove later)
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded" : "Not Loaded");

app.listen(process.env.PORT, () => {
  console.log(`Expense Service running on port ${process.env.PORT}`);
});