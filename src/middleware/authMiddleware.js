
//user auth

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {


// check if blocked
    if (req.user.isBlocked) {
      return res.redirect("/login?blocked=1");
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


//  (ADMIN AUTH)
exports.isAdminLoggedIn = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }

  return res.redirect("/admin/login");
};

//  (ADMIN LOGIN BLOCK)
exports.isAdminLoggedOut = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return res.redirect("/admin/dashboard");
  }

  next();
};