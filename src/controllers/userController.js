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
// ADD ADDRESS



exports.getAddressPage = async (req, res) => {
  const user = await userService.getUserById(req.user._id);

  res.render("user/address", { user });
};

exports.addAddress = async (req, res) => {

  try {

    
    await userService.addAddress(req.user._id, req.body);
    res.redirect("/address"); 

  } catch (err) {
    res.send("Error adding address");
  }
};

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

// UPDATE ADDRESS
exports.updateAddress = async (req, res) => {
  try {
    await userService.updateAddress(req.user._id, req.params.id, req.body);
    res.redirect("/address");   
  } catch (err) {
    res.send("Error updating address");
  }
};

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

// PROFILE PAGE
exports.getProfile = (req, res) => {
res.render("user/profile", { user: req.user, error: null, success: null });};

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

    res.render(
      "user/products",
      {
        ...data,
        user:req.user || null
      }
    );
  }

  catch(error){
   
     next(error);

  }

};

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


// add to cart

exports.addToCart=async(req,res,next)=>{

  try{

    await userCartService.addToCart(
      req.user._id,
      req.params.productId
    );
    res.redirect("/cart");
  }

  catch(error){
   
      next(error);
  }

};

//show cart page


exports.getCart=async(req,res)=>{

  try{
    const cart=await userCartService.getCart(
      req.user._id
    );

    res.render(
      "user/cart",
      {
        cart,
        user:req.user || null,
         error:req.query.error,
         productId:req.query.productId
      }
    );
  }

  catch(error){
  
    res.redirect("/products");

  }

};


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
if(error.message==="Stock limit reached"){

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

//ADD TO WISHLIST

exports.addToWishlist=async(req,res,next)=>{
  try{

    await userWishlistService.addToWishlist(
      req.user._id,
      req.params.productId
    );

    res.redirect("/wishlist");

  }catch(error){

      next(error);

  }
};


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


// MOVE WISHLIST TO CART 

exports.moveWishlistToCart = async(req,res,next)=>{

  try{

    await userCartService.addToCart(
      req.user._id,
      req.params.productId
    );

    await userWishlistService.removeWishlistItem(
      req.user._id,
      req.params.productId
    );

    res.redirect("/wishlist");
  }

  catch(error){
    next(error);
  }

};


// CHECKOUT
exports.getCheckout=async(req,res,next)=>{
  try{

    const data=await userCheckoutService.getCheckoutData(
      req.user._id
    );

    res.render("user/checkout",{
      user:data.user,
      cart:data.cart,
      subtotal:data.subtotal,
      shipping:data.shipping,
      discount:data.discount,
      total:data.total,
      error:req.query.error
    });

  }catch(error){

    next(error);
  }
};


//PLACE ORDER

exports.placeOrder=async(req,res,next)=>{
  try{

    const order=await userOrderService.placeOrder(
      req.user._id,
      req.body.selectedAddress
    );

  res.redirect("/order-success/" + order.orderId);

  }catch(error){
    res.redirect(
    "/checkout?error=" +
    encodeURIComponent(error.message)
  );
  }
};

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



//get orders 

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

//get order details
exports.getOrderDetails=async(req,res,next)=>{
  try{

    const order=await userOrderService.getOrderDetails(
      req.params.id,
      req.user._id
    );

    res.render("user/order-details",{
      order,
      user:req.user
    });

  }catch(error){
    next(error);
  }
};

//cancel order
exports.cancelOrder=async(req,res,next)=>{
  try{

    await userOrderService.cancelOrder(
      req.params.id,
      req.body.reason
    );

    res.redirect("/orders/"+req.params.id);

  }catch(error){

    next(error);
  }
};


//RETURN ORDER

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

//DOWNLOAD INVOICE

exports.downloadInvoice=async(req,res,next)=>{
  try{

    const order=await Order.findOne({
      _id:req.params.id,
      user:req.user._id
    }).populate("items.product");

    if(!order){
      return res.status(404).send("Order not found");
    }

    const doc=new PDFDocument({margin:50});

    res.setHeader("Content-Type","application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${order.orderId}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(22).text("INVOICE",{align:"center"});
    doc.moveDown();
    doc.fontSize(12);

    doc.text(`Order ID: ${order.orderId}`);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Status: ${order.orderStatus}`);

    doc.moveDown();

    doc.text("Customer Details");
    doc.text(order.address.fullName);
    doc.text(order.address.phone);
    doc.text(`${order.address.house}, ${order.address.area}`);
    doc.text(`${order.address.city}, ${order.address.state}`);
    doc.text(order.address.pincode);

    doc.moveDown();

    doc.text("Products");

    order.items.forEach(item=>{
      doc.text(`${item.product.name} | Qty: ${item.quantity} | ₹${item.price} | Total: ₹${item.quantity*item.price}`);
    });

    doc.moveDown();

    doc.text(`Subtotal: ₹${order.subtotal}`);
    doc.text(`Shipping: ₹${order.shipping}`);
    doc.text(`Discount: ₹${order.discount}`);
    doc.fontSize(14).text(`Grand Total: ₹${order.total}`);

    doc.end();

  }catch(error){

    next(error);
  }
};