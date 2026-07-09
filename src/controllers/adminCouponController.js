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


const {
    code,
    description,
    discountType,
    discountValue,
    startDate,
    expiryDate
} = req.body;

if (!code || !code.trim()) {

    req.session.couponError = "Coupon code is required.";
    req.session.couponFormData = req.body;

    return res.redirect("/admin/add-coupon");
}

if (!description || !description.trim()) {

    req.session.couponError = "Coupon description is required.";
    req.session.couponFormData = req.body;

    return res.redirect("/admin/add-coupon");
}

if (!discountType) {

    req.session.couponError = "Please select a discount type.";
    req.session.couponFormData = req.body;

    return res.redirect("/admin/add-coupon");
}

if (!discountValue) {

    req.session.couponError = "Discount value is required.";
    req.session.couponFormData = req.body;

    return res.redirect("/admin/add-coupon");
}

if (!startDate) {

    req.session.couponError = "Start date is required.";
    req.session.couponFormData = req.body;

    return res.redirect("/admin/add-coupon");
}

if (!expiryDate) {

    req.session.couponError = "Expiry date is required.";
    req.session.couponFormData = req.body;

    return res.redirect("/admin/add-coupon");
}


    await adminCouponService.addCoupon(req.body);

    res.redirect("/admin/coupons");

  } catch (error) {

        req.session.couponError = error.message;
        req.session.couponFormData = req.body;

        res.redirect("/admin/add-coupon");

    }
};


//================================
// GET EDIT COUPON PAGE
exports.getEditCoupon = async (req, res, next) => {

    try {



        const coupon = await adminCouponService.getCouponById(
            req.params.id
        );

        const error = req.session.couponError || "";
        const formData = req.session.couponFormData || {};

        // Clear after reading
        req.session.couponError = null;
        req.session.couponFormData = null;

        res.render("admin/edit-coupon", {
            coupon,
            error,
              formData
        });

    } catch (error) {

        next(error);

    }

};


// UPDATE COUPON
exports.updateCoupon = async (req, res, next) => {

    try {


const {
    code,
    description,
    discountType,
    discountValue,
    startDate,
    expiryDate
} = req.body;

if (!code || !code.trim()) {

    req.session.couponError = "Coupon code is required.";
    req.session.couponFormData = req.body;
    return res.redirect("/admin/edit-coupon/" + req.params.id);
}

if (!description || !description.trim()) {

    req.session.couponError = "Coupon description is required.";
    req.session.couponFormData = req.body;
    return res.redirect("/admin/edit-coupon/" + req.params.id);
}

if (!discountType) {

    req.session.couponError = "Please select a discount type.";
    req.session.couponFormData = req.body;
    return res.redirect("/admin/edit-coupon/" + req.params.id);
}

if (!discountValue) {

    req.session.couponError = "Discount value is required.";
    req.session.couponFormData = req.body;
    return res.redirect("/admin/edit-coupon/" + req.params.id);
}

if (!startDate) {

    req.session.couponError = "Start date is required.";
    req.session.couponFormData = req.body;
    return res.redirect("/admin/edit-coupon/" + req.params.id);
}

if (!expiryDate) {

    req.session.couponError = "Expiry date is required.";
    req.session.couponFormData = req.body;
    return res.redirect("/admin/edit-coupon/" + req.params.id);
}

        await adminCouponService.updateCoupon(
            req.params.id,
            req.body
        );

        res.redirect("/admin/coupons");

    } catch (error) {

       req.session.couponError = error.message;
       req.session.couponFormData = req.body;

 return res.redirect("/admin/edit-coupon/" + req.params.id);
    }

};