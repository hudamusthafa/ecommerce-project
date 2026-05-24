const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware/authMiddleware");
const cacheMiddleware = require("../middleware/cacheMiddleware");
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");

// HOME
router.get("/home", (req, res) => {
  res.render("user/home", { user: req.user || null });
});


// ================= PROFILE =================

// view profile
router.get("/profile", cacheMiddleware.noCache, isLoggedIn, userController.getProfile);

// update profile (PUT)
router.put(
  "/profile",
  isLoggedIn,
  upload.single("image"),
  userController.updateProfile
);

// change password
router.put("/profile/password", isLoggedIn, userController.changePassword);

// set password (for Google users)
router.post("/profile/set-password", isLoggedIn, userController.setPassword);


// ================= CHECKOUT =================

router.get("/checkout", cacheMiddleware.noCache, isLoggedIn, userController.getCheckout);


// ================= ADDRESS =================

// view addresses
router.get("/address", cacheMiddleware.noCache, isLoggedIn, userController.getAddressPage);

// add address
router.post("/address", isLoggedIn, userController.addAddress);

// update address
router.put("/address/:id", isLoggedIn, userController.updateAddress);

// delete address
router.delete("/address/:id", isLoggedIn, userController.deleteAddress);

// add new address page
router.get("/address/new", isLoggedIn, (req, res) => {
  res.render("user/add-address", { address: null });
});

// edit address page
router.get("/address/edit/:id", isLoggedIn, userController.getEditAddress);


// ================= LOGOUT =================

router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  });
});






//============week 2================

//==== products/collections============




//show all product
router.get("/products",isLoggedIn,userController.getProductsPage)

//show selected product
router.get("/products/:id",isLoggedIn,userController.getProductDetails)

//ADD TO  CART
router.get("/cart/add/:productId", isLoggedIn, userController.addToCart);

//SHOW CART
router.get("/cart",isLoggedIn,userController.getCart);

//QUANTITY UPDATE
router.get("/cart/update/:productId",isLoggedIn, userController.updateCartQuantity);

//REMOVE PRODUCT
router.get( "/cart/remove/:productId", isLoggedIn, userController.removeCartProduct);

module.exports = router;