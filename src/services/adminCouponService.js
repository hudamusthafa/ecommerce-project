const Coupon = require("../models/Coupon");

//=======================================

// GET COUPONS
exports.getCoupons = async (search = "") => {

  const query = {};

  if (search) {
    query.code = {
      $regex: search,
      $options: "i"
    };
  }

  const coupons = await Coupon.find(query)
    .sort({ createdAt: -1 });

  return {
    coupons,
    total: coupons.length
  };

};
//========================================

// ADD COUPON
exports.addCoupon = async (data) => {

  const {

    code,
    description,
    discountType,
    discountValue,
    maxDiscount,
    minPurchase,
    usageLimit,
    perUserLimit,
    startDate,
    expiryDate

  } = data;

  // Check duplicate coupon
  const existingCoupon = await Coupon.findOne({
    code: code.trim().toUpperCase()
  });

  if (existingCoupon) {
    throw new Error("Coupon code already exists.");
  }

  // Validate dates
  if (new Date(startDate) >= new Date(expiryDate)) {
    throw new Error("Expiry date must be later than the start date.");
  }

  // Validate percentage discount
  if (
    discountType === "percentage" &&
    Number(discountValue) > 90
  ) {
    throw new Error("Percentage discount cannot exceed 90%.");
  }

  // Validate flat discount
  if (
    discountType === "flat" &&
    Number(discountValue) >= Number(minPurchase)
  ) {
    throw new Error("Flat discount must be less than the minimum purchase amount.");
  }

  // Create coupon
  const coupon = new Coupon({

    code: code.trim().toUpperCase(),

    description,
    discountType,
    discountValue,
    maxDiscount,
    minPurchase,
    usageLimit,
    perUserLimit,
    startDate,
    expiryDate

  });

  await coupon.save();

  return coupon;

};
