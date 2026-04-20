const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res) => {
  res.render("admin/login");
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find admin user
    const admin = await User.findOne({ email, isAdmin: true });

    if (!admin) {
      return res.send("Invalid Admin Credentials");
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.send("Invalid Admin Credentials");
    }

    // 3. Success → go dashboard
    res.redirect("/admin/dashboard");

  } catch (error) {
    console.log(error);
    res.send("Server Error");
  }
};

exports.getDashboard = (req, res) => {
  res.render("admin/dashboard");
};