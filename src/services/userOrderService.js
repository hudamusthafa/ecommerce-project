
const Order = require("../models/Order");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const userWalletService = require("./userWalletService");

//==========================================================

exports.placeOrder = async (
    userId,
    addressId,
    paymentMethod,
    buyNow = null
)=>{

  
  const user=await User.findById(userId);
  const selectedAddress=user.address.id(addressId);

  if(!selectedAddress){
    throw new Error("Address not found");
  }

  // BUY NOW ORDER
  if(buyNow){

    const product=await Product.findById(buyNow.productId);

    if(!product) throw new Error("Product not found");

    if(product.stock<buyNow.quantity) throw new Error("Product is out of stock");

    const subtotal = product.price * buyNow.quantity;

    const shipping = 0;
    const discount = 0;
    const total = subtotal + shipping - discount; 
    

// Wallet Payment
if (paymentMethod === "Wallet") {

    const wallet = await userWalletService.getWallet(userId);

    if (wallet.balance < total) {
        throw new Error("Insufficient wallet balance.");
    }

    await userWalletService.debitWallet(
        userId,
        total,
        "Wallet Payment"
    );
}

    // Generate Order ID
    const orderId="ORD"+Date.now();

    const order=new Order({
      user:userId,
      orderId,
      items:[{
        product:product._id,
        quantity:buyNow.quantity,
        price:product.price,
        status:"Placed"
      }],
      address:{
        fullName:selectedAddress.fullName,
        phone:selectedAddress.phone,
        house:selectedAddress.house,
        area:selectedAddress.area,
        city:selectedAddress.city,
        state:selectedAddress.state,
        pincode:selectedAddress.pincode
      },
      subtotal,
      shipping:0,
      discount:0,
      total:total,
      paymentMethod,

  paymentStatus:
    paymentMethod === "COD"
        ? "Pending"
        : "Paid",
    });

    await order.save();

    await Product.findByIdAndUpdate(
      product._id,
      {$inc:{stock:-buyNow.quantity}}
    );

    return order;
  }

  // CART ORDER
 const cart = await Cart.findOne({ user:userId })
  .populate({
    path: "items.product",
    populate: {
      path: "category"
    }
  });

  if(!cart) throw new Error("Cart is empty");


  //Remove Invalid Products
  cart.items = cart.items.filter(item => {

  return (
    item.product &&
    item.product.isListed &&
    item.product.stock > 0 &&
    item.product.category &&
    item.product.category.isListed
  );

});

if(cart.items.length === 0){

    throw new Error(
      "No available products in your cart."
    );

}
  await cart.save();

  
  for(const item of cart.items){
    if(item.quantity>item.product.stock){
      throw new Error(
        item.product.name+" has only "+
        item.product.stock+" item(s) left"
      );
    }
  }

  //Convert Cart Items into Order Items
  const orderItems=cart.items.map(item=>({
    product:item.product._id,
    quantity:item.quantity,
    price:item.product.price,
    status:"Placed"
  }));

  const subtotal=cart.items.reduce(
    (total,item)=>total+(item.product.price*item.quantity),
    0
  );

  const shipping=0;
  const discount=0;
  const total=subtotal+shipping-discount;
  const orderId="ORD"+Date.now();



// Wallet Payment
if (paymentMethod === "Wallet") {

    const wallet = await userWalletService.getWallet(userId);

    if (wallet.balance < total) {
        throw new Error("Insufficient wallet balance.");
    }

    await userWalletService.debitWallet(
        userId,
        total,
        "Wallet Payment",
        orderId
    );
}


  const order=new Order({
    user:userId,
    orderId,
    items:orderItems,
    address:{
      fullName:selectedAddress.fullName,
      phone:selectedAddress.phone,
      house:selectedAddress.house,
      area:selectedAddress.area,
      city:selectedAddress.city,
      state:selectedAddress.state,
      pincode:selectedAddress.pincode
    },
    subtotal,
    shipping,
    discount,
    total,
    paymentMethod,

  paymentStatus:
    paymentMethod === "COD"
        ? "Pending"
        : "Paid",
  });

  await order.save();

//Stock Reduction After Successful Order

  for(const item of cart.items){
    await Product.findByIdAndUpdate(
      item.product._id,
      {$inc:{stock:-item.quantity}}
    );
  }

  cart.items=[];
  await cart.save();

  return order;
};



//==========================================================


// view user orders list
exports.getOrders = async(userId, search)=>{

  let query = {
    user:userId
  };

  let orders = await Order.find(query)
    .populate("items.product")
    .sort({createdAt:-1});




  if(search){

    const searchText = search.toLowerCase();

    orders = orders.filter(order => {


      //serch by orderId
      const orderMatch =
        order.orderId.toLowerCase().includes(searchText);
     
         //search by name
      const productMatch =
        order.items.some(item =>
          item.product &&
          item.product.name
            .toLowerCase()
            .includes(searchText)
        );

      return orderMatch || productMatch;

    });

  }

  return orders;

};

//==========================================================


//get order details

exports.getOrderDetails=async(orderId,userId)=>{



  const order=await Order.findOne({
  _id:orderId,
  user:userId
}).populate("items.product");



  if(!order){
    throw new Error("Order not found");
  }

  return order;
};

//==========================================================

// CANCEL ORDER

exports.cancelOrder = async (orderId, reason) => {

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.orderStatus === "Cancelled") {
    throw new Error("Order already cancelled");
  }

  // Restore stock and update each item
  for (const item of order.items) {

    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: item.quantity
        }
      }
    );

    item.status = "Cancelled";
    item.cancelReason = reason || "";
  }

 order.orderStatus = "Cancelled";
order.cancelReason = reason || "";

// If payment was already completed,
// refund the amount to wallet.



