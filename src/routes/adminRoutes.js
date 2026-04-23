const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// GET login page
router.get("/login", adminController.getLogin);

// POST login
router.post("/login", adminController.postLogin);

// dashboard 
router.get("/dashboard", adminController.getDashboard);

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



//edit user
router.get("/edit-user/:id",adminController.getEditUser);
router.post("/edit-user/:id",adminController.postEditUser);

module.exports = router;