const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/authMiddleware");
const User = require("../models/User");

// Pages
router.get("/register", (req, res) => res.render("user/register"));
router.get("/login", (req, res) => res.render("user/login"));
router.get("/otp", (req, res) => res.render("user/otp"));
router.get("/success", (req, res) => res.render("user/success"));
router.get("/forgot-password", (req, res) => res.render("user/forgot-password"));
router.get("/reset-password", (req, res) => res.render("user/reset-password"));

router.get("/home", (req, res) => {
  res.render("user/home", { user: req.user || null });
});

router.get("/profile", isLoggedIn, (req, res) => {
  res.render("user/profile", { user: req.user });
});

router.get("/checkout", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("user/checkout", { user });
});

// Logout (ONLY ONE)
router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });
});

module.exports = router;