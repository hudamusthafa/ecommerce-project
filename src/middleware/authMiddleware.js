const User = require("../models/User");

//user auth

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()&& req.user) {


// check if blocked
    if (req.user.isBlocked) {
    req.logout(() => {
      req.session.destroy(() => {
        return res.redirect("/login?blocked=1");
      });
    });
    return;
  }

    return next(); // user logged in
  }

  return res.redirect("/login"); // not logged in
};

//prevent user back to login 
exports.isLoggedOut = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }

  next();
};





exports.isAdminLoggedIn = async (req, res, next) => {
  try {

    if (!req.session.adminId) {
      return res.redirect("/admin/login");
    }

    const admin = await User.findById(req.session.adminId);

    if (!admin || !admin.isAdmin || admin.isDeleted) {
      delete req.session.adminId;
      return res.redirect("/admin/login");
    }

    if (admin.isBlocked) {
      delete req.session.adminId;
      return res.redirect("/admin/login");
    }

    req.admin = admin;

    next();

  } catch (error) {
    next(error);
  }
};





exports.isAdminLoggedOut = (req, res, next) => {

  if (req.session.adminId) {
    return res.redirect("/admin/dashboard");
  }

  next();
};