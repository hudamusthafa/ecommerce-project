const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const errorMiddleware = require("./src/middleware/errorMiddleware");
const { noCache } = require("./src/middleware/cacheMiddleware");
const MongoStore = require("connect-mongo").default;
const statusCodes = require("./src/helpers/status_codes");


dotenv.config();

const connectDB = require("./src/config/db");
const passport = require("passport");
require("./src/config/passport");




// Routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const Cart = require("./src/models/Cart");

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


const userSession = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions"
  }),

  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true
  }
});


//admin session
const adminSession = session({
  secret: process.env.SESSION_SECRET,

  name: "admin.sid",

  resave: false,
  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "admin-sessions"
  }),

  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true
  }
});




app.use(methodOverride("_method"));

// USER SESSION
app.use((req, res, next) => {

  if (req.originalUrl.startsWith("/admin")) {
    return next();
  }

  userSession(req, res, next);
});

// ADMIN SESSION
app.use("/admin", adminSession);

// Passport middleware
app.use(passport.initialize());

app.use((req, res, next) => {

  if (req.originalUrl.startsWith("/admin")) {
    return next();
  }

  passport.session()(req, res, next);
});

app.use(noCache);


// Global user middleware
 app.use(async (req, res, next) => {
  try {

    res.locals.user = req.user || null;
    res.locals.cartCount = 0;

    if (req.user) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        res.locals.cartCount = cart.items.reduce(
          (total, item) => total + item.quantity, 0
        );
      }
    }

    next();

  } catch (error) {
    next(error);
  }
});

app.get("/", (req, res) => {
  if (req.user) {
    return res.redirect("/home");
  }
  res.redirect("/login");
});

// Routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {

  if (req.originalUrl.startsWith("/admin")) {
    return res.status(statusCodes.NOT_FOUND).render("admin/404");
  }

  res.status(statusCodes.NOT_FOUND).render("user/404");
});

// Error middleware
app.use(errorMiddleware);

// Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = app;