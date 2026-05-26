const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const errorMiddleware = require("./src/middleware/errorMiddleware");

dotenv.config();

const connectDB = require("./src/config/db");
const passport = require("passport");
require("./src/config/passport");

// Routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
  

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
  secret: process.env.SESSION_SECRET,
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

  //  If session exists but user is missing (blocked/deleted)
if (req.session &&req.session.passport && !req.user && !req.originalUrl.startsWith("/admin")) {    
  
       return req.logout(() => {
        req.session.destroy(() => {
        res.clearCookie("connect.sid");

      return res.redirect(
        "/login?message=" + encodeURIComponent("Your account has been blocked by admin")
      );     
     });
    });
  }

  // normal flow
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


// Error middleware
app.use(errorMiddleware);

// Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = app;