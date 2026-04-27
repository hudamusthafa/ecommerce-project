
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


//==========block user check===============

// exports.checkBlockedUser = async (req, res, next) => {
//   try {
//     if (req.isAuthenticated()) {

//       const user = req.user;

//       if (user.isBlocked) {
//         // logout user immediately
//         req.logout(() => {
//           req.session.destroy(() => {
//             return res.redirect("/login");
//           });
//         });
//       } else {
//         return next();
//       }

//     } else {
//       return res.redirect("/login");
//     }

//   } catch (err) {
//     return res.redirect("/login");
//   }
// };