const adminCouponService = require("../services/adminCouponService");


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

    const error = req.session.couponError || "";
    const formData = req.session.couponFormData || {};

    // Clear after reading
    req.session.couponError = null;
    req.session.couponFormData = null;

    res.render("admin/add-coupon", {
        error,
        formData
    });
};

//=======================================

// ADD COUPON
exports.addCoupon = async (req, res, next) => {
  

  try {

    await adminCouponService.addCoupon(req.body);

    res.redirect("/admin/coupons");

  } catch (error) {

        req.session.couponError = error.message;
        req.session.couponFormData = req.body;

        res.redirect("/admin/add-coupon");

    }
};