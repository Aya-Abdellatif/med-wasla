import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { register, verifyOtp, resendOtp, login, logout, getMe, forgotPassword, resetPassword } from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
