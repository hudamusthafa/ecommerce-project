const adminService=require("../services/adminService");
const statusCodes = require("../helpers/status_codes");
/* ==================== ADMIN LOGIN ===================== */

exports.getLogin=(req,res)=>{

  // PREVENT LOGIN ACCESS AFTER LOGIN
  if(req.isAuthenticated() && req.user && req.user.isAdmin){
    return res.redirect("/admin/dashboard");
  }

  res.render("admin/login",{error:null});
};

exports.postLogin=async(req,res,next)=>{
  try{

    const {email,password}=req.body;

    // EMAIL VALIDATION
    if(!email || !email.includes("@")){
      return res.status(statusCodes.BAD_REQUEST).render("admin/login",{
        error:"Enter a valid email"
      });
    }

    // PASSWORD VALIDATION
    if(!password || password.length<6){
      return res.status(statusCodes.BAD_REQUEST).render("admin/login",{
        error:"Password must be at least 6 characters"
      });
    }

    // ADMIN LOGIN
    const admin=await adminService.adminLogin(email,password);

    req.login(admin,(err)=>{

      if(err){
        return res.status(statusCodes.SERVER_ERROR).render("admin/login",{
          error:"Login failed"
        });
      }

      return res.redirect("/admin/dashboard");
    });

  }catch(error){

    return res.status(statusCodes.BAD_REQUEST).render("admin/login",{
      error:error.message
    });

  }
};

/* ===================== DASHBOARD ====================== */

exports.getDashboard=(req,res)=>{
  res.render("admin/dashboard");
};

/* ================= USER MANAGEMENT ==================== */

exports.getUsers=async(req,res,next)=>{
  try{

    const search=req.query.search||"";
    const filter=req.query.filter||"";
    const page=parseInt(req.query.page)||1;
    const limit=10;

    const {users,totalUsers}=await adminService.getUsers({
      search,
      filter,
      page,
      limit
    });

    res.render("admin/users",{
      users,
      search,
      filter,
      currentPage:page,
      totalPages:Math.ceil(totalUsers/limit),
      totalUsers
    });

  }catch(error){
    error.statusCode=statusCodes.SERVER_ERROR;
    next(error);
  }
};

/* ================= BLOCK / UNBLOCK ==================== */

exports.blockUser=async(req,res,next)=>{
  try{

    await adminService.updateBlockStatus(req.params.id,true);

    res.redirect("/admin/users");

  }catch(error){
    error.statusCode=statusCodes.SERVER_ERROR;
    next(error);
  }
};

exports.unblockUser=async(req,res,next)=>{
  try{

    await adminService.updateBlockStatus(req.params.id,false);

    res.redirect("/admin/users");

  }catch(error){
    error.statusCode=statusCodes.SERVER_ERROR;
    next(error);
  }
};

/* ===================== ADD USER ======================= */

exports.getAddUser=(req,res)=>{
  res.render("admin/add-user",{
    error:null,
    formData:{}
  });
};

exports.postAddUser=async(req,res,next)=>{
  try{

    const {password,confirmPassword}=req.body;

    // PASSWORD MATCH CHECK
    if(password!==confirmPassword){
      return res.status(statusCodes.BAD_REQUEST).render("admin/add-user",{
        error:"Passwords do not match",
        formData:req.body
      });
    }

    // CREATE USER
    await adminService.createUser(req.body);

    res.redirect("/admin/users");

  }catch(error){

    return res.status(statusCodes.BAD_REQUEST).render("admin/add-user",{
      error:error.message,
      formData:req.body
    });

  }
};

/* ===================== EDIT USER ====================== */

exports.getEditUser=async(req,res,next)=>{
  try{

    const user=await adminService.getUserById(req.params.id);

    // USER NOT FOUND
    if(!user){
      const error=new Error("User not found");
      error.statusCode=statusCodes.NOT_FOUND;
      return next(error);
    }

    res.render("admin/edit-user",{
      user,
      error:null,
      success:null
    });

  }catch(error){
    error.statusCode=statusCodes.SERVER_ERROR;
    next(error);
  }
};

exports.postEditUser=async(req,res,next)=>{
  try{

    const {phone}=req.body;

    // PHONE VALIDATION
    if(phone && !/^[0-9]{10}$/.test(phone)){

      const user=await adminService.getUserById(req.params.id);

      return res.status(statusCodes.BAD_REQUEST).render("admin/edit-user",{
        user,
        error:"Phone must be 10 digits",
        success:null
      });
    }

    // UPDATE USER
    await adminService.updateUser(req.params.id,req.body);

    res.redirect("/admin/users");

  }catch(error){

    const user=await adminService.getUserById(req.params.id);

    return res.status(statusCodes.BAD_REQUEST).render("admin/edit-user",{
      user,
      error:error.message,
      success:null
    });

  }
};

/* ==================== DELETE USER ===================== */

exports.deleteUser=async(req,res,next)=>{
  try{

    await adminService.deleteUser(req.params.id);

    res.redirect("/admin/users");

  }catch(error){
    error.statusCode=statusCodes.SERVER_ERROR;
    next(error);
  }
};
//=================WEEK 2============

const categoryService = require("../services/categoryService");

// LIST PAGE
exports.getCategories = async (req, res) => {
  try {
    const { search = "", page = 1 } = req.query;

    const result = await categoryService.getCategories({
      search,
      page: parseInt(page)
    });

    res.render("admin/categories", {
      ...result,
      search
    });

  } catch (err) {
    res.send("Error loading categories");
  }
};

// ADD PAGE
exports.getAddCategory = (req, res) => {
  res.render("admin/add-category", { error: null });
};

// ADD CATEGORY
exports.postAddCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.render("admin/add-category", {
        error: "Category name is required"
      });
    }

    await categoryService.addCategory({ name, description });

    res.redirect("/admin/categories");

  } catch (err) {
    res.render("admin/add-category", {
      error: "Category already exists"
    });
  }
};

// EDIT PAGE
exports.getEditCategory = async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);

  res.render("admin/edit-category", { category, error: null });
};

// UPDATE
exports.postEditCategory = async (req, res) => {
  try {
    await categoryService.updateCategory(req.params.id, req.body);
    res.redirect("/admin/categories");
  } catch (err) {
    res.send("Error updating category");
  }
};

// DELETE (SOFT DELETE)
exports.deleteCategory = async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.redirect("/admin/categories");
};