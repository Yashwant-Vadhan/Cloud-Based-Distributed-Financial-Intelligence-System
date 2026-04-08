const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const expenseRoutes = require('./routes/expenseRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/expenses', expenseRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Expense Service is running...');
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Expense Service running on port ${PORT}`);
});