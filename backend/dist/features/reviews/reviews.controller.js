import { createReviewService, getSpecialistReviewsService, updateReviewService, deleteReviewService, } from "./reviews.service.js";
// POST /api/reviews
export const createReview = async (req, res) => {
    try {
        const patientId = req.user?.id;
        if (!patientId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { specialistId, appointmentId, rating, comment } = req.body;
        if (!specialistId || !appointmentId || rating == null) {
            return res.status(400).json({
                success: false,
                message: "specialistId, appointmentId, and rating are required",
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }
        if (comment && comment.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Comment must be less than 1000 characters",
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
    }
    catch (error) {
        if (error.message === "ALREADY_REVIEWED") {
            return res.status(409).json({
                success: false,
                message: "You already reviewed this appointment",
            });
        }
        console.error("[createReview]", error);
        res.status(500).json({
            success: false,
            message: "Failed to create review",
        });
    }
};
// GET /api/reviews/specialist/:id
export const getSpecialistReviews = async (req, res) => {
    try {
        const specialistId = req.params.id;
        if (typeof specialistId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid specialist id",
            });
        }
        const { reviews, averageRating, totalReviews } = await getSpecialistReviewsService(specialistId);
        res.status(200).json({
            success: true,
            count: totalReviews,
            averageRating,
            data: reviews,
        });
    }
    catch (error) {
        console.error("[getSpecialistReviews]", error);
        res.status(500).json({
            success: false,
            message: "Failed to get reviews",
        });
    }
};
// PUT /api/reviews/:id
export const updateReview = async (req, res) => {
    try {
        const patientId = req.user?.id;
        if (!patientId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const reviewId = req.params.id;
        if (typeof reviewId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid review id",
            });
        }
        const { rating, comment } = req.body;
        if (rating != null && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }
        if (comment && comment.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Comment must be less than 1000 characters",
            });
        }
        const review = await updateReviewService(reviewId, patientId, {
            rating,
            comment,
        });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: review,
        });
    }
    catch (error) {
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own reviews",
            });
        }
        console.error("[updateReview]", error);
        res.status(500).json({
            success: false,
            message: "Failed to update review",
        });
    }
};
// DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
    try {
        const requesterId = req.user?.id;
        const requesterRole = req.user?.role;
        if (!requesterId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const reviewId = req.params.id;
        if (typeof reviewId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid review id",
            });
        }
        const review = await deleteReviewService(reviewId, requesterId, requesterRole);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    }
    catch (error) {
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own reviews",
            });
        }
        console.error("[deleteReview]", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete review",
        });
    }
};
//# sourceMappingURL=reviews.controller.js.map