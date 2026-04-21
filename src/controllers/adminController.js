const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ================= ADMIN LOGIN ================= */

exports.getLogin = (req, res) => {
  res.render("admin/login");
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, isAdmin: true });

    if (!admin) return res.send("Invalid Admin Credentials");

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) return res.send("Invalid Admin Credentials");

    res.redirect("/admin/dashboard");

  } catch (err) {
    console.log(err);
    res.send("Server Error");
  }
};

exports.getDashboard = (req, res) => {
  res.render("admin/dashboard");
};

/* ================= USER MANAGEMENT ================= */

// GET USERS
exports.getUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const filter = req.query.filter || "";

   let query = {
  isAdmin: { $ne: true },
  $or: [
    { isDeleted: false },
    { isDeleted: { $exists: false } }
  ],
  name: { $regex: search, $options: "i" }
};

    if (filter === "active") query.isBlocked = false;
    if (filter === "blocked") query.isBlocked = true;

    const users = await User.find(query).sort({ createdAt: -1 });

    //console.log("Users:", users);

    res.render("admin/users", { users, search, filter });

  } catch (err) {
    console.log(err);
    res.send("Server Error");
  }
};

/* ================= BLOCK / UNBLOCK ================= */

exports.blockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
    res.redirect("/admin/users");
  } catch (err) {
    console.log(err);
  }
};

exports.unblockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
    res.redirect("/admin/users");
  } catch (err) {
    console.log(err);
  }
};

/* ================= ADD USER ================= */

exports.getAddUser = (req, res) => {
  res.render("admin/add-user");
};

exports.postAddUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
      isAdmin: false
    });

    res.redirect("/admin/users");

  } catch (err) {
    console.log(err);
  }
};

/* ================= EDIT USER ================= */

exports.getEditUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("admin/edit-user", { user });
};

exports.postEditUser = async (req, res) => {
  const { name, email } = req.body;

  await User.findByIdAndUpdate(req.params.id, { name, email });

  res.redirect("/admin/users");
};

/* ================= DELETE USER (SOFT) ================= */

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      isDeleted: true
    });

    res.redirect("/admin/users");

  } catch (err) {
    console.log(err);
  }
};