const bcrypt = require("bcrypt");
const User = require("../models/User");


//-------------register------------

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.render("user/register", { message: "All fields required" });
    }

    const emailLower = email.toLowerCase();

    const userExists = await User.findOne({ email: emailLower });

    if (userExists) {
      return res.render("user/register", { message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
    });

    //  redirect after success
    return res.redirect("/login");

  } catch (error) {
    return res.render("user/register", { message: error.message });
  }
};
//------------login----------------------



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("user/login", { message: "All fields required" });
    }

    const emailLower = email.toLowerCase();

    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.render("user/login", { message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.render("user/login", { message: "User is blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("user/login", { message: "Invalid credentials" });
    }

    //  success (later redirect to dashboard)
    return res.send("Login successful");

  } catch (error) {
    return res.render("user/login", { message: error.message });
  }
};

