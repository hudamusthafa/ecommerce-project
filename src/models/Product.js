const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ""
  },

  price: {
    type: Number,
    required: true
  },

  stock: {
    type: Number,
    required: true
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  variant: {
  type: String,
  enum: [
    "Gold Plated",
    "Rose Gold Plated",
    "Silver Plated"
  ],
  required: true
},

  images: [{
    type: String
  }],

 productOffer: {
    type: Number,
    default: 0
  },



  isListed:{
  type:Boolean,
  default:true
},

  isDeleted: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);