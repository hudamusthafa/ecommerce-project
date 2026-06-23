const Wishlist=require("../models/Wishlist");
const Product=require("../models/Product");

// ADD TO WISHLIST

exports.addToWishlist=async(userId,productId)=>{

  // CHECK PRODUCT
  const product=await Product.findById(productId);

  if(!product || product.isDeleted){
    const error=new Error("Product unavailable");
    error.statusCode=404;
    throw error;
  }

  
  let wishlist=await Wishlist.findOne({
    user:userId
  });

  // CREATE WISHLIST
  if(!wishlist){

    wishlist=new Wishlist({
      user:userId,
      products:[productId]
    });

  }

  else{

    const exists = wishlist.products.some(
      item=>item.toString()===productId.toString()
    );

    if(exists){
      throw new Error("Already in wishlist")
      
    }
    wishlist.products.push(productId);

  }

  await wishlist.save();

  return wishlist;
};

// GET WISHLIST

exports.getWishlist=async(userId)=>{

  return await Wishlist.findOne({
    user:userId
  })

  .populate({
    path:"products",
    populate:{
      path:"category"
    }
  });

};

// REMOVE WISHLIST ITEM

exports.removeWishlistItem=async(
  userId,
  productId
)=>{

  const wishlist=await Wishlist.findOne({
    user:userId
  });

  if(!wishlist){
    const error=new Error("Wishlist not found");
      error.statusCode=404;
      throw error;
  }

  wishlist.products = wishlist.products.filter(
  item => item.toString() !== productId.toString()
);

  await wishlist.save();

  return wishlist;
};