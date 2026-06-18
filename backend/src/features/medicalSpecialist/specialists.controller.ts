import type { Request, Response, NextFunction } from "express";
import AppError from "../../utils/AppError.js";
import {
  getAllSpecialistsService,
  getSpecialistByIdService,
  getSpecialistsBySpecializationService,
  getSpecialistProfileService,
  updateSpecialistProfileService,
  addSpecialistCertificateService,
  updateAvailabilityService,
  updateFeesService,
  type GetAllSpecialistsQuery,
  type UpdateProfileBody,
  type UpdateAvailabilityBody,
  type UpdateFeesBody,
  type AddCertificateBody,
  updateUserPhoto,
} from "./specialists.service.js";

function getUserId(req: Request): string {
  const id = req.user?.id;

  if (!id) {
    throw new Error("Unauthorized");
  }

  return id;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

function isUnauthorizedMessage(message: string): boolean {
  return (
    message === "Unauthorized" ||
    message === "Authenticated user id is missing"
  );
}

function getAuthErrorStatus(message: string, fallback = 500): number {
  if (isUnauthorizedMessage(message)) return 401;
  if (message === "Specialist profile not found") return 404;
  if (
    message === "User ID is required" ||
    message === "No profile changes to submit" ||
    message.includes("must be") ||
    message.includes("Each slot")
  ) {
    return 400;
  }
  return fallback;
}

function sendError(res: Response, error: unknown, fallbackStatus = 500): void {
  const message = getErrorMessage(error);
  res.status(getAuthErrorStatus(message, fallbackStatus)).json({
    success: false,
    message,
  });
}

// ─────────────────────────────────────────────────────────────
// Public Endpoints
// ─────────────────────────────────────────────────────────────

export const getAllSpecialists = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await getAllSpecialistsService(
      req.query as GetAllSpecialistsQuery,
      { publicOnly: true },
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const getSpecialistById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const specialist = await getSpecialistByIdService(id, {
      publicOnly: true,
    });

    res.status(200).json({
      success: true,
      data: specialist,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = message === "Specialist not found" ? 404 : 500;

    res.status(status).json({
      success: false,
      message,
    });
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

    res.status(200).json({
      success: true,
      data: specialists,
    });
  } catch (error: unknown) {
    sendError(res, error);
  }
};

// ─────────────────────────────────────────────────────────────
// Authenticated Specialist Endpoints
// ─────────────────────────────────────────────────────────────

export const getMe = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const profile = await getSpecialistProfileService(getUserId(req));

    res.status(200).json({
      success: true,
      data: profile.toObject(),
    });
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await updateSpecialistProfileService(
      getUserId(req),
      req.body as UpdateProfileBody,
    );

    res.status(200).json({
      success: true,
      message: "Changes submitted for admin review",
      data: result,
    });
  } catch (error: unknown) {
    sendError(res, error, 400);
  }
};

export const updateAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const specialist = await updateAvailabilityService(
      getUserId(req),
      req.body as UpdateAvailabilityBody,
    );

    res.status(200).json({
      success: true,
      data: specialist,
    });
  } catch (error: unknown) {
    sendError(res, error, 400);
  }
};

export const updateFees = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const specialist = await updateFeesService(
      getUserId(req),
      req.body as UpdateFeesBody,
    );

    res.status(200).json({
      success: true,
      data: specialist,
    });
  } catch (error: unknown) {
    sendError(res, error, 400);
  }
};

export const addCertificate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await addSpecialistCertificateService(
      getUserId(req),
      req.body as AddCertificateBody,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const updatePhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError("Please upload an image", 400);

    const user = await updateUserPhoto(req.user!.id, req.file.buffer, req.file.mimetype);
    res.status(200).json({
      status: "success",
      message: "Profile photo updated",
      data: { photoUrl: user.photoUrl },
    });
  } catch (err) {
    next(err);
  }
};
