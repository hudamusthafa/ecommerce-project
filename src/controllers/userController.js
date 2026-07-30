const userService = require("../services/userService");
const { changePasswordService } = require("../services/authService");
const Product=require("../models/Product");
const Category=require("../models/Category");
const userProductService=require("../services/userProductService");
const userCartService=require("../services/userCartService");
const userWishlistService=require("../services/userWishlistService");
const userCheckoutService = require("../services/userCheckoutService");
const userOrderService = require("../services/userOrderService");
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const userWalletService = require("../services/userWalletService");
//const paypalService = require("../services/paypalService");
const stripe = require("../config/stripe");

// ADD ADDRESS


//==========================================================

exports.loadHome = async (req, res) => {

  try {

    const products = await Product.find({
      isDeleted: false,
      isListed: true
    })
    .sort({ createdAt: -1 })
    .limit(8);

    res.render("user/home", {
      user: req.user || null,
      products
    });

  } catch (error) {

    console.log(error);
    res.redirect("/pageNotFound");

  }

};
//==========================================================


exports.getAddressPage = async (req, res) => {
  const user = await userService.getUserById(req.user._id);

  res.render("user/address", { user });
};

//==========================================================

exports.addAddress = async (req, res) => {
  try {

    await userService.addAddress(req.user._id, req.body);

     if (req.query.fromCheckout) {
      return res.status(200).json({
        success: true
      });
    }
    res.redirect("/address");

  } catch (err) {

     console.error(err);

    if (req.query.fromCheckout) {
      return res.status(400).json({
        success: false,
        message: err.message || "Unable to add address"
      });
    }

    return res.status(500).send("Error adding address");
  }
};
//==========================================================


// DELETE ADDRESS
exports.deleteAddress = async (req, res) => {

  try {
    await userService.deleteAddress(req.user._id, req.params.id);
     res.json({
      success: true
    });

  } catch (err) {
    
   res.status(500).json({
      success: false
    });

  }
};
//==========================================================

// UPDATE ADDRESS
exports.updateAddress = async (req, res) => {
  try {
    await userService.updateAddress(req.user._id, req.params.id, req.body);
    res.redirect("/address");   
  } catch (err) {
    res.send("Error updating address");
  }
};


//==========================================================

// GET EDIT ADDRESS PAGE
exports.getEditAddress = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user._id);

    if (!user) {
      return res.send("User not found");
    }

    const address = user.address.id(req.params.id);

    if (!address) {
      return res.send("Address not found");
    }

    res.render("user/add-address", { address });

  } catch (err) {
    res.status(500).send("Error loading address");
  }
};

//==========================================================

// PROFILE PAGE
exports.getProfile = (req, res) => {

  const referralLink =
    `${req.protocol}://${req.get("host")}/register?ref=${req.user.referralCode}`;

  res.render("user/profile", {
    user: req.user,
    referralLink,
    error: null,
    success: null
  });

};

//==========================================================

// UPDATE PROFILE 
exports.updateProfile = async (req, res) => {
  try {

    const { name, email, gender } = req.body;

    // NAME VALIDATION
    if (!name || name.trim() === "") {
      return res.render("user/profile", {
        user: req.user,
        error: "Name is required",
        success: null
      });
    }

    //  EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      return res.render("user/profile", {
        user: req.user,
        error: "Enter a valid email",
        success: null
      });
    }

    //  GOOGLE USER EMAIL CHANGE BLOCK
    if (
      req.user.provider === "google" &&
      email !== req.user.email
    ) {
      return res.render("user/profile", {
        user: req.user,
        error: "Google users cannot change email",
        success: null
      });
    }

    const updates = {
      name,
      email,
      gender
    };

    if (req.file) {
      updates.profileImage = "/uploads/" + req.file.filename;
    }

    await userService.updateUser(req.user._id, updates);

    return res.render("user/profile", {
      user: { ...req.user, ...updates },
      error: null,
      success: "Profile updated successfully"
    });

  } catch (err) {
    return res.render("user/profile", {
      user: req.user,
      error: "Error updating profile",
      success: null
    });
  }
};

