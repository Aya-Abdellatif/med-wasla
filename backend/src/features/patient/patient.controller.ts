import type { Request, Response, NextFunction } from "express";
import { getPatientProfileByUserId } from "./getPatientProfile.service.js";

export const getPatientProfile = async ( req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const profile = await getPatientProfileByUserId(userId as string);

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};
