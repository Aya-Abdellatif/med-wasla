import type { Request, Response } from "express";
import {
  getAllSpecialistsService,
  getSpecialistByIdService,
  getSpecialistsBySpecializationService,
  updateSpecialistProfileService,
  updateAvailabilityService,
  updateFeesService,
  type GetAllSpecialistsQuery,
  type UpdateProfileBody,
  type UpdateAvailabilityBody,
  type UpdateFeesBody,
} from "./specialists.service.js";
type AuthRequest = Request & {
  user: {
    id: string;
  };
};
// ─── Public Endpoints ─────────────────────────────────────────────────────────

/**
 * GET /api/specialists
 * Get all specialists with optional filtering and search
 * Query params: specialistType, specialization, verificationStatus,
 *               homeVisit, serviceArea, search, page, limit, sortBy, sortOrder
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      message,
    });
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Specialist not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message,
    });
  }
};

/**
 * GET /api/specialists/specialization/:name
 * Get all approved specialists filtered by specialization name (case-insensitive)
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

// ─── Protected Endpoints (doctor / nurse only) ────────────────────────────────

/**
 * PUT /api/specialists/profile
 * Update the authenticated specialist's profile info
 * Body: { bio, clinicAddress, areasOfExpertise, avgWaitMinutes, serviceAreas, homeVisit }
 */
export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.id;
    const specialist = await updateSpecialistProfileService(
      userId,
      req.body as UpdateProfileBody,
    );
    res.status(200).json({ success: true, data: specialist });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Specialist profile not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      message,
    });
  }
};

/**
 * PUT /api/specialists/availability
 * Replace the authenticated specialist's available slots
 * Body: { availableSlots: [{ day, startTime, endTime }] }
 */
export const updateAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.id;
    const specialist = await updateAvailabilityService(
      userId,
      req.body as UpdateAvailabilityBody,
    );
    res.status(200).json({ success: true, data: specialist });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Specialist profile not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      message,
    });
  }
};

/**
 * PUT /api/specialists/fees
 * Update the authenticated specialist's consultation fee
 * Body: { consultationFee: number }
 */
export const updateFees = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.id;
    const specialist = await updateFeesService(
      userId,
      req.body as UpdateFeesBody,
    );
    res.status(200).json({ success: true, data: specialist });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Specialist profile not found" ? 404 : 400;
    res.status(status).json({
      success: false,
      message,
    });
  }
};
