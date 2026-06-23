import type { Request, Response, NextFunction } from "express";
import { getPatientProfileByUserId, updatePatientProfileByUserId } from "./patient-profile.service.js";

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