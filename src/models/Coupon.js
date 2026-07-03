const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  discountType: {
    type: String,
    enum: ["percentage", "flat"],
    required: true
  },

  discountValue: {
    type: Number,
    required: true,
    min: 1
  },

  maxDiscount: {
    type: Number,
    default: 0
  },

  minPurchase: {
    type: Number,
    default: 0
  },

  usageLimit: {
    type: Number,
    default: 1
  },

  usedCount: {
    type: Number,
    default: 0
  },

  perUserLimit: {
    type: Number,
    default: 1
  },

  startDate: {
    type: Date,
    required: true
  },

  expiryDate: {
    type: Date,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Coupon", couponSchema);