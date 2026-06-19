import { axiosClient } from "./axiosClient";
import { DEFAULT_SPECIALIST_IMAGE } from "../utils/specialistMapper";

export interface ReviewItem {
  text: string;
  name: string;
  role: string;
  rating: number;
  img: string;
}

export interface SpecialistReviewsResult {
  reviews: ReviewItem[];
  averageRating: number;
  totalReviews: number;
}

interface ApiReview {
  comment?: string;
  rating?: number;
  patientId?: {
    name?: string;
    photoUrl?: string;
  };
}

export async function fetchSpecialistReviews(
  specialistId: string,
): Promise<SpecialistReviewsResult> {
  const { data } = await axiosClient.get<{
    success: boolean;
    data: ApiReview[];
    averageRating: number;
    count: number;
  }>(`/api/reviews/specialist/${specialistId}`);

  if (!data.success || !Array.isArray(data.data)) {
    return { reviews: [], averageRating: 0, totalReviews: 0 };
  }

  return {
    averageRating: data.averageRating ?? 0,
    totalReviews: data.count ?? data.data.length,
    reviews: data.data.map((review) => ({
      text: review.comment ?? "",
      name: review.patientId?.name ?? "Patient",
      role: "Patient",
      rating: review.rating ?? 5,
      img: review.patientId?.photoUrl ?? DEFAULT_SPECIALIST_IMAGE,
    })),
  };
}

export interface CreateReviewPayload {
  specialistId: string;
  appointmentId: string;
  rating: number;
  comment?: string;
}

export async function createReview(payload: CreateReviewPayload) {
  const { data } = await axiosClient.post<{
    success: boolean;
    data: {
      rating: number;
      comment?: string;
    };
  }>("/api/reviews", payload);

  return data.data;
}
