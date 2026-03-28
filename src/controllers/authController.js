
const {
  registerService,
  loginService,
  sendOtpService,
  verifyOtpService
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

    return res.redirect("/home");

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

    if (!email || !otp || !name || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await verifyOtpService(email, otp, name, password);

    return res.json({
      message: "User verified successfully",
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};