import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../config/email.js";
//login user
const loginUser =async(req,res) =>{
  const {email,password}=req.body;
  try {
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success:false,message:"Invalid credentials"});
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.json({success:false,message:"Invalid credentials"});
    }
    const token = createToken(user._id);
    res.json({success:true,token});


  } catch (error) {
    console.log(error);
    res.json({success:false,message:"Server error"});
  }
}
const createToken =(id)=>{
  return jwt.sign({id},process.env.JWT_SECRET);
}
const registerUser =async(req,res)=>{
const {name,password,email}=req.body;
try {
  const exists =await userModel.findOne({email});
  if(exists){
   return res.json({success:false, message:"User already exists"});
  }
  //validation
  if(!validator.isEmail(email)){
    return res.json({success:false, message:"Invalid email"});
  }
  if(password.length<8){
    return res.json({success:false, message:"Password must be atleast 8 characters"});
  }
  //hash password
  const salt=await bcrypt.genSalt(10);
  const hashedPassword=await bcrypt.hash(password,salt);
  const newUser=await userModel({name:name,email:email,password:hashedPassword});
  const user = await newUser.save();

  const token =createToken(user._id)
  res.json({success:true,token});




} catch (error) {
  console.log(error);
  res.json({success:false,message:"Server error"});
}
}
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email || !validator.isEmail(email)) {
    return res.json({ success: false, message: "Invalid email" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.json({ success: false, message: "FRONTEND_URL is not set" });
    }

    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail({ to: email, resetLink });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.log(emailError);
      return res.json({ success: false, message: "Failed to send reset email" });
    }

    res.json({ success: true, message: "Reset email sent" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.json({ success: false, message: "Token and new password are required" });
  }
  if (newPassword.length < 8) {
    return res.json({ success: false, message: "Password must be atleast 8 characters" });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server error" });
  }
};

export {loginUser,registerUser,requestPasswordReset,resetPassword}