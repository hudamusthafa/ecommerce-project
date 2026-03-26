const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const path = require("path");

dotenv.config();

const app = express();

//  DB connection
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

//  Static files
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

//  API routes
app.use("/api/auth", authRoutes);

//  Page routes (User)

app.get("/register", (req, res) => {
  res.render("user/register");
});
app.get("/login", (req, res) => {
  res.render("user/login");
});
app.get("/home", (req, res) => {
  res.render("user/home");
});

app.get("/otp", (req, res) => {
  res.render("user/otp");
});

app.get("/success", (req, res) => {
  res.render("user/success"); // or res.send("Success")
});

//  Page routes (Admin)
app.get("/admin/login", (req, res) => {
  res.render("admin/login");
});



//  Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = app;