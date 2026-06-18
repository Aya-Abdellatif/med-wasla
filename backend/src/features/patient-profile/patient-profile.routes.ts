import express from "express";
import { getPatientProfile, updatePatientProfile } from "./patient-profile.controller.js";

export const patientRouter = express.Router();

patientRouter.get("/profile/:userId", getPatientProfile);
patientRouter.patch("/profile/:userId", updatePatientProfile);
