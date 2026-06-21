
const Order = require("../models/Order");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.placeOrder=async(userId,addressId,buyNow=null)=>{

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

    const subtotal=product.price*buyNow.quantity;
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
      total:subtotal,
      paymentMethod:"COD"
    });

    await order.save();

    await Product.findByIdAndUpdate(
      product._id,
      {$inc:{stock:-buyNow.quantity}}
    );

    return order;
  }

  // CART ORDER
  const cart=await Cart.findOne({user:userId})
    .populate("items.product");

  if(!cart) throw new Error("Cart is empty");

  cart.items=cart.items.filter(item=>item.product);
  await cart.save();

  if(cart.items.length===0){
    throw new Error("Cart is empty");
  }

  for(const item of cart.items){
    if(item.quantity>item.product.stock){
      throw new Error(
        item.product.name+" has only "+
        item.product.stock+" item(s) left"
      );
    }
  }

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
    paymentMethod:"COD"
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



// CANCEL ORDER

exports.cancelOrder = async(orderId,reason)=>{

  const order = await Order.findById(orderId);

  if(!order){
    throw new Error("Order not found");
  }

  if(order.orderStatus === "Cancelled"){
    throw new Error("Order already cancelled");
  }

  // restore stock
  for(const item of order.items){

    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc:{
          stock:item.quantity
        }
      }
    );

  }

  // update order status
  order.orderStatus = "Cancelled";

  // save cancellation reason
  order.cancelReason = reason || "";

  await order.save();

  return order;

};


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
    }
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


  await order.save();

  return order;
};

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

  //  request return — admin will approve and restore stock
  order.orderStatus = "Return Requested";
  order.returnReason = reason;

  await order.save();

  return order;

};

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
  item.status = "Returned";
  item.returnReason = reason;

  // Check if all items are returned
  const allReturned = order.items.every(
    item => item.status === "Returned"
  );

  if (allReturned) {
    order.orderStatus = "Return Requested";
    order.returnReason = reason;
  }

  await order.save();
  return order;

};