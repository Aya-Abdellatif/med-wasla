import type { Request, Response } from "express";
import {
  createReviewService,
  getSpecialistReviewsService,
  updateReviewService,
  deleteReviewService,
} from "./reviews.service.js";

// POST /api/reviews
export const createReview = async (req: Request, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { specialistId, appointmentId, rating, comment } = req.body;

    // Validate required fields before hitting the database
    if (!specialistId || !appointmentId || rating == null) {
      return res.status(400).json({
        success: false,
        message: "specialistId, appointmentId, and rating are required",
      });
    }

    const review = await createReviewService({
      patientId,
      specialistId,
      appointmentId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    if ((error as Error).message === "ALREADY_REVIEWED") {
      return res.status(409).json({
        success: false,
        message: "You already reviewed this appointment",
      });
    }
    console.error("[createReview]", error);
    res.status(500).json({ success: false, message: "Failed to create review" });
  }
};

// GET /api/reviews/specialist/:id
export const getSpecialistReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await getSpecialistReviewsService(req.params.id);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("[getSpecialistReviews]", error);
    res.status(500).json({ success: false, message: "Failed to get reviews" });
  }
};

// PUT /api/reviews/:id
export const updateReview = async (req: Request, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { rating, comment } = req.body;

    const review = await updateReviewService(req.params.id, patientId, {
      rating,
      comment,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    if ((error as Error).message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own reviews",
      });
    }
    console.error("[updateReview]", error);
    res.status(500).json({ success: false, message: "Failed to update review" });
  }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const review = await deleteReviewService(
      req.params.id,
      requesterId,
      requesterRole as string
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    if ((error as Error).message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }
    console.error("[deleteReview]", error);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};