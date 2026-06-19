const express=require("express"),router=express.Router();

const {isLoggedIn}=require("../middleware/authMiddleware");
const cacheMiddleware=require("../middleware/cacheMiddleware");
const userController=require("../controllers/userController");
const upload=require("../middleware/upload");

// HOME
router.get("/home",cacheMiddleware.noCache,(req,res)=>{res.render("user/home",{user:req.user||null});});

// PROFILE
router.get("/profile",cacheMiddleware.noCache,isLoggedIn,userController.getProfile);
router.put("/profile",cacheMiddleware.noCache,isLoggedIn,upload.single("image"),userController.updateProfile);
router.put("/profile/password",cacheMiddleware.noCache,isLoggedIn,userController.changePassword);
router.post("/profile/set-password",cacheMiddleware.noCache,isLoggedIn,userController.setPassword);


// ADDRESS
router.get("/address",cacheMiddleware.noCache,isLoggedIn,userController.getAddressPage);
router.post("/address",cacheMiddleware.noCache,isLoggedIn,userController.addAddress);
router.put("/address/:id",cacheMiddleware.noCache,isLoggedIn,userController.updateAddress);
router.delete("/address/:id",cacheMiddleware.noCache,isLoggedIn,userController.deleteAddress);

router.get("/address/new",cacheMiddleware.noCache,isLoggedIn,(req,res)=>{res.render("user/add-address",{address:null});});

router.get("/address/edit/:id",cacheMiddleware.noCache,isLoggedIn,userController.getEditAddress);

// PRODUCTS
router.get("/products",cacheMiddleware.noCache,isLoggedIn,userController.getProductsPage);
router.get("/products/:id",cacheMiddleware.noCache,isLoggedIn,userController.getProductDetails);

// CART
router.get("/cart/add/:productId",cacheMiddleware.noCache,isLoggedIn,userController.addToCart);
router.get("/cart",cacheMiddleware.noCache,isLoggedIn,userController.getCart);
router.get("/cart/update/:productId",cacheMiddleware.noCache,isLoggedIn,userController.updateCartQuantity);
router.get("/cart/remove/:productId",cacheMiddleware.noCache,isLoggedIn,userController.removeCartProduct);


// WISHLIST

router.get("/wishlist",cacheMiddleware.noCache,isLoggedIn,userController.getWishlist);
router.get("/wishlist/add/:productId",cacheMiddleware.noCache,isLoggedIn,userController.addToWishlist);
router.get("/wishlist/remove/:productId",cacheMiddleware.noCache,isLoggedIn,userController.removeWishlistItem);

// MOVE WISHLIST TO CART
router.get("/wishlist/move-to-cart/:productId",cacheMiddleware.noCache,isLoggedIn,userController.moveWishlistToCart);


// CHECKOUT
router.get("/checkout",cacheMiddleware.noCache,isLoggedIn,userController.getCheckout);


// PLACE ORDER
router.post("/checkout/place-order",cacheMiddleware.noCache,isLoggedIn,userController.placeOrder);

// ORDER SUCCESS
router.get("/order-success/:orderId",cacheMiddleware.noCache,isLoggedIn,userController.getOrderSuccess);

// GET ORDERS 
router.get("/orders",cacheMiddleware.noCache,isLoggedIn,userController.getOrders);

// ORDER DETAILS
router.get("/orders/:id",cacheMiddleware.noCache,isLoggedIn,userController.getOrderDetails);

// CANCEL ORDER
router.post("/orders/:orderId/product/:productId/cancel",cacheMiddleware.noCache,isLoggedIn,userController.cancelProduct);
// REORDER PRODUCT
router.post("/orders/reorder/:productId",cacheMiddleware.noCache,isLoggedIn,userController.reorderProduct);

// RETURN ORDER
router.post("/orders/:id/return",cacheMiddleware.noCache,isLoggedIn,userController.returnOrder);

// DOWNLOAD INVOICE
router.get("/orders/:id/invoice",cacheMiddleware.noCache,isLoggedIn,userController.downloadInvoice);


// LOGOUT
router.get("/logout",isLoggedIn,(req,res,next)=>{
  req.logout(err=>{
    if(err) return next(err);
    req.session.destroy(()=>{
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  });
});

module.exports=router;