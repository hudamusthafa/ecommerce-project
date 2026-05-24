const userService = require("../services/userService");
const { changePasswordService } = require("../services/authService");
const Product=require("../models/Product");
const Category=require("../models/Category");
const userProductService=require("../services/userProductService");
const userCartService=require("../services/userCartService");


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
    res.redirect("/address");   
  } catch (err) {
    res.send("Error deleting address");
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
exports.getProductsPage=async(req,res)=>{

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
   
    res.redirect("/home");

  }

};

//product details

exports.getProductDetails=async(req,res)=>{

  try{

    const data=await userProductService.getProductDetails(

      req.params.id

    );

    // PRODUCT NOT FOUND
    if(!data){

      return res.redirect("/products?error=productUnavailable");

    }

    res.render(

      "user/product-details",

      {
        product:data.product,
        relatedProducts:data.relatedProducts,
        user:req.user || null
      }
    );
  }

  catch(error){
    
    res.redirect("/products?error=productUnavailable");
  }

};


// add to cart

exports.addToCart=async(req,res)=>{

  try{

    await userCartService.addToCart(
      req.user._id,
      req.params.productId
    );
    res.redirect("/cart");
  }

  catch(error){
   
    res.redirect("/products");
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
exports.updateCartQuantity=async(req,res)=>{

  try{

    await userCartService.updateQuantity(
      req.user._id,
      req.params.productId,
      req.query.action
    );
    res.redirect("/cart");
  }

  catch(error){
    res.redirect("/cart?error=" + encodeURIComponent(error.message) 
 + "&productId=" + req.params.productId
  );

  }
};


//REMOVE PRODUCT

exports.removeCartProduct=async(req,res)=>{

  try{

    await userCartService.removeCartProduct(
      req.user._id,
      req.params.productId
    );
    res.redirect("/cart");
  }

  catch(error){
   
    res.redirect("/cart");
  }
};









// CHECKOUT
exports.getCheckout = async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  res.render("user/checkout", { user });
};