//==========================================================


// CHANGE PASSWORD (improved)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render("user/profile", {
        user: req.user,
        error: "All fields required",
        success: null
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("user/profile", {
        user: req.user,
        error: "Passwords do not match",
        success: null
      });
    }

    await changePasswordService(
      req.user._id,
      currentPassword,
      newPassword
    );

    return res.render("user/profile", {
      user: req.user,
      error: null,
      success: "Password updated successfully"
    });

  } catch (err) {
    return res.render("user/profile", {
      user: req.user,
      error: err.message,
      success: null
    });
  }
};

//==========================================================

//set paswrd for googlesignin users
exports.setPassword = async (req, res) => {
  try {

     if (req.user.provider !== "google") {
     return res.render("user/profile", {
        user: req.user,
        message: "Invalid request"
  });
}


    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.render("user/profile", {
        user: req.user,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("user/profile", {
        user: req.user,
        message: "Passwords do not match"
      });
    }

    // prevent overwrite
if (req.user.password && req.user.password !== "google" && req.user.password !== "google-auth") {
      return res.render("user/profile", {
        user: req.user,
        message: "Password already exists"
      });
    }

    await userService.setPassword(req.user._id, newPassword);

    res.render("user/profile", {
      user: { ...req.user, provider: "local" },
      message: "Password set successfully"
    });

  

  } catch (err) {
    res.render("user/profile", {
      user: req.user,
      message: err.message
    });
  }
};

//==============week 2===========

//product listing
exports.getProductsPage=async(req,res,next)=>{

  try{

    const data=await userProductService.getProducts(
      req.query
    );
   const addedProduct = req.query.added || "";
   const wishlistedProduct = req.query.wishlisted || "";


    res.render( "user/products",
       { 
        ...data, 
        user:req.user || null,
      addedProduct,
      wishlistedProduct} );
  }

  catch(error){
   
     next(error);

  }

};
//==========================================================

//product details

exports.getProductDetails=async(req,res,next)=>{

  try{

    const data=await userProductService.getProductDetails( req.params.id, req.user._id);

    // PRODUCT NOT FOUND
    if(!data){

      return res.redirect("/products?error=productUnavailable");

    }

    res.render(

      "user/product-details",

      {
        product:data.product,
        relatedProducts:data.relatedProducts,
        isWishlisted:data.isWishlisted,
        user:req.user || null
      }
    );
  }

  catch(error){
      next(error);
  }

};
//==========================================================


// add to cart

exports.addToCart=async(req,res,next)=>{

  try{

    await userCartService.addToCart(
      req.user._id,
      req.params.productId
    );

 res.json({
      success: true,
      message: "Added to cart"
    });
  }

  catch(error){
   
    if(error.message === "Already in cart"){
      return res.json({
        success: false,
        message: "Already in cart"
      });
    }
      next(error);
  }

};
//==========================================================

//show cart page


exports.getCart = async (req, res) => {

  try {

    const { cart, cartUpdated,hasUnavailableItems } =
      await userCartService.getCart(req.user._id);

    res.render(
      "user/cart",
      {
        cart,
        cartUpdated,
        hasUnavailableItems,
        user: req.user || null,
        error: req.query.error,
        productId: req.query.productId
      }
    );

  } catch (error) {

    res.redirect("/products");

  }

};
//==========================================================


//CART QUANTITY UPDATE
exports.updateCartQuantity=async(req,res,next)=>{

  try{

    await userCartService.updateQuantity(
      req.user._id,
      req.params.productId,
      req.query.action
    );
    res.redirect("/cart");
  }

  catch(error){
if(
    error.message === "Stock limit reached" ||
    error.message === "Maximum quantity reached"
  ){

    return res.redirect(
      "/cart?error=" +
      encodeURIComponent(error.message) +
      "&productId=" +
      req.params.productId
    );

  }

     next(error);
  

  }
};
//==========================================================


//REMOVE PRODUCT

exports.removeCartProduct=async(req,res,next)=>{

  try{

    await userCartService.removeCartProduct(
      req.user._id,
      req.params.productId
    );
    res.redirect("/cart");
  }

  catch(error){
   
      next(error);
  }
};

//=====================week3=================

// exports.buyNow = async (req, res, next) => {
//   try {

//     const productId = req.params.productId;

//     res.redirect(`/checkout?productId=${productId}`);

//   } catch (error) {
//     next(error);
//   }
// };


exports.buyNow = async (req, res, next) => {
  try {

    req.session.buyNow = {
      productId: req.params.productId,
      quantity: 1
    };

    res.redirect("/checkout?buyNow=true");

  } catch (error) {
    next(error);
  }
};

//==========================================================

//GET WISHLIST

exports.getWishlist=async(req,res,next)=>{
  try{

    const wishlist=await userWishlistService.getWishlist(
      req.user._id
    );

   res.render("user/wishlist",{
  wishlist: wishlist || { products: [] },
  user:req.user || null
});

  }catch(error){

   next(error);
  }
};

//==========================================================

//ADD TO WISHLIST

exports.addToWishlist=async(req,res,next)=>{
  try{

    await userWishlistService.addToWishlist(
      req.user._id,
      req.params.productId
    );

    res.json({
      success: true,
      message: "Added to wishlist"
    });

  }catch(error){

     if(error.message === "Already in wishlist"){
      return res.json({
        success: false,
        message: "Already in wishlist"
      });
    }
      next(error);

  }
};

//==========================================================

//REMOVE FROM WISHLIST

exports.removeWishlistItem=async(req,res,next)=>{
  try{

    await userWishlistService.removeWishlistItem(
      req.user._id,
      req.params.productId
    );

    res.redirect("/wishlist");

  }catch(error){

      next(error);

  }
};
//==========================================================


// MOVE WISHLIST TO CART 

exports.moveWishlistToCart = async(req,res,next)=>{

  try{

    //product aded to cart
    await userCartService.addToCart(
      req.user._id,
      req.params.productId
    );

    //product removed from wishlist
    await userWishlistService.removeWishlistItem(
      req.user._id,
      req.params.productId
    );

   return res.redirect("/wishlist?msg=addedToCart");
  }

  catch(error){

 //  Already in cart -  remove from wishlist
    if(error.message === "Already in cart"){
      await userWishlistService.removeWishlistItem(
        req.user._id,
        req.params.productId
      );
      return res.redirect("/cart?msg=alreadyInCart");
    }


    // Product unavailable - redirect back 
    if(error.message === "Product unavailable"){
      return res.redirect("/wishlist");
    }

    next(error);
  }

};
//==========================================================

// CHECKOUT
exports.getCheckout=async(req,res,next)=>{
  try{

//  Buy Now from wishlist
    if(req.query.product){
      req.session.buyNow = {
        productId: req.query.product,
        quantity: 1
      };
    }

   
   const data =
      await userCheckoutService.getCheckoutData(
        req.user._id,
        req.session.buyNow || null
      );


const coupons = await userCheckoutService.getAvailableCoupons();

// Apply session coupon for display
if (req.session.appliedCoupon) {

    data.discount = req.session.appliedCoupon.discount;

    data.total = req.session.appliedCoupon.total;
        
}

const wallet =
    await userWalletService.getWallet(
        req.user._id
    );

    res.render("user/checkout",{
      user:data.user,
      cart:data.cart,
      subtotal:data.subtotal,
      shipping:data.shipping,
      discount:data.discount,
      total:data.total,
      removedProducts:data.removedProducts,
      error:req.query.error,
      appliedCoupon: req.session.appliedCoupon || null,
      coupons,
      wallet,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
       //paypalClientId: process.env.PAYPAL_CLIENT_ID

      
    });

  }catch(error){

if(error.message === "Your cart is empty"){

    return res.render(
      "user/empty-cart",
      {
        title:"Cart Empty"
      }
    );

  }

    next(error);
  }
};

//=======================================



exports.applyCoupon = async (req, res, next) => {

    try {

        const result = await userCheckoutService.applyCoupon(
            req.user._id,
            req.body.couponCode,
            req.session.buyNow || null
        );


        req.session.appliedCoupon = {
        couponId: result.coupon._id,
        code: result.coupon.code,
        discount: result.discount,
        total: result.total
    };
        

 res.json(result);

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

//============remove coupon================

exports.removeCoupon = (req, res) => {

    req.session.appliedCoupon = null;

    res.redirect("/checkout");

};

//==========================================================
//PLACE ORDER

exports.placeOrder=async(req,res,next)=>{
  try{

const buyNow = req.session.buyNow || null;

const paymentMethod = req.body.paymentMethod;

const order = await userOrderService.placeOrder(
    req.user._id,
    req.body.selectedAddress,
    paymentMethod,
    buyNow
);

//  clear after order
delete req.session.buyNow;
delete req.session.appliedCoupon;

  res.redirect("/order-success/" + order.orderId);

  }catch(error){
    res.redirect(
    "/checkout?error=" +
    encodeURIComponent(error.message)
  );
  }
};


// =====================================
// CREATE PAYPAL ORDER


// exports.createPayPalOrder = async (req, res, next) => {

//     try {

//         const buyNow = req.session.buyNow || null;

//         const data = await userCheckoutService.getCheckoutData(
//             req.user._id,
//             buyNow
//         );

//         // Apply coupon if available
//         if (req.session.appliedCoupon) {

//             data.discount = req.session.appliedCoupon.discount;
//             data.total = req.session.appliedCoupon.total;

//         }

//         // PayPal Sandbox works in USD.
//         //  convert INR to USD.
//         const usdAmount = (data.total / 85).toFixed(2);

//         const paypalOrder = await paypalService.createOrder(
//             Number(usdAmount)
//         );

//         res.json({

//             success: true,
//             //redirectUrl: "/orders/" + order.orderId
//              orderID: paypalOrder.id
//         });

//     } catch (error) {

//         next(error);

//     }

// };

//==========================================================
// CAPTURE PAYPAL PAYMENT

// exports.capturePayPalOrder = async (req, res, next) => {

//     try {

//         const buyNow = req.session.buyNow || null;

//         // Capture payment from PayPal
//         await paypalService.captureOrder(
//             req.body.orderID
//         );

//         // Create order in our database
//         const order = await userOrderService.placeOrder(
//             req.user._id,
//             req.body.selectedAddress,
//             "PayPal",
//             buyNow
//         );

//         // Clear session
//         delete req.session.buyNow;
//         delete req.session.appliedCoupon;

//         res.json({

//             success: true,
//            orderId: order._id

//         });

//     } catch (error) {

//         next(error);

//     }

// };

//==================================

exports.createStripeSession = async (req, res, next) => {

    try {

        const buyNow = req.session.buyNow || null;

        const data =
            await userCheckoutService.getCheckoutData(
                req.user._id,
                buyNow
            );

        let total = data.total;

        // Apply coupon if available
        if (req.session.appliedCoupon) {
            total = req.session.appliedCoupon.total;
        }

        const session = await stripe.checkout.sessions.create({

            mode: "payment",

            payment_method_types: ["card"],

            line_items: [

                {

                    price_data: {

                        currency: "inr",

                        product_data: {

                            name: "Aura Order"

                        },

                        unit_amount: Math.round(total * 100)

                    },

                    quantity: 1

                }

            ],

            success_url:
                "http://localhost:3000/checkout/stripe/success?session_id={CHECKOUT_SESSION_ID}",

            cancel_url:
                "http://localhost:3000/checkout/stripe/cancel"

        });

        res.json({

            success: true,
            url: session.url

        });

    } catch (error) {

        console.log(error);
        next(error);

    }

};
exports.stripeSuccess = async (req, res, next) => {

    try {

        res.send("Stripe Payment Success");

    } catch (error) {

        next(error);

    }

};

exports.stripeCancel = async (req, res, next) => {

    try {

        res.redirect("/checkout");

    } catch (error) {

        next(error);

    }

};

//=================================
// PAYMENT SUCCESS PAGE

exports.getPaymentSuccess = async (req, res, next) => {

    try {

        const order = await Order.findById(
            req.params.id
        );

        if (!order) {

            return res.redirect("/orders");

        }

        res.render(
            "user/payment-success",
            {
                order
            }
        );

    } catch (error) {

        next(error);

    }

};


//==========================================================
//order success

exports.getOrderSuccess=async(req,res,next)=>{
  try{

    res.render("user/order-success",{
      orderId:req.params.orderId,
      user:req.user
    });

  }catch(error){
    next(error);
  }
};

//==============================

exports.getPaymentFailure = (req,res)=>{

res.render("user/payment-failure",{

user:req.user

});

};


//==========================================================

//view orders list

exports.getOrders=async(req,res,next)=>{
  try{

    const search=req.query.search||"";

    const orders=await userOrderService.getOrders(
      req.user._id,
      search
    );

    res.render("user/orders",{
      orders,
      user:req.user,
      search
    });

  }catch(error){

    next(error);
  }
};

//==========================================================


// get order details
exports.getOrderDetails = async (req, res, next) => {

  try {

    const order = await userOrderService.getOrderDetails(
      req.params.id,
      req.user._id
    );

    const cancelled = req.query.cancelled;

    // Get wallet
    const wallet = await userWalletService.getWallet(
      req.user._id
    );

    let refundMessage = null;

    if (
      order.paymentStatus === "Refunded" &&
      (order.paymentMethod === "Wallet" ||
       order.paymentMethod === "Razorpay")
    ) {

      const refundTxn = wallet.transactions.find(
        tx =>
          tx.type === "Credit" &&
          tx.orderId === order.orderId
      );

      if (refundTxn) {

        refundMessage = {
          amount: refundTxn.amount,
          balance: wallet.balance
        };

      }

    }

    res.render("user/order-details", {
      order,
      user: req.user,
      cancelled,
      refundMessage
    });

  } catch (error) {
    next(error);
  }

};


//==========================================================

//cancel each product
exports.cancelProduct = async(req,res,next)=>{
  try{

    await userOrderService.cancelProduct(
      req.params.orderId,
      req.params.productId,
      req.body.reason
    );

    res.redirect(
      "/orders/" + req.params.orderId
    );

  }catch(error){

    next(error);

  }
};

//==========================================================

//cancel order
exports.cancelOrder=async(req,res,next)=>{
  try{

    await userOrderService.cancelOrder(
      req.params.id,
      req.body.reason
    );

   res.redirect(
  "/orders/" +
  req.params.id +
  "?cancelled=true"
);

  }catch(error){

    next(error);
  }
};

//==========================================================

//RE-ORDER
exports.reorderProduct = async(
  req,
  res,
  next
)=>{
  try{

    await userOrderService.reorderProduct(
      req.user._id,
      req.params.productId
    );

    res.redirect("/cart");

  }catch(error){

    next(error);

  }
};

//==========================================================

//RETURN  BULK ORDER

exports.returnOrder=async(req,res,next)=>{
  try{

    await userOrderService.returnOrder(
      req.params.id,
      req.body.reason
    );

    res.redirect("/orders/"+req.params.id);

  }catch(error){

    next(error);
  }
};

//==========================================================

// RETURN SINGLE PRODUCT
exports.returnProduct = async (req, res, next) => {
  try {

    await userOrderService.returnProduct(
      req.params.orderId,
      req.params.productId,
      req.body.reason
    );

    res.redirect("/orders/" + req.params.orderId);

  } catch (error) {
    next(error);
  }
};

//==========================================================

// WALLET PAGE


exports.getWallet = async (req, res, next) => {

    try {

        const wallet = await userWalletService.getWallet(
            req.user._id
        );

        res.render("user/wallet", {
            user: req.user,
            wallet
        });

    } catch (error) {

        next(error);

    }

};





//=================================================
// DOWNLOAD INVOICE

exports.downloadInvoice=async(req,res,next)=>{
  try{

    const order=await Order.findOne({
      _id:req.params.id,
      user:req.user._id
    }).populate("items.product");

    if(!order){
      return res.status(404).send("Order not found");
    }

    const PDFDocument=require("pdfkit");

    const doc=new PDFDocument({
      margin:50
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${order.orderId}.pdf`
    );

    doc.pipe(res);

    // HEADER

    doc.fontSize(28)
      .fillColor("#9a6434")
      .font("Helvetica-Bold")
      .text("AURA",{align:"center"});

    doc.fontSize(11)
      .fillColor("gray")
      .font("Helvetica")
      .text("Jewellery Store",{align:"center"});

    doc.moveDown();

    doc.fontSize(24)
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("INVOICE",{align:"center"});

    doc.moveDown(2);

    // ORDER INFORMATION

    doc.fontSize(15)
      .fillColor("#9a6434")
      .font("Helvetica-Bold")
      .text("Order Information");

    doc.moveDown(0.5);

    doc.fontSize(12)
      .fillColor("black")
      .font("Helvetica");

    doc.text(`Order ID : ${order.orderId}`);

    doc.text(
      `Order Date : ${new Date(order.createdAt).toLocaleDateString()}`
    );

    doc.text(`Status : ${order.orderStatus}`);

    doc.moveDown();

    doc.moveTo(50,doc.y)
      .lineTo(550,doc.y)
      .stroke();

    doc.moveDown();

    // CUSTOMER DETAILS

    doc.fontSize(15)
      .fillColor("#9a6434")
      .font("Helvetica-Bold")
      .text("Customer Details");

    doc.moveDown(0.5);

    doc.fontSize(12)
      .fillColor("black")
      .font("Helvetica");

    doc.text(order.address.fullName);
    doc.text(order.address.phone);
    doc.text(order.address.house);
    doc.text(order.address.area);
    doc.text(`${order.address.city}, ${order.address.state}`);
    doc.text(order.address.pincode);

    doc.moveDown();

    doc.moveTo(50,doc.y)
      .lineTo(550,doc.y)
      .stroke();

    doc.moveDown();

    // PRODUCTS

    doc.fontSize(15)
      .fillColor("#9a6434")
      .font("Helvetica-Bold")
      .text("Products");

    doc.moveDown();

    const tableTop=doc.y;

    doc.rect(50,tableTop-5,500,22)
      .fill("#9a6434");

    doc.fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(12);

    doc.text("Product",60,tableTop);
    doc.text("Qty",300,tableTop);
    doc.text("Price",360,tableTop);
    doc.text("Total",460,tableTop);

    let y=tableTop+30;

    doc.fillColor("black")
      .font("Helvetica");

    order.items.forEach(item=>{

      if(item.status==="Cancelled") return;

const productName=item.product?.name || "Product";

 doc.text(item.product.name, 50, y, { width: 220 });
  doc.text(item.quantity.toString(), 300, y);
  doc.text(`₹${item.price}`, 360, y);
  doc.text(`₹${item.quantity * item.price}`, 460, y);

      y+=25;

    });

    doc.y=y+10;

    doc.moveTo(50,doc.y)
      .lineTo(550,doc.y)
      .stroke();

    doc.moveDown(2);

    // TOTALS

    doc.fontSize(12)
      .fillColor("black")
      .font("Helvetica");

    doc.text(`Subtotal : ₹${order.subtotal}`,{
      align:"right"
    });

    doc.text(`Shipping : ₹${order.shipping}`,{
      align:"right"
    });

    doc.text(`Discount : ₹${order.discount}`,{
      align:"right"
    });

    doc.moveDown();

    doc.fontSize(18)
      .fillColor("#9a6434")
      .font("Helvetica-Bold");

    doc.text(`Grand Total : ₹${order.total}`,{
      align:"right"
    });

    doc.moveDown(2);

    // FOOTER

    doc.fontSize(10)
      .fillColor("gray")
      .font("Helvetica");

    doc.text(
      "Thank you for shopping with Aura",
      {align:"center"}
    );

    doc.text(
      "This invoice was generated electronically.",
      {align:"center"}
    );

    doc.end();

  }catch(error){

    next(error);

  }
};