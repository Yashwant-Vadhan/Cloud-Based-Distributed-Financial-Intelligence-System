const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

app.use(express.json());

// DB
connectDB();

// Routes
app.use("/auth", authRoutes);

// Health
app.get("/", (req, res) => {
  res.send("Auth Service Running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});