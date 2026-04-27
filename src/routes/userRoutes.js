const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");

// PAGES
router.get("/register", (req, res) => res.render("user/register"));
router.get("/login", (req, res) => res.render("user/login"));
router.get("/otp", (req, res) => res.render("user/otp"));
router.get("/success", (req, res) => res.render("user/success"));
router.get("/forgot-password", (req, res) => res.render("user/forgot-password"));
router.get("/reset-password", (req, res) => res.render("user/reset-password"));

router.get("/home", (req, res) => {
  res.render("user/home", { user: req.user || null });
});

// PROFILE
router.get("/profile", isLoggedIn, userController.getProfile);

router.post(
  "/profile/update",
  isLoggedIn,
  upload.single("image"),
  userController.updateProfile
);

router.post("/profile/password", isLoggedIn, userController.changePassword);
router.post("/profile/set-password", isLoggedIn, userController.setPassword);
// CHECKOUT
router.get("/checkout", isLoggedIn, userController.getCheckout);

// ADDRESS
router.post("/address/add", isLoggedIn, userController.addAddress);
router.post("/address/delete/:id", isLoggedIn, userController.deleteAddress);
router.post("/address/update/:id", isLoggedIn, userController.updateAddress);

router.get("/address/new", isLoggedIn, (req, res) => {
  res.render("user/add-address", { address: null });
});

router.get("/address/edit/:id", isLoggedIn, userController.getEditAddress);

// LOGOUT
router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });
});

module.exports = router;