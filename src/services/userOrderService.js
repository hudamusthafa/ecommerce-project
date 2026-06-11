
const Order = require("../models/Order");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.placeOrder = async(userId,addressId)=>{

const user = await User.findById(userId);
const cart = await Cart.findOne({user:userId}).populate("items.product");


cart.items = cart.items.filter( item => item.product);
await cart.save();

//console.log("VALID ITEMS =",cart.items.length);

const selectedAddress=user.address.id(addressId);

if(!selectedAddress){
  throw new Error("Address not found");
}


for(const item of cart.items){

  if(item.quantity > item.product.stock){

    throw new Error(item.product.name +" has only " +
                    item.product.stock +" item(s) left");

  }

}

//coverting cart items
const orderItems=cart.items.map(item=>({
  product:item.product._id,
  quantity:item.quantity,
  price:item.product.price
}));





const subtotal=cart.items.reduce(
  (total,item)=>total+(item.product.price*item.quantity),
  0
);

const shipping=0;
const discount=0;

const total=subtotal+shipping-discount;

const orderId="ORD"+Date.now();

//console.log("ORDER ID =",orderId);




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




//reduce the stock after user order
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




// get user orders
exports.getOrders=async(userId)=>{

  const orders=await Order.find({user:userId})
    .populate("items.product")
    .sort({createdAt:-1});

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



// cancel order

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