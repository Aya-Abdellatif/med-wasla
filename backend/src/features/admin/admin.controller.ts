import type { Request, Response } from "express";
import { AdminService } from "./admin.service.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred";
}

function getSpecialistId(req: Request, res: Response): string | null {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id) {
    res.status(400).json({ success: false, message: "Specialist id is required" });
    return null;
  }

  return id;
}

export class AdminController {
  /**
   * GET /api/admin/specialists/pending
   */
  static async getPendingSpecialists(_req: Request, res: Response): Promise<void> {
    try {
      const pendingSpecialists = await AdminService.getPendingSpecialists();
      res.status(200).json({
        success: true,
        count: pendingSpecialists.length,
        data: pendingSpecialists,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve pending specialists",
        error: getErrorMessage(error),
      });
    }
  }

  /**
   * GET /api/admin/specialists
   */
  static async getAllSpecialists(_req: Request, res: Response): Promise<void> {
    try {
      const specialists = await AdminService.getAllSpecialists();
      res.status(200).json({
        success: true,
        count: specialists.length,
        data: specialists,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: getErrorMessage(error),
      });
    }
  }

  /**
   * PATCH /api/admin/specialists/:id/approve
   */
  static async approveSpecialist(req: Request, res: Response): Promise<void> {
    const id = getSpecialistId(req, res);
    if (!id) return;

    try {
      const approvedSpecialist = await AdminService.approveSpecialist(id);
      res.status(200).json({
        success: true,
        message: "Specialist approved successfully",
        data: approvedSpecialist,
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = message === "Medical specialist not found" ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: message || "Failed to approve specialist",
      });
    }
  }

  /**
   * PATCH /api/admin/specialists/:id/reject
   */
  static async rejectSpecialist(req: Request, res: Response): Promise<void> {
    const id = getSpecialistId(req, res);
    if (!id) return;

    try {
      const rejectedSpecialist = await AdminService.rejectSpecialist(id);
      res.status(200).json({
        success: true,
        message: "Specialist rejected successfully",
        data: rejectedSpecialist,
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode = message === "Medical specialist not found" ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: message || "Failed to reject specialist",
      });
    }
  }

  /**
   * PATCH /api/admin/specialists/:id/certificates/:certId/approve
   */
  static async approveCertificate(req: Request, res: Response): Promise<void> {
    const id = getSpecialistId(req, res);
    if (!id) return;

    const certId = Array.isArray(req.params.certId)
      ? req.params.certId[0]
      : req.params.certId;

    if (!certId) {
      res.status(400).json({ success: false, message: "Certificate id is required" });
      return;
    }

    try {
      const specialist = await AdminService.approveCertificate(id, certId);
      res.status(200).json({
        success: true,
        message: "Certificate approved successfully",
        data: specialist,
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode =
        message === "Medical specialist not found" || message === "Certificate not found"
          ? 404
          : message === "Certificate is not pending review"
            ? 400
            : 500;
      res.status(statusCode).json({
        success: false,
        message: message || "Failed to approve certificate",
      });
    }
  }

  /**
   * PATCH /api/admin/specialists/:id/certificates/:certId/reject
   */
  static async rejectCertificate(req: Request, res: Response): Promise<void> {
    const id = getSpecialistId(req, res);
    if (!id) return;

    const certId = Array.isArray(req.params.certId)
      ? req.params.certId[0]
      : req.params.certId;

    if (!certId) {
      res.status(400).json({ success: false, message: "Certificate id is required" });
      return;
    }

    try {
      const specialist = await AdminService.rejectCertificate(id, certId);
      res.status(200).json({
        success: true,
        message: "Certificate rejected successfully",
        data: specialist,
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const statusCode =
        message === "Medical specialist not found" || message === "Certificate not found"
          ? 404
          : message === "Certificate is not pending review"
            ? 400
            : 500;
      res.status(statusCode).json({
        success: false,
        message: message || "Failed to reject certificate",
      });
    }
  }
}
