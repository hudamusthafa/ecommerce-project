
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


