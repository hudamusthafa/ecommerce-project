
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Otp = require("../models/Otp");
const {
  registerService,
  loginService,
  sendOtpService,
  verifyOtpService,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService 
        } = require("../services/authService");
const sendEmail = require("../helpers/sendEmail");



// ------------------------REGISTER-------------

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.render("user/register", { message: "All fields required" });
    }

    await registerService(name, email, password);

    return res.redirect("/login");

  } catch (error) {
    return res.render("user/register", { message: error.message });
  }
};



//------------LOGIN-------------------

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("user/login", { message: "All fields required" });
    }

    const user = await loginService(email, password);

   req.login(user, (err) => {
  if (err) {
    return res.render("user/login", { message: "Login failed" });
  }
  return res.redirect("/home");
});

  } catch (error) {
    return res.render("user/login", { message: error.message });
  }
};

//--------------------SEND OTP-------------------


exports.sendOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const otp = await sendOtpService(name, email, password);

    console.log("Generated OTP:", otp);

    res.json({ message: "OTP sent successfully" });

   sendEmail(email.toLowerCase(), otp).catch(err => console.log(err));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//-------------VERIFY OTP----------------


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;

    //  always required
    if (!email || !otp) {
      return res.status(400).json({ message: "All fields required" });
    }

    let user;

    //  SIGNUP FLOW
    if (name && password) {
      user = await verifyOtpService(email, otp, name, password);

      return res.json({
        message: "User verified successfully",
        user: {
          name: user.name,
          email: user.email
        }
      });
    }

    //  FORGOT PASSWORD FLOW
    const record = await Otp.findOne({ email: email.toLowerCase(), otp });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    return res.json({ message: "OTP verified" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//-------------FORGOT PASSWORD-------

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const otp = await forgotPasswordService(email);

    console.log("OTP:", otp);

    res.json({ message: "OTP sent successfully" });

    sendEmail(email, otp).catch(err => console.log(err));

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//-----------------reset password---------------

exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await User.updateOne(
      { email: email.toLowerCase() },
      { password: hashed }
    );

    res.json({ message: "Password updated" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//----------------change paswrd in profile---------

// exports.changePassword = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { currentPassword, newPassword, confirmPassword } = req.body;

//     // validation (keep here)
//     if (!currentPassword || !newPassword || !confirmPassword) {
//       return res.send("All fields are required");
//     }

//     if (newPassword !== confirmPassword) {
//       return res.send("Passwords do not match");
//     }

//     // call service
//     await changePasswordService(userId, currentPassword, newPassword);

//     res.redirect("/profile");

//   } catch (error) {
//     res.send(error.message);
//   }
// };
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render("user/profile", { 
        user: req.user, 
        message: "All fields are required" 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("user/profile", { 
        user: req.user, 
        message: "Passwords do not match" 
      });
    }

    await changePasswordService(userId, currentPassword, newPassword);

    return res.render("user/profile", { 
      user: req.user, 
      message: "Password changed successfully" 
    });

  } catch (error) {
    return res.render("user/profile", { 
      user: req.user, 
      message: error.message 
    });
  }
};

//-----------------add address-------------
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.address.push(req.body);

    await user.save();

    res.redirect("/api/auth/checkout");

  } catch (err) {
    res.send("Error adding address");
  }
};

//---------------delete address---------

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.address = user.address.filter(
      addr => addr._id.toString() !== req.params.id
    );

    await user.save();

    res.redirect("/api/auth/checkout");

  } catch (err) {
    res.send("Error deleting address");
  }
};
