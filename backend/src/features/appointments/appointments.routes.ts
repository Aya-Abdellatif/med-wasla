import { Router } from "express";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";
import {
  createAppointment,
  getMyAppointments,
  getSpecialistAppointments,
  getAvailableSlots,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from "./appointments.controller.js";

const router = Router();

// Public: check available slots before booking
router.get("/available-slots/:specialistId", getAvailableSlots);

// Patient: book a new appointment
router.post("/", protect, restrictTo("patient"), createAppointment);

// Patient: see all their appointments
router.get("/my", protect, restrictTo("patient"), getMyAppointments);

// Specialist: see all their patients' appointments
router.get("/specialist", protect, restrictTo("specialist"), getSpecialistAppointments);

// Patient OR Specialist: view a single appointment's details
router.get("/:id", protect, restrictTo("patient", "specialist"), getAppointmentById);

// Specialist: confirm or complete an appointment
router.patch("/:id/status", protect, restrictTo("specialist"), updateAppointmentStatus);

// Patient: soft-cancel (sets status to "cancelled")
router.delete("/:id", protect, restrictTo("patient"), cancelAppointment);

export default router;
