const express=require("express"),router=express.Router();

const passport=require("passport");
const authController=require("../controllers/authController");
const {isLoggedOut}=require("../middleware/authMiddleware");
const cacheMiddleware=require("../middleware/cacheMiddleware");

// AUTH PAGES
router.get("/register",cacheMiddleware.noCache,isLoggedOut,authController.getRegister);
router.get("/login",cacheMiddleware.noCache,isLoggedOut,authController.getLogin);

router.get("/otp",cacheMiddleware.noCache,isLoggedOut,(req,res)=>{res.render("user/otp");});

router.get("/success",cacheMiddleware.noCache,isLoggedOut,(req,res)=>{res.render("user/success");});

router.get("/forgot-password",cacheMiddleware.noCache,isLoggedOut,(req,res)=>{res.render("user/forgot-password");});

router.get("/reset-password",cacheMiddleware.noCache,isLoggedOut,(req,res)=>{res.render("user/reset-password");});

// AUTH ACTIONS
router.post("/register",isLoggedOut,authController.register);
router.post("/login",isLoggedOut,authController.login);
router.post("/send-otp",isLoggedOut,authController.sendOtp);
router.post("/verify-otp",isLoggedOut,authController.verifyOtp);
router.post("/forgot-password",isLoggedOut,authController.forgotPassword);
router.post("/reset-password",isLoggedOut,authController.resetPassword);

// GOOGLE AUTH
router.get("/google",passport.authenticate("google",{scope:["profile","email"]}));

router.get("/google/callback",(req,res,next)=>{
  passport.authenticate("google",(err,user,info)=>{

    if(err) return next(err);

    if(!user){
      return res.redirect("/login?message="+encodeURIComponent(info?.message||"Login failed"));
    }

    req.login(user,(err)=>{
      if(err) return next(err);
      return res.redirect("/home");
    });

  })(req,res,next);
});

module.exports=router;