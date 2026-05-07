
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