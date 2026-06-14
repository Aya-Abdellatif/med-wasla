import { Router } from "express";
import {
  createReview,
  getSpecialistReviews,
  updateReview,
  deleteReview,
} from "./reviews.controller.js";

import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, restrictTo("patient"), createReview);

router.get("/specialist/:id", getSpecialistReviews);

router.put("/:id", protect, restrictTo("patient"), updateReview);

router.delete("/:id", protect, restrictTo("patient", "admin"), deleteReview);

export default router;