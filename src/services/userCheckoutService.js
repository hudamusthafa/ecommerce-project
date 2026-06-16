const User = require("../models/User");
const Cart = require("../models/Cart");

exports.getCheckoutData = async(userId) => {

  const user = await User.findById(userId);

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
  

  const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      item => item.product
    );

    if(cart.items.length !== originalLength){
      await cart.save();
    }



  // NO VALID PRODUCTS
  if(cart.items.length === 0){

    const error = new Error(
      "No valid products in cart"
    );

    error.statusCode = 400;
    throw error;

  }

  const subtotal = cart.items.reduce(

    (total,item) => {

      return total + (
        item.product.price *
        item.quantity
      );

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
    total
  };

};