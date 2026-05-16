const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdminLoggedIn ,isAdminLoggedOut } = require("../middleware/authMiddleware");
const { noCache } = require("../middleware/cacheMiddleware");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const upload = require("../config/multer");


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





//===========week2===============

// CATEGORY MANAGEMENT

// LIST PAGE
router.get("/categories",categoryController.getCategories);

// ADD CATEGORY PAGE
router.get("/add-category",categoryController.getAddCategory);

// ADD CATEGORY
router.post("/add-category",categoryController.addCategory);

// EDIT CATEGORY PAGE
router.get("/edit-category/:id",categoryController.getEditCategory);

// UPDATE CATEGORY
router.put("/edit-category/:id",categoryController.updateCategory);

// SOFT DELETE CATEGORY
router.delete("/delete-category/:id",categoryController.deleteCategory);



// ===================== PRODUCT MANAGEMENT

// LIST PAGE
router.get("/products",productController.getProducts);

// ADD PRODUCT PAGE
router.get("/add-product",productController.getAddProduct);
// ADD PRODUCT
router.post( "/add-product",upload.array("images", 5),productController.addProduct);


// GET EDIT PRODUCT PAGE
router.get("/edit-product/:id",productController.getEditProduct);

// UPDATE PRODUCT
router.put("/edit-product/:id",
  upload.array("images", 5),
  productController.updateProduct
);



module.exports = router;