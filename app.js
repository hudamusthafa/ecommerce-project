const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");

dotenv.config();

const connectDB = require("./src/config/db");
const passport = require("passport");
require("./src/config/passport");

// Routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const adminRoutes = require("./src/routes/adminRoutes");   // 👈 NEW

const app = express();

// DB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Session configuration
app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: false,
   cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true
  }
}));

app.use(methodOverride("_method"));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global user middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
app.get("/", (req, res) => {
  if (req.user) {
    return res.redirect("/home");
  }
  res.redirect("/login");
});




// Routes
app.use("/", authRoutes);
app.use("/", userRoutes);   //  All page routes here
app.use("/admin", adminRoutes);


// Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = app;