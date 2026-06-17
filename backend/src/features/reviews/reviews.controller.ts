import type { Request, Response, NextFunction } from "express";
import AppError from "../../utils/AppError.js";
import {
  createReviewService,
  getSpecialistReviewsService,
  updateReviewService,
  deleteReviewService,
} from "./reviews.service.js";

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.user?.id;

    if (!patientId) {
      return next(new AppError("Unauthorized", 401));
    }

    const { specialistId, appointmentId, rating, comment } = req.body;

    if (!specialistId || !appointmentId || rating == null) {
      return next(
        new AppError("specialistId, appointmentId, and rating are required", 400)
      );
    }

    if (rating < 1 || rating > 5) {
      return next(new AppError("Rating must be between 1 and 5", 400));
    }

    if (comment && comment.length > 1000) {
      return next(new AppError("Comment must be less than 1000 characters", 400));
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
      return next(new AppError("You already reviewed this appointment", 409));
    }

    return next(error);
  }
};

export const getSpecialistReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const specialistId = req.params.id;

    if (typeof specialistId !== "string") {
      return next(new AppError("Invalid specialist id", 400));
    }

    const { reviews, averageRating, totalReviews } =
      await getSpecialistReviewsService(specialistId);

    res.status(200).json({
      success: true,
      count: totalReviews,
      averageRating,
      data: reviews,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.user?.id;

    if (!patientId) {
      return next(new AppError("Unauthorized", 401));
    }

    const reviewId = req.params.id;

    if (typeof reviewId !== "string") {
      return next(new AppError("Invalid review id", 400));
    }

    const { rating, comment } = req.body;

    if (rating != null && (rating < 1 || rating > 5)) {
      return next(new AppError("Rating must be between 1 and 5", 400));
    }

    if (comment && comment.length > 1000) {
      return next(new AppError("Comment must be less than 1000 characters", 400));
    }

    const review = await updateReviewService(reviewId, patientId, {
      rating,
      comment,
    });

    if (!review) {
      return next(new AppError("Review not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    if ((error as Error).message === "FORBIDDEN") {
      return next(new AppError("You can only edit your own reviews", 403));
    }

    return next(error);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return next(new AppError("Unauthorized", 401));
    }

    const reviewId = req.params.id;

    if (typeof reviewId !== "string") {
      return next(new AppError("Invalid review id", 400));
    }

    const review = await deleteReviewService(
      reviewId,
      requesterId,
      requesterRole as "patient" | "specialist" | "admin"
    );

    if (!review) {
      return next(new AppError("Review not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    if ((error as Error).message === "FORBIDDEN") {
      return next(new AppError("You can only delete your own reviews", 403));
    }

    return next(error);
  }
};