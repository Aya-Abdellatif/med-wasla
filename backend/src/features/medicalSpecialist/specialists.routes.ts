import { Router } from "express";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";
import {
  getAllSpecialists,
  getSpecialistById,
  getSpecialistsBySpecialization,
  getMe,
  updateProfile,
  addCertificate,
  updateAvailability,
  updateFees,
} from "./specialists.controller.js";

const router = Router();

const requireSpecialist = [
  protect,
  restrictTo("specialist"),
] as const;

router.get("/", getAllSpecialists);

router.get("/specialization/:name", getSpecialistsBySpecialization);

router.get("/me", ...requireSpecialist, getMe);
router.post("/me/certificates", ...requireSpecialist, addCertificate);

router.put("/profile", ...requireSpecialist, updateProfile);
router.put("/availability", ...requireSpecialist, updateAvailability);
router.put("/fees", ...requireSpecialist, updateFees);

router.get("/:id", getSpecialistById);

export default router;