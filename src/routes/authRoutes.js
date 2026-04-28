const express = require("express");
const router = express.Router();

const {
  register,
  login,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

const passport = require("passport");
const authController = require("../controllers/authController");

// AUTH ROUTES 


// PAGES
router.get("/register", (req, res) => res.render("user/register"));
router.get("/login", authController.getLogin);
router.get("/otp", (req, res) => res.render("user/otp"));
router.get("/success", (req, res) => res.render("user/success"));
router.get("/forgot-password", (req, res) => res.render("user/forgot-password"));
router.get("/reset-password", (req, res) => res.render("user/reset-password"));


router.post("/register", register);
router.post("/login", login);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// GOOGLE AUTH
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login"
  }),
  (req, res) => {
    res.redirect("/home");
  }
);

module.exports = router;