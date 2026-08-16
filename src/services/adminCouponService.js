const Coupon = require("../models/Coupon");

//=======================================


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

 


  
  const existingCoupon = await Coupon.findOne({
    code: code.trim().toUpperCase()
  });

  if (existingCoupon) {
    throw new Error("Coupon code already exists.");
  }

  
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
//================================

// GET COUPON BY ID
exports.getCouponById = async (couponId) => {

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
        throw new Error("Coupon not found.");
    }

    return coupon;

};


// UPDATE COUPON
exports.updateCoupon = async (couponId, data) => {

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
        throw new Error("Coupon not found.");
    }

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


    // Duplicate code check
    const existingCoupon = await Coupon.findOne({
        code: code.trim().toUpperCase(),
        _id: { $ne: couponId }
    });

    if (existingCoupon) {
        throw new Error("Coupon code already exists.");
    }

    // Date validation
    if (new Date(startDate) >= new Date(expiryDate)) {
        throw new Error("Expiry date must be later than the start date.");
    }

    // Percentage validation
    if (
        discountType === "percentage" &&
        Number(discountValue) > 90
    ) {
        throw new Error("Percentage discount cannot exceed 90%.");
    }

    // Flat validation
    if (
        discountType === "flat" &&
        Number(discountValue) >= Number(minPurchase)
    ) {
        throw new Error("Flat discount must be less than the minimum purchase amount.");
    }

    coupon.code = code.trim().toUpperCase();
    coupon.description = description;
    coupon.discountType = discountType;
    coupon.discountValue = discountValue;
    coupon.maxDiscount = maxDiscount;
    coupon.minPurchase = minPurchase;
    coupon.usageLimit = usageLimit;
    coupon.perUserLimit = perUserLimit;
    coupon.startDate = startDate;
    coupon.expiryDate = expiryDate;

    await coupon.save();

    return coupon;

};



// ENABLE / DISABLE COUPON
exports.toggleCouponStatus = async (couponId) => {

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
        throw new Error("Coupon not found.");
    }

    coupon.isActive = !coupon.isActive;

    await coupon.save();

    return coupon;

};