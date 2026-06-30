const Order = require("../models/Order");
const Product = require("../models/Product"); 

exports.getOrders = async (search, status, page, limit, dateFrom, dateTo) => {

  const skip = (page - 1) * limit;

  let query = {};

  // SEARCH

  if(search){
    query.orderId = { $regex: search, $options: "i" };
  }

  // STATUS FILTER

  if(status){
    query.orderStatus = status;
  }

  //  DATE FILTER

  if(dateFrom || dateTo){
    query.createdAt = {};
    if(dateFrom){
      query.createdAt.$gte = new Date(dateFrom);
    }

    if(dateTo){
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt.$lte = endDate;
    }
  }

  const orders = await Order.find(query)

    .populate("user")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Order.countDocuments(query);

  return {
    orders,
    total,
    totalPages: Math.ceil(total / limit)
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


// ADMIN WORKFLOW CONTROLS 
  
 
  if (previousStatus === "Delivered" || previousStatus === "Cancelled" || previousStatus === "Returned") {
    throw new Error("This order is already finalized and cannot be changed.");
  }


  if (previousStatus === "Placed" && status !== "Processing" && status !== "Cancelled") {
    throw new Error("From Placed, order can only go to Processing or Cancelled.");
  }

  
  if (previousStatus === "Processing" && status !== "Shipped" && status !== "Cancelled") {
    throw new Error("From Processing, order can only go to Shipped or Cancelled.");
  }

  
  if (previousStatus === "Shipped" && status !== "Delivered") {
    throw new Error("Shipped orders can only be updated to Delivered.");
  }


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


if (
  status === "Processing" ||
  status === "Shipped" ||
  status === "Delivered"
) {

  order.items.forEach(item => {

    
    if (
      item.status !== "Cancelled" &&
      item.status !== "Returned" &&
      item.status !== "Return Requested"
    ) {
      item.status = status;
    }

  });

}
  await order.save();

  return order;

};



exports.approveReturn = async(orderId,productId)=>{

   const order = await Order.findById(orderId)
      .populate("items.product");

   const item = order.items.find(i =>
      i.product._id.toString()===productId
   );

   if(!item){
      throw new Error("Product not found");
   }

item.status = "Returned";

// Restore stock
await Product.findByIdAndUpdate(
    productId,
    {
        $inc: {
            stock: item.quantity
        }
    }
);

// Check whether ALL items are returned
const allReturned = order.items.every(i =>
    i.status === "Returned"
);

if (allReturned) {

    order.orderStatus = "Returned";
    order.isReturned = true;

} else {

    // Some products are still active
    order.orderStatus = "Delivered";
    order.isReturned = false;

}

await order.save();

return order;

};

//======================================================

exports.rejectReturn = async (orderId, productId) => {

   const order = await Order.findById(orderId);

   if (!order) {
      throw new Error("Order not found");
   }

   const item = order.items.find(
      i => i.product.toString() === productId
   );

   if (!item) {
      throw new Error("Product not found");
   }

   
   item.status = "Delivered";
   item.returnReason = "";

  

   // Check ,any other pending return requests
  const pendingReturns = order.items.some(
    i => i.status === "Return Requested"
);

if (!pendingReturns) {

    order.orderStatus = "Delivered";

}

   await order.save();

   return order;
};





// APPROVE BULK RETURNS
exports.approveAllReturns = async (orderId) => {

  const order = await Order.findById(orderId)
    .populate("items.product");

  if (!order) {
    throw new Error("Order not found");
  }

  for (const item of order.items) {

    if (item.status === "Return Requested") {

      item.status = "Returned";

      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stock: item.quantity
          }
        }
      );

    }

  }

  order.orderStatus = "Returned";
  order.isReturned = true;

  await order.save();

  return order;

};




// REJECT BULK RETURNS
exports.rejectAllReturns = async (orderId) => {

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  order.items.forEach(item => {

    if (item.status === "Return Requested") {

      item.status = "Delivered";
      item.returnReason = "";

    }

  });

  order.orderStatus = "Delivered";
  order.isReturned = false;

  await order.save();

  return order;

};