if (order.paymentStatus === "Paid" ) {

    await userWalletService.creditWallet(

        order.user,
        order.total,
        "Refund for Cancelled Order",
        order.orderId

    );

    order.paymentStatus = "Refunded";

}

await order.save();
return order;
};
//==========================================================

//cancel each product
exports.cancelProduct = async (
  orderId,
  productId,
  reason
) => {

  const order = await Order.findById(orderId);

  if(!order){
    throw new Error("Order not found");
  }

  const item = order.items.find(
    item => item.product.toString() === productId
  );

  if(!item){
    throw new Error("Product not found");
  }


  
  if(item.status === "Cancelled"){
    throw new Error("Product already cancelled");
  }


  await Product.findByIdAndUpdate(
    productId,
    {
      $inc:{
        stock:item.quantity
      }
    },
 
  );



  item.status = "Cancelled";
  item.cancelReason = reason || "";

  const allCancelled = order.items.every(
    item => item.status === "Cancelled"
  );

  if(allCancelled){
    order.orderStatus = "Cancelled";
  }

// Recalculate subtotal after cancellation

const activeItems = order.items.filter(
  item => item.status !== "Cancelled"
);

order.subtotal = activeItems.reduce(
  (total, item) =>
    total + (item.price * item.quantity),
  0
);

const shipping = order.shipping || 0;
const discount = order.discount || 0;

order.total =
  order.subtotal +
  shipping -
  discount;




// Refund to wallet 

if (order.paymentMethod === "Wallet") {

  const refundAmount = item.price * item.quantity;

  await userWalletService.creditWallet(
    order.user,
    refundAmount,
    "Order Cancellation Refund",
    order.orderId
  );

}


  await order.save();

  return order;
};

//==========================================================

//RE-ORDER



exports.reorderProduct=async(userId,productId)=>{

  const product=await Product.findById(productId);

  if(!product){
    throw new Error("Product not found");
  }

  if(product.stock<1){
    throw new Error("Product is out of stock");
  }

  let cart=await Cart.findOne({user:userId});

  if(!cart){
    cart=new Cart({
      user:userId,
      items:[]
    });
  }

  const existingItem=cart.items.find(
    item=>item.product.toString()===productId
  );

  if(existingItem){
    existingItem.quantity+=1;
  }else{
    cart.items.push({
      product:productId,
      quantity:1
    });
  }

  await cart.save();

  return cart;
};

//==========================================================

// RETURN ORDER

exports.returnOrder = async (orderId, reason) => {

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.orderStatus !== "Delivered") {
    throw new Error("Only delivered orders can be returned");
  }

  if (!reason || !reason.trim()) {
    throw new Error("Return reason is required");
  }

  if (order.isReturned) {
    throw new Error("Order already returned");
  }

  //  Request return for all products — admin will approve and restore stock
  // order.orderStatus = "Return Requested";
  // order.returnReason = reason;

  // order.items.forEach(item=>{
  //   order.item = "Return Requested";
  //   order.returnReason = reason;
  // })

  // await order.save();

  order.items.forEach(item => {
  if (item.status === "Delivered") {
    item.status = "Return Requested";
    item.returnReason = reason;
  }
});

await order.save();

  return order;

};
//==========================================================

// RETURN SINGLE PRODUCT
exports.returnProduct = async (orderId, productId, reason) => {


  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found");

  if (order.orderStatus !== "Delivered") {
    throw new Error("Only delivered orders can be returned");
  }

  const item = order.items.find(
    item => item.product.toString() === productId
  );

  if (!item) throw new Error("Product not found");

  if (item.status === "Returned") {
    throw new Error("Product already returned");
  }

  if (!reason || !reason.trim()) {
    throw new Error("Return reason is required");
  }

  // Request return for this item only
item.status = "Return Requested";
item.returnReason = reason;


  await order.save();

  return order;

};

//==========================================================

exports.approveReturn = async (orderId, productId) => {

  const order = await Order.findById(orderId)
    .populate("items.product");

  if (!order) {
    throw new Error("Order not found");
  }

  const item = order.items.find(
    item => item.product._id.toString() === productId
  );

  if (!item) {
    throw new Error("Product not found");
  }

  if (item.status !== "Return Requested") {
    throw new Error("No return request found");
  }

  // Restore stock
  await Product.findByIdAndUpdate(
    productId,
    {
      $inc: {
        stock: item.quantity
      }
    }
  );

  // Mark item as returned
  item.status = "Returned";


// Refund to wallet only if payment  completed

if (order.paymentStatus === "Paid") {

    const refundAmount = item.price * item.quantity;

    await userWalletService.creditWallet(

        order.user,
        refundAmount,
        "Refund for Returned Product",
        order.orderId

    );

}


  // Check whether all items are returned
  const allReturned = order.items.every(
    item => item.status === "Returned"
  );

  if (allReturned) {
    order.orderStatus = "Returned";
    order.isReturned = true;
  } else {
    // Some products still active
    order.orderStatus = "Delivered";
  }

  if (order.paymentStatus === "Paid") {

    const activeItems = order.items.filter(
        item => item.status !== "Returned"
    );

    if (activeItems.length === 0) {
        order.paymentStatus = "Refunded";
    }
}

await order.save();

return order;
};

//=====================================

exports.rejectReturn = async (orderId, productId) => {

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const item = order.items.find(
    item => item.product.toString() === productId
  );

  if (!item) {
    throw new Error("Product not found");
  }

  if (item.status !== "Return Requested") {
    throw new Error("No return request found");
  }

  item.status = "Placed";
  item.returnReason = "";

  const pendingReturns = order.items.some(
    item => item.status === "Return Requested"
  );

  if (!pendingReturns) {
    order.orderStatus = "Delivered";
  }

  await order.save();

  return order;
};