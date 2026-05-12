const adminService = require("../services/adminService");

/* ================= ADMIN LOGIN ================= */

exports.getLogin = (req, res) => {
if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return res.redirect("/admin/dashboard");  //  block access
  }

  res.render("admin/login", { error: null });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.includes("@")) {
      return res.render("admin/login", { error: "Enter a valid email" });
    }

    if (!password || password.length < 6) {
      return res.render("admin/login", { error: "Password must be at least 6 characters" });
    }

    const admin = await adminService.adminLogin(email, password);

    req.login(admin, (err) => {
      if (err) {
        return res.render("admin/login", { error: "Login failed" });
      }

      return res.redirect("/admin/dashboard");
    });

  } catch (err) {
    res.render("admin/login", { error: err.message });
  }
};

/* ================= DASHBOARD ================= */

exports.getDashboard = (req, res) => {
  res.render("admin/dashboard");
};

/* ================= USER MANAGEMENT ================= */

exports.getUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const filter = req.query.filter || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const { users, totalUsers } = await adminService.getUsers({
      search,
      filter,
      page,
      limit
    });

    res.render("admin/users", {
      users,
      search,
      filter,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers
    });

  } catch (err) {
    console.log(err);
    res.send("Server Error");
  }
};

/* ================= BLOCK / UNBLOCK ================= */

exports.blockUser = async (req, res) => {
  await adminService.updateBlockStatus(req.params.id, true);
  res.redirect("/admin/users");
};

exports.unblockUser = async (req, res) => {
  await adminService.updateBlockStatus(req.params.id, false);
  res.redirect("/admin/users");
};

/* ================= ADD USER ================= */

exports.getAddUser = (req, res) => {
  res.render("admin/add-user", {
    error: null,
    formData: {}
  });
};

exports.postAddUser = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render("admin/add-user", {
        error: "Passwords do not match",
        formData: req.body
      });
    }

    await adminService.createUser(req.body);

    res.redirect("/admin/users");

  } catch (err) {
    res.render("admin/add-user", {
      error: err.message,
      formData: req.body
    });
  }
};

/* ================= EDIT USER ================= */

exports.getEditUser = async (req, res) => {
  try {
    const user = await adminService.getUserById(req.params.id);

    res.render("admin/edit-user", {
      user,
      error: null,
      success:null
    });

  } catch (err) {
    console.log(err);
  }
};

exports.postEditUser = async (req, res) => {
  try {
    const { phone } = req.body;

    // Phone validation
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      const user = await adminService.getUserById(req.params.id);
      return res.render("admin/edit-user", {
        user,
        error: "Phone must be 10 digits",
        success:null
      });
    }

    await adminService.updateUser(req.params.id, req.body);

    res.redirect("/admin/users");

  } catch (err) {

     //  Update user
    const user = await adminService.getUserById(req.params.id);

    return res.render("admin/edit-user", {
      user,
      error: err.message,   //  shows "Email already exists"
      success: null
    });
  }
};

/* ================= DELETE USER ================= */

exports.deleteUser = async (req, res) => {
  await adminService.deleteUser(req.params.id);
  res.redirect("/admin/users");
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
};6