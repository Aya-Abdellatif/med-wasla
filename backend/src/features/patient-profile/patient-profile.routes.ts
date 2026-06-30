import express from "express";
import { getPatientProfile, updatePatientProfile, updatePatientPhoto} from "./patient-profile.controller.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";
import { uploadPhoto } from "../../middleware/upload.middleware.js";

const requirePatient = [
  protect,
  restrictTo("patient"),
] as const;

export const patientRouter = express.Router();

patientRouter.get("/profile/:userId", ...requirePatient, getPatientProfile);
patientRouter.patch("/profile/:userId", ...requirePatient, updatePatientProfile);
patientRouter.patch("/me/photo", ...requirePatient, uploadPhoto.single("photo"), updatePatientPhoto);

