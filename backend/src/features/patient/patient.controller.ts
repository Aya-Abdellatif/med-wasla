import type { Request, Response } from "express";
import { getPatientProfileByUserId } from "./patient.service.js";

export const getPatientProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = await getPatientProfileByUserId( userId as string );

    return res.status(200).json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve patient profile";
    return res.status(404).json({ message });
  }
};
