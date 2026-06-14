import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { register, verifyOtp, resendOtp, login, logout, getMe } from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
