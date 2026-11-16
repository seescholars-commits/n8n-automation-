
console.log("Starting Squarespace automation server...");

require("dotenv").config();

const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Squarespace automation server is running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
