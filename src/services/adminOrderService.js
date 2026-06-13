const Order = require("../models/Order");

exports.getOrders = async(page,limit)=>{

  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate("user")
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments();

  return {
    orders,
    total,
    totalPages:Math.ceil(total/limit)
  };

};


//GET ORDER DETAILS

exports.getOrderDetails = async(orderId)=>{

  const order = await Order.findById(orderId)
    .populate("user")
    .populate("items.product");

  if(!order){
    throw new Error("Order not found");
  }

  return order;

};


//update orderstatus
exports.updateOrderStatus = async(orderId,status)=>{

  const order = await Order.findById(orderId);

  if(!order){
    throw new Error("Order not found");
  }

  order.orderStatus = status;

  await order.save();

  return order;

};