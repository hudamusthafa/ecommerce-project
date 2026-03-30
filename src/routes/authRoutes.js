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

router.post("/register", register);
router.post("/login",login);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

const passport = require("passport");

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


router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;