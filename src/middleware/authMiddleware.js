
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // user logged in
  }

  return res.redirect("/login"); // not logged in
};