const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const path = require("path");
const passport = require("./src/config/passport");
const session = require("express-session");


const app = express();

//  DB connection
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

const { isLoggedIn } = require("./src/middleware/authMiddleware");

//  Static files
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

//  API routes
app.use("/api/auth", authRoutes);

//  Page routes (User)

app.get("/register", (req, res) => {
  res.render("user/register");
});
app.get("/login", (req, res) => {
  res.render("user/login");
});
app.get("/home", isLoggedIn, (req, res) => {
  res.render("user/home", { user: req.user });
});

app.get("/otp", (req, res) => {
  res.render("user/otp");
});

app.get("/success", (req, res) => {
  res.render("user/success"); // or res.send("Success")
});

app.get("/forgot-password", (req, res) => {
  res.render("user/forgot-password");
});

app.get("/reset-password", (req, res) => {
  res.render("user/reset-password");
});

app.get("/profile", isLoggedIn, (req, res) => {
  res.render("user/profile", { user: req.user });
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