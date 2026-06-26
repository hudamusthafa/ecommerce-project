const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const errorMiddleware = require("./src/middleware/errorMiddleware");
const { noCache } = require("./src/middleware/cacheMiddleware");
const MongoStore = require("connect-mongo").default;


dotenv.config();

const connectDB = require("./src/config/db");
const passport = require("passport");
require("./src/config/passport");


//const MongoStore = require("connect-mongo")(session);

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

//  Session configuration with MongoDB store
app.use(session({
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
}));


app.use(methodOverride("_method"));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(noCache);


// Global user middleware
 app.use(async (req, res, next) => {
  try {

//     if (
//       req.session &&
//       req.session.passport &&
//       !req.user &&
//       !req.originalUrl.startsWith("/admin")
//     ) {
//       return req.logout(() => {
//         req.session.destroy(() => {
//           res.clearCookie("connect.sid");
//           return res.redirect(
//             "/login?message=" +
//             encodeURIComponent("Your account has been blocked by admin")
//           );
//         });
//       });
//     }

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

// Error middleware
app.use(errorMiddleware);

// Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = app;