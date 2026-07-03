const adminCouponService = require("../services/adminCouponService");

// GET COUPONS PAGE
// GET COUPONS PAGE
exports.getCoupons = async (req, res, next) => {

  try {

    const search = req.query.search || "";

    const result = await adminCouponService.getCoupons(search);

    res.render("admin/coupons", {
      coupons: result.coupons,
      total: result.total,
      search
    });

  } catch (error) {
    next(error);
  }

};

//===============================================

// GET ADD COUPON PAGE
exports.getAddCoupon = (req, res) => {

  res.render("admin/add-coupon");

};

//=======================================

// ADD COUPON
exports.addCoupon = async (req, res, next) => {

  try {

    await adminCouponService.addCoupon(req.body);

    res.redirect("/admin/coupons");

  } catch (error) {

     res.redirect(
        "/admin/add-coupon?error=" +
        encodeURIComponent(error.message)
    );

  }

};