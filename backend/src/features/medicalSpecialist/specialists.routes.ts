import { Router } from "express";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";
import { uploadPhoto } from "../../middleware/upload.middleware.js";
import {
  getAllSpecialists,
  getSpecialistById,
  getSpecialistsBySpecialization,
  getMe,
  updateProfile,
  addCertificate,
  updateAvailability,
  updateFees,
  updatePhoto,
} from "./specialists.controller.js";

const router = Router();

const requireSpecialist = [protect, restrictTo("specialist")] as const;

router.get("/", getAllSpecialists);
router.get("/specialization/:name", getSpecialistsBySpecialization);
router.get("/me", ...requireSpecialist, getMe);
router.patch("/me/photo", ...requireSpecialist, uploadPhoto.single("photo"), updatePhoto);
router.post("/me/certificates", ...requireSpecialist, addCertificate);
router.get("/:id", getSpecialistById);

router.put("/profile", ...requireSpecialist, updateProfile);
router.put("/availability", ...requireSpecialist, updateAvailability);
router.put("/fees", ...requireSpecialist, updateFees);

export default router;
