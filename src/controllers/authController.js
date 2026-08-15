const Otp=require("../models/Otp");


const {
  registerService,
  loginService,
  sendOtpService,
  verifyOtpService,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService
}=require("../services/authService");

const sendEmail=require("../helpers/sendEmail");
const statusCodes = require("../helpers/status_codes");

// ===================== REGISTER ========================

exports.getRegister=(req,res)=>{

  const referralCode = req.query.ref || "" ;
  
  res.render("user/register",{referralCode});
};

exports.register=async(req,res,next)=>{
  try{

    const {name,email,password}=req.body;

    // EMPTY VALIDATION
    if(!name || !email || !password){
      return res.status(statusCodes.BAD_REQUEST).render("user/register",{
        message:"All fields required"
      });
    }

    // REGISTER USER
    await registerService(name,email,password);

    res.redirect("/login");

  }catch(error){

    return res.status(statusCodes.BAD_REQUEST).render("user/register",{
      message:error.message
    });

  }
};

// ======================= LOGIN =========================

exports.getLogin=(req,res)=>{

  const message=req.query.message||null;

  res.render("user/login",{message});
};

exports.login=async(req,res,next)=>{
  try{

    const {email,password}=req.body;

    // EMPTY VALIDATION
    if(!email || !password){
      return res.status(statusCodes.BAD_REQUEST).render("user/login",{
        message:"All fields required"
      });
    }

    // LOGIN USER
    const user=await loginService(email,password);

    req.login(user,(err)=>{

      if(err){
        return res.status(statusCodes.SERVER_ERROR).render("user/login",{
          message:"Login failed"
        });
      }

      return res.redirect("/home");
    });

  }catch(error){

    return res.redirect(
      "/login?message="+encodeURIComponent(error.message)
    );

  }
};

// ====================== SEND OTP =======================

exports.sendOtp=async(req,res,next)=>{
  try{

    const {name,email,password, referralCode}=req.body;

    // EMPTY VALIDATION
    if(!name || !email || !password){
      return res.status(statusCodes.BAD_REQUEST).json({
        message:"All fields required"
      });
    }

    // GENERATE OTP
    const otp=await sendOtpService(name,email,password, referralCode);

    console.log("Generated OTP:",otp);

    // SEND EMAIL
    sendEmail(email.toLowerCase(),otp).catch(err=>console.log(err));

    res.status(statusCodes.OK).json({
      message:"OTP sent successfully"
    });

  }catch(error){

    res.status(statusCodes.BAD_REQUEST).json({
      message:error.message
    });

  }
};

// ===================== VERIFY OTP ======================

exports.verifyOtp=async(req,res,next)=>{
  try{

    const {email,otp,name,password, referralCode}=req.body;

    // REQUIRED VALIDATION
    if(!email || !otp){
      return res.status(statusCodes.BAD_REQUEST).json({
        message:"All fields required"
      });
    }

    let user;

    // SIGNUP OTP FLOW
    if(name && password){

      user=await verifyOtpService(email,otp,name,password,referralCode);

      return res.status(statusCodes.OK).json({
        message:"User verified successfully",
        user:{
          name:user.name,
          email:user.email
        }
      });
    }

    // FORGOT PASSWORD OTP FLOW
    const record=await Otp.findOne({
      email:email.toLowerCase(),
      otp
    });

    // INVALID OTP
    if(!record){
      return res.status(statusCodes.BAD_REQUEST).json({
        message:"Invalid OTP"
      });
    }

    // EXPIRED OTP
    if(record.expiresAt<new Date()){
      return res.status(statusCodes.BAD_REQUEST).json({
        message:"OTP expired"
      });
    }

    res.status(statusCodes.OK).json({
      message:"OTP verified"
    });

  }catch(error){

    res.status(statusCodes.SERVER_ERROR).json({
      message:error.message
    });

  }
};

// ================= FORGOT PASSWORD =====================

exports.forgotPassword=async(req,res,next)=>{
  try{

    const {email}=req.body;

    // EMPTY VALIDATION
    if(!email){
      return res.status(statusCodes.BAD_REQUEST).json({
        message:"Email required"
      });
    }

    // GENERATE OTP
    const otp=await forgotPasswordService(email);

    console.log("OTP:",otp);

    // SEND EMAIL
    sendEmail(email,otp).catch(err=>console.log(err));

    res.status(statusCodes.OK).json({
      message:"OTP sent successfully"
    });

  }catch(error){

    res.status(statusCodes.BAD_REQUEST).json({
      message:error.message
    });

  }
};

// ================== RESET PASSWORD =====================

exports.resetPassword=async(req,res,next)=>{
  try{

    const {email,password}=req.body;

    // EMPTY VALIDATION
    if(!email || !password){
      return res.status(statusCodes.BAD_REQUEST).json({
        message:"All fields required"
      });
    }

    // RESET PASSWORD
    await resetPasswordService(email,password);

    res.status(statusCodes.OK).json({
      message:"Password updated"
    });

  }catch(error){

    res.status(statusCodes.SERVER_ERROR).json({
      message:error.message
    });

  }
};

// ================= CHANGE PASSWORD =====================

exports.changePassword=async(req,res,next)=>{
  try{

    const userId=req.user._id;

    const {
      currentPassword,
      newPassword,
      confirmPassword
    }=req.body;

    // EMPTY VALIDATION
    if(!currentPassword || !newPassword || !confirmPassword){
      return res.status(statusCodes.BAD_REQUEST).render("user/profile",{
        user:req.user,
        message:"All fields are required"
      });
    }

    // PASSWORD MATCH
    if(newPassword!==confirmPassword){
      return res.status(statusCodes.BAD_REQUEST).render("user/profile",{
        user:req.user,
        message:"Passwords do not match"
      });
    }

    // CHANGE PASSWORD
    await changePasswordService(
      userId,
      currentPassword,
      newPassword
    );

    return res.render("user/profile",{
      user:req.user,
      message:"Password changed successfully"
    });

  }catch(error){

    return res.status(statusCodes.BAD_REQUEST).render("user/profile",{
      user:req.user,
      message:error.message
    });

  }
};