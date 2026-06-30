import type { Request, Response, NextFunction } from "express";
import { getPatientProfileByUserId, updatePatientProfileByUserId, updatePatientPhotoByUserId, removePatientPhotoByUserId } from "./patient-profile.service.js";
import AppError from "../../utils/AppError.js";


export const getPatientProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const profile = await getPatientProfileByUserId(userId as string);

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

export const updatePatientProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { userId } = req.params;

    const updatedProfile = await updatePatientProfileByUserId(
      userId as string,
      req.body
    );

    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

export const updatePatientPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError("Please upload an image", 400);

    const user = await updatePatientPhotoByUserId(req.user!.id, req.file.buffer, req.file.mimetype);
    res.status(200).json({
      status: "success",
      message: "Profile photo updated",
      data: { photoUrl: user.photoUrl },
    });
  } catch (err) {
    next(err);
  }
};

export const removePatientPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await removePatientPhotoByUserId(req.user!.id);
    res.status(200).json({
      status: "success",
      message: "Profile photo removed",
      data: { photoUrl: null },
    });
  } catch (err) {
    next(err);
  }
};