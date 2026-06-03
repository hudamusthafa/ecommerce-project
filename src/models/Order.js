const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  items:[{

    product:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Product",
      required:true
    },

    quantity:{
      type:Number,
      required:true
    },

    price:{
      type:Number,
      required:true
    }

  }],

  address:{

    fullName:String,
    phone:String,
    house:String,
    area:String,
    city:String,
    state:String,
    pincode:String

  },

  subtotal:{
    type:Number,
    required:true
  },

  shipping:{
    type:Number,
    default:0
  },

  discount:{
    type:Number,
    default:0
  },

  total:{
    type:Number,
    required:true
  },

  paymentMethod:{
    type:String,
    default:"COD"
  },

  paymentStatus:{
    type:String,
    enum:["Pending","Paid"],
    default:"Pending"
  },

  orderStatus:{
    type:String,
    enum:[
      "Placed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled"
    ],
    default:"Placed"
  }

},{
  timestamps:true
});

module.exports = mongoose.model(
  "Order",
  orderSchema
);