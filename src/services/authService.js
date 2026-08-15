const bcrypt = require("bcrypt");
const User = require("../models/User");
const Otp = require("../models/Otp");
const userWalletService = require("./userWalletService");



const generateReferralCode = () => {
    return "AURA" + Math.random().toString(36).substring(2, 8).toUpperCase();
};


exports.registerService = async (name, email, password) => {
  const emailLower = email.toLowerCase();

  const userExists = await User.findOne({ email: emailLower });

  if (userExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  //generate referal code
// const referralCode = generateReferralCode();

  const user = await User.create({
    name,
    email: emailLower,
    password: hashedPassword,
    provider: "local"
   
  });

  return user;
};



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


exports.sendOtpService = async (name, email, password, referralCode) => {
  const emailLower = email.toLowerCase();

  const existingUser = await User.findOne({ email: emailLower });

  if (existingUser) {
    throw new Error("User already exists");
  }


// Validate referral code before sending OTP
if (referralCode && referralCode.trim()) {

    const referrer = await User.findOne({
        referralCode: referralCode.trim().toUpperCase()
    });

    if (!referrer) {
        throw new Error("Invalid referral code.");
    }

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


exports.verifyOtpService = async (email, otp, name, password,referralCode) => {
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

let referrer = null;

if (referralCode && referralCode.trim()) {
    referrer = await User.findOne({
        referralCode: referralCode.trim().toUpperCase()
    });
}

  const hashedPassword = await bcrypt.hash(password, 10);

  const newReferralCode = generateReferralCode();


  //creating user
const user = await User.create({

    name,
    email: emailLower,
    password: hashedPassword,
     provider: "local",

    referralCode: newReferralCode,

    referredBy: referrer ? referrer._id : null

});

// Referral reward(credit)
if (referrer) {

    await userWalletService.creditWallet(
        referrer._id,
        100,
        "Referral bonus"
    );

    await userWalletService.creditWallet(
        user._id,
        100,
        "Welcome referral bonus"
    );

}


  await Otp.deleteMany({ email: emailLower });

  return user;
};


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