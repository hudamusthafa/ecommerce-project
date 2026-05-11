const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdminLoggedIn ,isAdminLoggedOut } = require("../middleware/authMiddleware");
const { noCache } = require("../middleware/cacheMiddleware");


// GET login page
router.get("/login",noCache, isAdminLoggedOut, adminController.getLogin);

// POST login
router.post("/login", adminController.postLogin);

// dashboard 
router.get("/dashboard",  noCache, isAdminLoggedIn,adminController.getDashboard);

//usermanagemnt
router.get("/users", noCache, isAdminLoggedIn,adminController.getUsers);
router.patch("/block-user/:id", adminController.blockUser);
router.patch("/unblock-user/:id", adminController.unblockUser);

//add user
router.get("/add-user",noCache, isAdminLoggedIn, adminController.getAddUser);
router.post("/add-user", adminController.postAddUser);

//edit user
router.get("/edit-user/:id", adminController.getEditUser);
router.put("/edit-user/:id", adminController.postEditUser);


//delete user
router.delete("/delete-user/:id", adminController.deleteUser);

//logout
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid"); 
      res.redirect("/admin/login");
    });
  });
});


module.exports = router;