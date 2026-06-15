import express from "express";
import { getPatientProfile } from "./patient.controller.js";

export const patientRouter = express.Router();

patientRouter.get("/profile/:userId", getPatientProfile);
