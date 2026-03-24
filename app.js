const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const path = require("path");


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(express.static(path.join(__dirname, "public")));

// DB connection
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = app;