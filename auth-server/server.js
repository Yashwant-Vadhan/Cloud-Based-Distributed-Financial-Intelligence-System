const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Auth Service Running");
});

app.listen(4000, () => {
    console.log("Auth service running on port 4000");
});