const bcrypt = require("bcrypt");
const User = require("../models/User");
const Otp = require("../models/Otp");
const sendEmail = require("../helpers/sendEmail");


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

    //  success (later redirect to home)
   // return res.send("Login successful");
   return res.redirect("/home");

  } catch (error) {
    return res.render("user/login", { message: error.message });
  }
};

//-------------------OTP send--------------

exports.sendOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const emailLower = email.toLowerCase();

    //  CHECK USER FIRST
    const existingUser = await User.findOne({ email: emailLower });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //  GENERATE OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log("Generated OTP:", otp);

    await Otp.deleteMany({ email: emailLower });

    await Otp.create({
      email: emailLower,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    //send response first
res.json({ message: "OTP sent successfully" });

// send email in background
sendEmail(email, otp).catch(err => console.log(err));



  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
//-------------verify OTP------------

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;

    if (!email || !otp || !name || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const emailLower = email.toLowerCase();

    //  Find OTP
    const record = await Otp.findOne({ email: emailLower, otp });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    //  Check expiry
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    //  Check existing user
    const existingUser = await User.findOne({ email: emailLower });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Create user
    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword
    });

    //  Delete OTP
    await Otp.deleteMany({ email: emailLower });

    //  Response
    return res.json({
      message: "User verified successfully",
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};