const express = require("express");
const router = express.Router();
const { isLoggedOut } = require("../middleware/authMiddleware");
const cacheMiddleware = require("../middleware/cacheMiddleware");

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
router.get("/register", cacheMiddleware.noCache,  isLoggedOut, authController.getRegister);
router.get("/login",cacheMiddleware.noCache,  isLoggedOut, authController.getLogin);
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

    req.login(req.user, (err) => {
      if (err) return res.redirect("/login");

      return res.redirect("/home");
    });

  }
);

module.exports = router;