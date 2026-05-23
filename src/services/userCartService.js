const Cart=require("../models/Cart");
const Product=require("../models/Product");


// ADD TO CART
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
      cart.items[itemIndex].quantity += 1;

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

// GET CART PRODUCTS

exports.getCart=async(userId)=>{

  return await Cart.findOne({
    user:userId
  })
  .populate("items.product");
};