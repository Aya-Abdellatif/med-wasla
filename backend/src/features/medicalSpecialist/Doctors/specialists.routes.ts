import { Router } from "express";
import { protect, restrictTo } from "../../../middleware/auth.middleware.js";
import {
  getAllSpecialists,
  getSpecialistById,
  getSpecialistsBySpecialization,
  updateProfile,
  updateAvailability,
  updateFees,
} from "./specialists.controller.js";

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

router.get("/", getAllSpecialists);
router.get("/specialization/:name", getSpecialistsBySpecialization);
router.get("/:id", getSpecialistById);

// ─── Protected Routes (specialist only) ──────────────────────────────────────

router.use(protect, restrictTo("specialist"));

router.put("/profile", updateProfile);
router.put("/availability", updateAvailability);
router.put("/fees", updateFees);

export default router;
