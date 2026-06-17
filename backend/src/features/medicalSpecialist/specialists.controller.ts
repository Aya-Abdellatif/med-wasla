import type { Request, Response } from "express";
import {
  getAllSpecialistsService,
  getSpecialistByIdService,
  getSpecialistsBySpecializationService,
  updateAvailabilityService,
  updateFeesService,
  SpecialistsService,
  type GetAllSpecialistsQuery,
  type UpdateAvailabilityBody,
  type UpdateFeesBody,
} from "./specialists.service.js";

function getUserId(req: Request): string {
  const user = (req as Request & { user?: { _id?: { toString(): string }; id?: string } }).user;
  const id = user?._id?.toString() ?? user?.id;

  if (!id) {
    throw new Error("Authenticated user id is missing");
  }

  return id;
}

export const getAllSpecialists = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await getAllSpecialistsService(
      req.query as GetAllSpecialistsQuery,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ success: false, message });
  }
};

export const getSpecialistById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const specialist = await getSpecialistByIdService(id);
    res.status(200).json({ success: true, data: specialist });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Specialist not found" ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
};

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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ success: false, message });
  }
};

export const updateAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const specialist = await updateAvailabilityService(
      userId,
      req.body as UpdateAvailabilityBody,
    );
    res.status(200).json({ success: true, data: specialist });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Specialist profile not found" ? 404 : 400;
    res.status(status).json({ success: false, message });
  }
};

export const updateFees = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const specialist = await updateFeesService(
      userId,
      req.body as UpdateFeesBody,
    );
    res.status(200).json({ success: true, data: specialist });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Specialist profile not found" ? 404 : 400;
    res.status(status).json({ success: false, message });
  }
};

export class SpecialistsController {
  static async getMe(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const profile = await SpecialistsService.getProfile(userId);

      if (!profile) {
        res.status(404).json({ success: false, message: "Specialist profile not found" });
        return;
      }

      res.status(200).json({ success: true, data: profile.toObject() });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const updated = await SpecialistsService.updateProfile(getUserId(req), req.body);
      res.status(200).json({
        success: true,
        message: "Profile updated and verification status reset to pending",
        data: updated,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, message });
    }
  }

  static async addCertificate(req: Request, res: Response) {
    try {
      const updated = await SpecialistsService.addCertificate(getUserId(req), {
        ...req.body,
        status: "pending",
      });
      res.status(200).json({ success: true, data: updated.toObject() });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Internal server error";
      const status =
        message === "Specialist profile not found" ||
        message === "User ID is required" ||
        message === "Authenticated user id is missing"
          ? 404
          : 500;
      res.status(status).json({ success: false, message });
    }
  }
}
