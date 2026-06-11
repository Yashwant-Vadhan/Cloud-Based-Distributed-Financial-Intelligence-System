require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(express.json());

// ✅ CORS — allow both local dev and the live Azure frontend
const allowedOrigins = [
  "http://localhost:3000",
  "https://wonderfulbeach-8c27da84.centralindia.azurecontainerapps.io",
  /\.wonderfulbeach-8c27da84\.centralindia\.azurecontainerapps\.io$/
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl)
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(o =>
      typeof o === "string" ? o === origin : o.test(origin)
    );
    if (isAllowed) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

connectDB();

// ✅ Routes
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/income", require("./routes/incomeRoutes"));
app.use("/predict", require("./routes/predict"));

app.listen(process.env.PORT, () => {
  console.log(`Expense Service running on port ${process.env.PORT}`);
});