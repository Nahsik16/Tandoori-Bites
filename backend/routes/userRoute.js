import express from "express"
import rateLimit from "express-rate-limit";
import { loginUser,registerUser,requestPasswordReset,resetPassword } from "../controllers/userController.js"
const userRouter = express.Router()
const resetRequestLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: { success: false, message: "Too many reset requests. Please try again later." },
})
userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
userRouter.post(
	"/reset-request",
	process.env.NODE_ENV === "production" ? resetRequestLimiter : (req, res, next) => next(),
	requestPasswordReset
)
userRouter.post("/reset-password",resetPassword)
export default userRouter