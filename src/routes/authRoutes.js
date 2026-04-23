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

// AUTH ROUTES 
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