import Review from "../../models/review.model.js";
export const createReviewService = async (data) => {
    const existing = await Review.findOne({ appointmentId: data.appointmentId });
    if (existing)
        throw new Error("ALREADY_REVIEWED");
    const review = await Review.create(data);
    return review;
};
export const getSpecialistReviewsService = async (specialistId) => {
    const reviews = await Review.find({ specialistId })
        .populate("patientId", "name profileImage")
        .sort({ createdAt: -1 });
    // Calculate average rating
    const averageRating = reviews.length > 0
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 0;
    return { reviews, averageRating, totalReviews: reviews.length };
};
export const updateReviewService = async (reviewId, patientId, updates) => {
    const review = await Review.findById(reviewId);
    if (!review)
        return null;
    // Ensure the requester owns this review
    if (review.patientId.toString() !== patientId)
        throw new Error("FORBIDDEN");
    const updated = await Review.findByIdAndUpdate(reviewId, updates, {
        new: true,
        runValidators: true,
    });
    return updated;
};
export const deleteReviewService = async (reviewId, requesterId, requesterRole) => {
    const review = await Review.findById(reviewId);
    if (!review)
        return null;
    // Admin can delete any review, patient can only delete their own
    if (requesterRole !== "admin" && review.patientId.toString() !== requesterId) {
        throw new Error("FORBIDDEN");
    }
    await Review.findByIdAndDelete(reviewId);
    return review;
};
//# sourceMappingURL=reviews.service.js.map