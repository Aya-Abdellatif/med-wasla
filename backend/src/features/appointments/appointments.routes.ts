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
  cancelDayAppointments,
  rescheduleAppointment,
} from "./appointments.controller.js";

const router = Router();

router.get("/available-slots/:specialistId", getAvailableSlots);
router.post("/", protect, restrictTo("patient"), createAppointment);
router.get("/my", protect, restrictTo("patient"), getMyAppointments);
router.get("/specialist", protect, restrictTo("specialist"), getSpecialistAppointments);
router.get("/:id", protect, restrictTo("patient", "specialist"), getAppointmentById);
router.patch("/:id/reschedule", protect, restrictTo("patient"), rescheduleAppointment);
router.patch("/:id/status", protect, restrictTo("specialist"), updateAppointmentStatus);
router.delete("/day/:date", protect, restrictTo("specialist"), cancelDayAppointments);
router.delete("/:id", protect, restrictTo("patient", "specialist"), cancelAppointment);

export default router;
