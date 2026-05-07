const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const cacheMiddleware = require("../middleware/cacheMiddleware");
// GET login page
router.get("/login", adminController.getLogin);

// POST login
router.post("/login", adminController.postLogin);

// dashboard 
router.get("/dashboard",   cacheMiddleware.noCache,adminController.getDashboard);

//usermanagemnt
router.get("/users", adminController.getUsers);
router.post("/block-user/:id", adminController.blockUser);
router.post("/unblock-user/:id", adminController.unblockUser);

//add user
router.get("/add-user", adminController.getAddUser);
router.post("/add-user", adminController.postAddUser);

//edit user
router.get("/edit-user/:id", adminController.getEditUser);
router.post("/edit-user/:id", adminController.postEditUser);


//delete user
router.post("/delete-user/:id", adminController.deleteUser);

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