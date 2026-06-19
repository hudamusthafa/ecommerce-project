const Order = require("../models/Order");
const Product = require("../models/Product"); 

exports.getOrders = async(search,status,page,limit)=>{

  const skip = (page - 1) * limit;


  let query = {};

if(search){

  query.orderId = {
    $regex: search,
    $options: "i"
  };
}
if(status){

  query.orderStatus = status;

}

  const orders = await Order.find(query)
    .populate("user")
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

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


exports.updateOrderStatus = async (orderId, status) => {

  // Fetch order with product details
  const order = await Order.findById(orderId)
    .populate("items.product");

  if (!order) {
    throw new Error("Order not found");
  }

  const previousStatus = order.orderStatus;

  // STOCK RESTORE — when admin cancels or approves return
  const shouldRestoreStock =
    (status === "Cancelled" || status === "Returned") &&
    previousStatus !== "Cancelled" &&
    previousStatus !== "Returned";

  if (shouldRestoreStock) {

    for (const item of order.items) {

      // Skip already cancelled items (stock already restored)
      if (item.status === "Cancelled") continue;

      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: item.quantity } }
      );

    }

  }

  // Update the order status
  order.orderStatus = status;
  await order.save();

  return order;

};
