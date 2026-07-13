const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");

exports.getCheckoutData = async(userId,buyNow = null) => {

  const user = await User.findById(userId);

  // buyNow section

  if(buyNow){

  const product = await Product.findById(
    buyNow.productId
  );

  if(!product){

    throw new Error("Product not found");

  }


  if(product.stock <= 0){
    throw new Error(product.name + "Out Of Stock")
  }
  const subtotal =
    product.price * buyNow.quantity;

  return {

    user,

    cart:{
      items:[
        {
          product,
          quantity:buyNow.quantity
        }
      ]
    },

    subtotal,
    shipping:0,
    discount:0,
    total:subtotal

  };

}


  const cart = await Cart.findOne({
    user: userId
  })
  .populate("items.product");


  
  // CART NOT FOUND
  if(!cart){

    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;

  }

  // REMOVE INVALID PRODUCTS
  
// Collect unavailable products
const removedProducts = [];

cart.items = cart.items.filter(item => {

  if (!item.product || item.product.stock <= 0) {

    removedProducts.push(
      item.product ? item.product.name : "Product"
    );
    return false;
  }
  return true;
});

// Save updated cart if products were removed
if (removedProducts.length > 0) {
  await cart.save();
}

  // NO VALID PRODUCTS
  if(cart.items.length === 0){

    const error = new Error(
      "Your cart is empty"
    );

    error.statusCode = 400;
    throw error;

  }

  const subtotal = cart.items.reduce(

    (total,item) => {
       if(item.product && item.product.stock > 0){

      return total + (item.product.price * item.quantity);
    }
    return total;
  },
    0

  );

  const shipping = 0;
  const discount = 0;

  const total = subtotal + shipping - discount;

  return {
    user,
    cart,
    subtotal,
    shipping,
    discount,
    total,
    removedProducts
  };

};
//============================================

exports.applyCoupon = async (userId, couponCode) => {

    if (!couponCode || !couponCode.trim()) {
        throw new Error("Please enter a coupon code.");
    }

    const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase()
    });

    if (!coupon) {
        throw new Error("Invalid coupon code.");
    }

    // Disabled coupon
    if (!coupon.isActive) {
        throw new Error("This coupon is currently disabled.");
    }

    const today = new Date();

    // Not started yet
    if (today < coupon.startDate) {
        throw new Error("This coupon is not active yet.");
    }

    // Expired
    if (today > coupon.expiryDate) {
        throw new Error("This coupon has expired.");
    }


 const cart = await Cart.findOne({ user: userId })
          .populate("items.product");


    if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty.");
}

     

          //calculate the subtotal

      let subtotal = 0;

      cart.items.forEach(item => {

          if (!item.product) return;

          subtotal += item.product.price * item.quantity;

      });

      if (subtotal < coupon.minPurchase) {
          throw new Error(
              `Minimum purchase should be ₹${coupon.minPurchase}.`
          );
      }
      //calculate the discount

      let discount = 0;

      if (coupon.discountType === "percentage") {

          discount = Math.round(subtotal * coupon.discountValue / 100);

          if (coupon.maxDiscount > 0) {
              discount = Math.min(discount, coupon.maxDiscount);
          }

      } else {

          discount = Math.min(
          coupon.discountValue,
          subtotal
      );
      }

//final total
const total = subtotal - discount;

    return {
        success: true,
        message: "Coupon applied successfully.",
        coupon,
        subtotal,
        discount,
        total
    };

};