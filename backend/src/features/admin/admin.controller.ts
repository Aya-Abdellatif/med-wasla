import type { Request, Response } from "express";
import { AdminService } from "./admin.service.js";

export class AdminController {
  /**
   * GET /api/admin/specialists/pending
   */
  static async getPendingSpecialists(req: Request, res: Response): Promise<void> {
    try {
      const pendingSpecialists = await AdminService.getPendingSpecialists();
      res.status(200).json({
        success: true,
        count: pendingSpecialists.length,
        data: pendingSpecialists,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve pending specialists",
        error: error.message,
      });
    }
  }

  /**
   * PATCH /api/admin/specialists/:id/approve
   */
  static async approveSpecialist(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const approvedSpecialist = await AdminService.approveSpecialist(id as string);
      res.status(200).json({
        success: true,
        message: "Specialist approved successfully",
        data: approvedSpecialist,
      });
    } catch (error: any) {
      const statusCode = error.message === "Medical specialist not found" ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to approve specialist",
      });
    }
  }

  /**
   * PATCH /api/admin/specialists/:id/reject
   */
  static async rejectSpecialist(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rejectedSpecialist = await AdminService.rejectSpecialist(id as string);
      res.status(200).json({
        success: true,
        message: "Specialist rejected successfully",
        data: rejectedSpecialist,
      });
    } catch (error: any) {
      const statusCode = error.message === "Medical specialist not found" ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to reject specialist",
      });
    }
  }

  // داخل backend/src/features/admin/admin.controller.ts
static async getAllSpecialists(req: Request, res: Response): Promise<void> {
  try {
    const specialists = await AdminService.getAllSpecialists();
    res.status(200).json({ success: true, count: specialists.length, data: specialists });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
}
