const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });
 await transporter.verify();
 
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`
  });
};

module.exports = sendEmail;