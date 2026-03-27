const express = require("express");
const dotenv = require("dotenv");

dotenv.config(); // load .env

const app = express();

app.use(express.json());

// Health check route
app.get("/", (req, res) => {
    res.send("Auth Service Running");
});

// Use env port
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
});