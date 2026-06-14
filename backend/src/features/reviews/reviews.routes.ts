import { Router } from "express";
import {
  createReview,
  getSpecialistReviews,
  updateReview,
  deleteReview,
} from "./reviews.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("patient"),
  createReview
);

router.get(
  "/specialist/:id",
  getSpecialistReviews // public، no auth
);

router.put(
  "/:id",
  authenticate,
  authorize("patient"),
  updateReview
);

router.delete(
  "/:id",
  authenticate,
  authorize("patient", "admin"),
  deleteReview
);

export default router;