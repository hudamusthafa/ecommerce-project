const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  orderId:{
    type:String,
    required:true,
    unique:true
  },

  items:[{

  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product"
  },

  quantity:Number,

  price:Number,

  status:{
    type:String,
    enum:[
      "Placed",
      "Cancelled",
      "Returned"
    ],
    default:"Placed"
  },

 cancelReason:{
    type:String,
    default:""
  },

  returnReason:{
    type:String,
    default:""
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
    enum:[
      "Pending",
      "Paid"
    ],
    default:"Pending"
  },

  orderStatus:{
    type:String,
    enum:[
      "Placed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Return Requested",
      "Returned"
    ],
    default:"Placed"
  },

  cancelReason:{
    type:String,
    default:""
  },
  returnReason:{
    type:String,
    default:""
  },

  isReturned:{
    type:Boolean,
    default:false
  }

},{
  timestamps:true
});

module.exports = mongoose.models.Order ||
  mongoose.model("Order", orderSchema);