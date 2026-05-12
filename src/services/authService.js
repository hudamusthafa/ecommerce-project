const bcrypt = require("bcrypt");
const User = require("../models/User");
const Otp = require("../models/Otp");

// //--------------------------------REGISTER

exports.registerService = async (name, email, password) => {
  const emailLower = email.toLowerCase();

  const userExists = await User.findOne({ email: emailLower });

  if (userExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: emailLower,
    password: hashedPassword,
     provider: "local"
  });

  return user;
};

////--------------------------- LOGIN


exports.loginService = async (email, password) => {
  const emailLower = email.toLowerCase();

  const user = await User.findOne({ email: emailLower });

  if (!user || user.isDeleted) {
    throw new Error("Invalid credentials");
  }

  if (user.isBlocked) {
    throw new Error("Your account has been blocked by admin");
  }

   if (user.provider === "google") {
    throw new Error("Please login using Google");
  }
  
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return user;
};
//--------------------------------------------------

// SEND OTP

exports.sendOtpService = async (name, email, password) => {
  const emailLower = email.toLowerCase();

  const existingUser = await User.findOne({ email: emailLower });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.deleteMany({ email: emailLower });

  await Otp.create({
    email: emailLower,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  return otp;
};

////---------------------------- VERIFY OTP


exports.verifyOtpService = async (email, otp, name, password) => {
  const emailLower = email.toLowerCase();

  const record = await Otp.findOne({ email: emailLower });

  if (!record || record.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (record.expiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  const existingUser = await User.findOne({ email: emailLower });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: emailLower,
    password: hashedPassword
  });

  await Otp.deleteMany({ email: emailLower });

  return user;
};


//------------FORGOT PASSWORD----------

exports.forgotPasswordService = async (email) => {
  const emailLower = email.toLowerCase();

  const user = await User.findOne({ email: emailLower });

  if (!user) {
    throw new Error("User not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.deleteMany({ email: emailLower });

  await Otp.create({
    email: emailLower,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  return otp;
};

// ---------------- RESET PASSWORD ----------------

exports.resetPasswordService = async (email, password) => {
  const emailLower = email.toLowerCase();

  const user = await User.findOne({ email: emailLower });

  if (!user) {
    throw new Error("User not found");
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.updateOne(
    { email: emailLower },
    { password: hashed }
  );

  return true;
};
// ---------------- CHANGE PASSWORD IN PROFILE----------------

exports.changePasswordService = async (userId, currentPassword, newPassword) => {

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  // hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  return true;
};