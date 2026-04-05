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



const User = require("../models/User");
const { isLoggedIn } = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

//profile route
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("user/profile", { user: req.user });
});


//update profile
router.post(
  "/profile/update",
  isLoggedIn,
  upload.single("image"),
  async (req, res) => {
    try {
      const updates = {};

      if (req.body.name) updates.name = req.body.name;
      if (req.body.email) updates.email = req.body.email;
      if (req.body.phone) updates.phone = req.body.phone;
      if (req.body.gender) updates.gender = req.body.gender;

      if (req.file) {
        updates.profileImage = "/uploads/" + req.file.filename;
      }

      await User.findByIdAndUpdate(req.user._id, updates, { new: true });

      res.redirect("/profile");

    } catch (err) {
      console.log(err);
      res.send("Error updating profile");
    }
  }
);
module.exports = router;