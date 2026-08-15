const Cart=require("../models/Cart");
const Product=require("../models/Product");



exports.addToCart=async(userId,productId)=>{
// CHECK PRODUCT
  const product=await Product.findById(productId);

  // PRODUCT NOT AVAILABLE
  if(!product || product.isDeleted){
    throw new Error("Product unavailable");
  }

    // OUT OF STOCK
  if(product.stock <= 0){
    throw new Error("Out of stock");
  }


  // FIND USER CART
  let cart=await Cart.findOne({
    user:userId
  });


  // CREATE CART IF NOT EXISTS
  if(!cart){
    cart=new Cart({
      user:userId,
      items:[{
        product:productId,
        quantity:1

      }]
    });
  }

  else{




     // CHECK PRODUCT ALREADY EXISTS
    const itemIndex=cart.items.findIndex(
      item => item.product.toString() === productId.toString()
    );

    // PRODUCT ALREADY IN CART
    if(itemIndex > -1){
  throw new Error("Already in cart");
}
     // NEW PRODUCT
    else{

      cart.items.push({
        product:productId,
        quantity:1

      });

    }

  }
  await cart.save();
  return cart;
};


exports.getCart = async (userId) => {

  const cart = await Cart.findOne({ user: userId })
    .populate("items.product");

  if (!cart) {
    return {
      cart: null,
      cartUpdated: false
    };
  }

  let cartUpdated = false;

  // Remove deleted products
  cart.items = cart.items.filter(item => item.product);

  for (const item of cart.items) {

    const product = item.product;

    // Skip unavailable products
    if (!product) continue;

    // Product unlisted
if (!product.isListed) {

  item.isUnavailable = true;
  item.unavailableReason = "This product is no longer available.";
  continue;

}

    // If stock becomes 0, remove from cart
    if (product.stock <= 0) {
      item.isUnavailable = true;
  item.unavailableReason = "This product is out of stock.";

      continue;
    }

    // If cart quantity is greater than stock
    if (item.quantity > product.stock) {

      item.quantity = product.stock;
      cartUpdated = true;

    }

  }

  await cart.save();

const hasUnavailableItems = cart.items.some(
  item => item.isUnavailable
);

  return {
    cart,
    cartUpdated,
    hasUnavailableItems
  };

};



exports.updateQuantity=async(

  userId,
  productId,
  action

)=>{

  const cart=await Cart.findOne({ user:userId});

  if(!cart){
    throw new Error("Cart not found");
  }

  const item=cart.items.find(
    item => item.product.toString() === productId
  );

  if(!item){
    throw new Error("Product not found");
  }

  //find original product
  const product=await Product.findById(productId);

  // INCREMENT
  if(action === "increase"){
    // STOCK VALIDATION
    if(item.quantity >= product.stock){
      throw new Error("Stock limit reached");
}

    // MAX LIMIT
    if(item.quantity >= 5){
      throw new Error("Maximum quantity reached");
    }
        item.quantity += 1;
      }

  // DECREMENT
  else if(action === "decrease"){
    if(item.quantity > 1){
      item.quantity -= 1;
    }
  }
  await cart.save();
  return cart;
};



exports.removeCartProduct=async(userId,productId)=>{

  const cart=await Cart.findOne({user:userId});

  if(!cart){
    throw new Error("Cart not found");
  }

  cart.items=cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();
  return cart;

};