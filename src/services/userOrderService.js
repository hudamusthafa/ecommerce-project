
const Order = require("../models/Order");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.placeOrder = async(userId,addressId)=>{

const user = await User.findById(userId);
const cart = await Cart.findOne({user:userId}).populate("items.product");

//Remove Invalid Products
cart.items = cart.items.filter( item => item.product);
await cart.save();

//console.log("VALID ITEMS =",cart.items.length);

const selectedAddress=user.address.id(addressId);

if(!selectedAddress){
  throw new Error("Address not found");
}

//checking stock
for(const item of cart.items){

  if(item.quantity > item.product.stock){

    throw new Error(item.product.name +" has only " +
                    item.product.stock +" item(s) left");

  }

}

//coverting cart items to a format
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

//generate a new orderid
const orderId="ORD"+Date.now();


//create order

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
    {
      $inc:{
        stock:-item.quantity
      }
    }
  );

}

cart.items = [];
await cart.save();
//console.log("CART CLEARED");
//console.log("ORDER CREATED =",order.orderId);

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

// RETURN ORDER

exports.returnOrder=async(orderId,reason)=>{

  const order=await Order.findById(orderId);

  if(!order){
    throw new Error("Order not found");
  }

  if(order.orderStatus!=="Delivered"){
    throw new Error(
      "Only delivered orders can be returned"
    );
  }

  if(!reason || !reason.trim()){
    throw new Error(
      "Return reason is required"
    );
  }

  if(order.isReturned){
    throw new Error(
      "Order already returned"
    );
  }

  // RESTORE STOCK
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

  //update return information
  
  order.orderStatus="Returned";
  order.isReturned=true;
  order.returnReason=reason;

  await order.save();

  return order;
};