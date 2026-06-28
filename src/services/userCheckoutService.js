const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

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