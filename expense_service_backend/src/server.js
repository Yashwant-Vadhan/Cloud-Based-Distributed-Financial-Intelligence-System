const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const expenseRoutes = require("./routes/expenseRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Expense Service DB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/expenses", expenseRoutes);

// Use the PORT from .env or default to 5002
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Expense Service running on port ${PORT}`));