import { Router } from "express";
import {
  getAllSpecialists,
  getSpecialistById,
  getSpecialistsBySpecialization,
  updateProfile,
  updateAvailability,
  updateFees,
} from "./specialists.controller.js";
// import { authenticate, authorizeSpecialist } from "../middleware/auth.middleware";

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /api/specialists
router.get("/", getAllSpecialists);

// GET /api/specialists/specialization/:name
// NOTE: This must come BEFORE /:id to avoid "specialization" being treated as an id
router.get("/specialization/:name", getSpecialistsBySpecialization);

// GET /api/specialists/:id
router.get("/:id", getSpecialistById);

// ─── Protected Routes (doctor / nurse only) ───────────────────────────────────

// PUT /api/specialists/profile
// router.put("/profile", authenticate, authorizeSpecialist, updateProfile);

// PUT /api/specialists/availability
// router.put("/availability", authenticate, authorizeSpecialist, updateAvailability);

// PUT /api/specialists/fees
// router.put("/fees", authenticate, authorizeSpecialist, updateFees);

export default router;