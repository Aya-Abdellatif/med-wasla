import Review from "../../models/review.model.js";
import Appointment from "../../models/appointment.model.js";
import { recalculateSpecialistRating } from "./reviews.utils.js";

async function validateReviewAppointment(data: {
  patientId: string;
  specialistId: string;
  appointmentId: string;
}) {
  const appointment = await Appointment.findById(data.appointmentId);
  if (!appointment) throw new Error("APPOINTMENT_NOT_FOUND");

  if (appointment.patientId.toString() !== data.patientId) {
    throw new Error("FORBIDDEN");
  }

  if (appointment.status !== "completed") {
    throw new Error("APPOINTMENT_NOT_COMPLETED");
  }

  if (appointment.specialistId.toString() !== data.specialistId) {
    throw new Error("SPECIALIST_MISMATCH");
  }
}

export const createReviewService = async (data: {
  patientId: string;
  specialistId: string;
  appointmentId: string;
  rating: number;
  comment?: string;
}) => {
  await validateReviewAppointment(data);

  const existing = await Review.findOne({ appointmentId: data.appointmentId });
  if (existing) throw new Error("ALREADY_REVIEWED");

  const review = await Review.create(data);
  await recalculateSpecialistRating(data.specialistId);
  return review;
};

export const getSpecialistReviewsService = async (specialistId: string) => {
  const reviews = await Review.find({ specialistId })
    .populate("patientId", "name photoUrl")
    .sort({ createdAt: -1 });

  const averageRating =
    reviews.length > 0
      ? parseFloat(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
        )
      : 0;

  return { reviews, averageRating, totalReviews: reviews.length };
};

export const updateReviewService = async (
  reviewId: string,
  patientId: string,
  updates: { rating?: number; comment?: string },
) => {
  const review = await Review.findById(reviewId);
  if (!review) return null;

  if (review.patientId.toString() !== patientId) throw new Error("FORBIDDEN");

  const updated = await Review.findByIdAndUpdate(reviewId, updates, {
    new: true,
    runValidators: true,
  });

  if (updated) {
    await recalculateSpecialistRating(updated.specialistId.toString());
  }

  return updated;
};

export const getPatientReviewsService = async (patientId: string) => {
  return Review.find({ patientId }).select("appointmentId rating comment");
};

export const deleteReviewService = async (
  reviewId: string,
  requesterId: string,
  requesterRole: "patient" | "specialist" | "admin",
) => {
  const review = await Review.findById(reviewId);
  if (!review) return null;

  if (requesterRole !== "admin" && review.patientId.toString() !== requesterId) {
    throw new Error("FORBIDDEN");
  }

  const specialistId = review.specialistId.toString();
  await Review.findByIdAndDelete(reviewId);
  await recalculateSpecialistRating(specialistId);
  return review;
};
