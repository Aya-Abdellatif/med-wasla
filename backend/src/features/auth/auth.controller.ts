import type { Request, Response, NextFunction } from "express";
import { registerUser, verifyUserOtp, resendUserOtp, loginUser, getUserById } from "./auth.service.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await registerUser(req.body);
    res.status(201).json({
      status: "success",
      message: "Registration successful. Check your email for the OTP.",
    });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyUserOtp(email, otp);
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await resendUserOtp(req.body.email);
    res.status(200).json({ status: "success", message: "OTP resent to your email." });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
};

export const logout = (_req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "Logged out successfully." });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(req.user!.id);
    res.status(200).json({ status: "success", data: { user } });
  } catch (err) {
    next(err);
  }
};
