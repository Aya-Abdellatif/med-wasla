import type { Request, Response } from "express";
import {
  getAllSpecialistsService,
  getSpecialistByIdService,
  getSpecialistsBySpecializationService,
  updateSpecialistProfileService,
  updateAvailabilityService,
  updateFeesService,
  SpecialistsService,
  type GetAllSpecialistsQuery,
  type UpdateProfileBody,
  type UpdateAvailabilityBody,
  type UpdateFeesBody,
} from "./specialists.service.js";

// ─── Public Endpoints ─────────────────────────────────────────────────────────

/**
 * GET /api/specialists
 * Get all specialists with optional filtering and search
 */
export const getAllSpecialists = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await getAllSpecialistsService(
      req.query as GetAllSpecialistsQuery,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/specialists/:id
 * Get a single specialist's profile by their MongoDB _id
 */
export const getSpecialistById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const specialist = await getSpecialistByIdService(id);
    res.status(200).json({ success: true, data: specialist });
  } catch (error: any) {
    const status = error.message === "Specialist not found" ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/specialists/specialization/:name
 * Get all approved specialists filtered by specialization name
 */
export const getSpecialistsBySpecialization = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const name = Array.isArray(req.params.name)
      ? req.params.name[0]
      : req.params.name;
    const specialists = await getSpecialistsBySpecializationService(name);
    res.status(200).json({ success: true, data: specialists });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Protected Endpoints (main — JWT auth via routes) ─────────────────────────

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const specialist = await updateSpecialistProfileService(
      userId,
      req.body as UpdateProfileBody,
    );
    res.status(200).json({ success: true, data: specialist });
  } catch (error: any) {
    const status = error.message === "Specialist profile not found" ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const specialist = await updateAvailabilityService(
      userId,
      req.body as UpdateAvailabilityBody,
    );
    res.status(200).json({ success: true, data: specialist });
  } catch (error: any) {
    const status = error.message === "Specialist profile not found" ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateFees = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const specialist = await updateFeesService(
      userId,
      req.body as UpdateFeesBody,
    );
    res.status(200).json({ success: true, data: specialist });
  } catch (error: any) {
    const status = error.message === "Specialist profile not found" ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ─── Specialist dashboard (your branch) ─────────────────────────────────────

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
      const updated = await SpecialistsService.updateProfile(user._id, req.body);
      res.status(200).json({
        success: true,
        message: "Profile updated and verification status reset to pending",
        data: updated,
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
