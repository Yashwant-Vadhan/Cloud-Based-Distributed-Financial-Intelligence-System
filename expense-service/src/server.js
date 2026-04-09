require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(express.json());

// ✅ ADD THIS (CORS)
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

connectDB();

// ✅ ENSURE THIS EXISTS
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/income", require("./routes/incomeRoutes"));

app.listen(process.env.PORT, () => {
  console.log(`Expense Service running on port ${process.env.PORT}`);
});
app.use("/predict", require("./routes/predict"));