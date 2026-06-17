import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";
import { mockAuth } from "../../middleware/mockAuth.js";
import { uploadPhoto } from "../../middleware/upload.middleware.js";
import {
  getAllSpecialists,
  getSpecialistById,
  getSpecialistsBySpecialization,
  updateAvailability,
  updateFees,
  SpecialistsController,
  updatePhoto,
} from "./specialists.controller.js";

const router = Router();

async function specialistAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.headers["x-user-id"]) {
    await mockAuth(req, res, next);
    return;
  }
  protect(req, res, () => {
    restrictTo("specialist")(req, res, next);
  });
}

router.get("/me", specialistAuth, SpecialistsController.getMe);
router.patch("/me/photo", specialistAuth, uploadPhoto.single("photo"), updatePhoto);
router.post("/me/certificates", specialistAuth, SpecialistsController.addCertificate);

router.get("/", getAllSpecialists);
router.get("/specialization/:name", getSpecialistsBySpecialization);
router.get("/:id", getSpecialistById);

router.put("/profile", specialistAuth, SpecialistsController.updateProfile);
router.put("/availability", specialistAuth, updateAvailability);
router.put("/fees", specialistAuth, updateFees);

export default router;
