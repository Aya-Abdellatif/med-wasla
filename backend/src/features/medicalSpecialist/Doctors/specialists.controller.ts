// backend/src/features/medicalSpecialist/Doctors/specialists.controller.ts
import type { Request, Response } from "express";
import { SpecialistsService } from "./specialists.service.js";

export class SpecialistsController {
  static async getMe(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const profile = await SpecialistsService.getProfile(user._id);
      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      // بنختار الداتا اللي مسموح تتعدل من الـ body
      const updated = await SpecialistsService.updateProfile(user._id, req.body);
      res.status(200).json({ 
        success: true, 
        message: "Profile updated and verification status reset to pending", 
        data: updated 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addCertificate(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const updated = await SpecialistsService.addCertificate(user._id, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}