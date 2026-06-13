const express=require("express"),router=express.Router();
const adminController=require("../controllers/adminController");
const categoryController=require("../controllers/categoryController");
const productController=require("../controllers/productController");

const {isAdminLoggedIn,isAdminLoggedOut}=require("../middleware/authMiddleware");
const {noCache}=require("../middleware/cacheMiddleware");
const upload=require("../config/multer");

const adminOrderController = require("../controllers/adminOrderController");

// ADMIN LOGIN
router.get("/login",noCache,isAdminLoggedOut,adminController.getLogin);
router.post("/login",isAdminLoggedOut,adminController.postLogin);

// DASHBOARD
router.get("/dashboard",noCache,isAdminLoggedIn,adminController.getDashboard);

// USER MANAGEMENT
router.get("/users",noCache,isAdminLoggedIn,adminController.getUsers);
router.patch("/block-user/:id",isAdminLoggedIn,adminController.blockUser);
router.patch("/unblock-user/:id",isAdminLoggedIn,adminController.unblockUser);

// ADD USER
router.get("/add-user",noCache,isAdminLoggedIn,adminController.getAddUser);
router.post("/add-user",isAdminLoggedIn,adminController.postAddUser);

// EDIT USER
router.get("/edit-user/:id",isAdminLoggedIn,adminController.getEditUser);
router.put("/edit-user/:id",isAdminLoggedIn,adminController.postEditUser);

// DELETE USER
router.delete("/delete-user/:id",isAdminLoggedIn,adminController.deleteUser);

// LOGOUT
router.get("/logout",isAdminLoggedIn,(req,res,next)=>{
  req.logout(err=>{
    if(err) return next(err);
    req.session.destroy(()=>{
      res.clearCookie("connect.sid");
      res.redirect("/admin/login");
    });
  });
});

// CATEGORY MANAGEMENT
router.get("/categories",isAdminLoggedIn,categoryController.getCategories);
router.get("/add-category",isAdminLoggedIn,categoryController.getAddCategory);
router.post("/add-category",isAdminLoggedIn,categoryController.addCategory);
router.get("/edit-category/:id",isAdminLoggedIn,categoryController.getEditCategory);
router.put("/edit-category/:id",isAdminLoggedIn,categoryController.updateCategory);
router.delete("/delete-category/:id",isAdminLoggedIn,categoryController.deleteCategory);

// PRODUCT MANAGEMENT
router.get("/products",isAdminLoggedIn,productController.getProducts);
router.get("/add-product",isAdminLoggedIn,productController.getAddProduct);
router.post("/add-product",isAdminLoggedIn,upload.array("images",5),productController.addProduct);
router.get("/edit-product/:id",isAdminLoggedIn,productController.getEditProduct);
router.put("/edit-product/:id",isAdminLoggedIn,upload.array("images",5),productController.updateProduct);
router.delete("/delete-product/:id",isAdminLoggedIn,productController.deleteProduct);


// ORDERS
router.get("/orders",isAdminLoggedIn,adminOrderController.getOrders);
//ORDER DETAILS
router.get("/orders/:id",isAdminLoggedIn,adminOrderController.getOrderDetails);

module.exports=router;