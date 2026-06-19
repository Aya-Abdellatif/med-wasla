import Review from "../../models/review.model.js";
import MedicalSpecialist from "../../models/medicalSpecialist.model.js";

export async function recalculateSpecialistRating(specialistId: string) {
  const reviews = await Review.find({ specialistId });
  const reviewCount = reviews.length;
  const rating =
    reviewCount > 0
      ? parseFloat(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1),
        )
      : 0;

  await MedicalSpecialist.findByIdAndUpdate(specialistId, { rating, reviewCount });
}
