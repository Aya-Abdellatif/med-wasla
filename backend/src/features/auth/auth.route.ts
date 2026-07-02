import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { authRateLimiter } from "../../middleware/rateLimiter.middleware.js";
import { register, verifyOtp, resendOtp, login, logout, getMe, forgotPassword, resetPassword } from "./auth.controller.js";

const router = express.Router();

router.post("/register", authRateLimiter, register);
router.post("/verify-otp", authRateLimiter, verifyOtp);
router.post("/resend-otp", authRateLimiter, resendOtp);
router.post("/login", authRateLimiter, login);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/reset-password", authRateLimiter, resetPassword);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
