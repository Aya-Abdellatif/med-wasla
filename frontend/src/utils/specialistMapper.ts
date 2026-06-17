import { formatSpecialistName } from "./displayName";
import { API_BASE } from "../services/api";

export const DEFAULT_SPECIALIST_IMAGE =
  "https://images.unsplash.com/photo-1632054224477-c9cb3aae1b7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkb2N0b3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzc3NzI3Njk4fDA&ixlib=rb-4.1.0&q=80&w=1080";

export const DEFAULT_NURSE_IMAGE =
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXJzZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzc3Mjc2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080";

export interface ApiUserRef {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
}

export interface ApiSpecialist {
  _id: string;
  userId?: ApiUserRef | string;
  specialistType: "doctor" | "nurse";
  specialization?: string;
  clinicAddress?: string;
  bio?: string;
  consultationFee?: number;
  avgWaitMinutes?: number;
  rating?: number;
  reviewCount?: number;
  availableSlots?: { day: string; startTime: string; endTime: string }[];
  certifications?: { title: string; issuedBy?: string; status?: string }[];
  serviceAreas?: string[];
  areasOfExpertise?: string[];
  verificationStatus?: string;
}

export interface SpecialistCard {
  id: string;
  name: string;
  specialty: string;
  image: string;
  education: string;
  experience: string;
  rating: number;
  reviews: number;
  location: string;
  availability: string;
  description: string;
  services?: string[];
}

export interface SpecialistProfile extends SpecialistCard {
  email: string;
  phone: string;
  consultationFee: number;
  avgWaitTime: string;
  certifications: string[];
  expertise: string[];
  serviceAreas: string[];
}

function resolveUser(specialist: ApiSpecialist): ApiUserRef {
  if (specialist.userId && typeof specialist.userId === "object") {
    return specialist.userId;
  }
  return {};
}

export function mapSpecialistToCard(
  specialist: ApiSpecialist,
  type: "doctor" | "nurse",
): SpecialistCard {
  const user = resolveUser(specialist);
  const defaultImage = type === "doctor" ? DEFAULT_SPECIALIST_IMAGE : DEFAULT_NURSE_IMAGE;

  const specialty =
    type === "doctor"
      ? specialist.specialization ?? "General Practice"
      : specialist.areasOfExpertise?.[0] ?? "Home Care";

  return {
    id: specialist._id,
    name: formatSpecialistName(user.name, type),
    specialty,
    image: user.photoUrl || defaultImage,
    education: specialist.certifications?.[0]?.title ?? "Medical Degree",
    experience: specialist.avgWaitMinutes
      ? `${specialist.avgWaitMinutes} min avg wait`
      : "Experienced",
    rating: specialist.rating ?? 0,
    reviews: specialist.reviewCount ?? 0,
    location:
      type === "doctor"
        ? specialist.clinicAddress ?? user.address ?? "Cairo"
        : user.address ?? specialist.serviceAreas?.[0] ?? "Cairo",
    availability:
      specialist.availableSlots?.map((slot) => slot.day).join(", ") || "Contact for availability",
    description: specialist.bio ?? "Experienced medical specialist.",
    services: specialist.areasOfExpertise ?? specialist.serviceAreas,
  };
}

export function mapSpecialistToProfile(
  specialist: ApiSpecialist,
  type: "doctor" | "nurse",
): SpecialistProfile {
  const card = mapSpecialistToCard(specialist, type);
  const user = resolveUser(specialist);

  return {
    ...card,
    email: user.email ?? "",
    phone: user.phone ?? "",
    consultationFee: specialist.consultationFee ?? 0,
    avgWaitTime: specialist.avgWaitMinutes ? `${specialist.avgWaitMinutes} mins` : "N/A",
    certifications:
      specialist.certifications?.map((cert) => cert.title).filter(Boolean) ??
      ["Certified Specialist"],
    expertise:
      specialist.areasOfExpertise ??
      (specialist.specialization ? [specialist.specialization] : card.services ?? []),
    serviceAreas: specialist.serviceAreas ?? [],
  };
}

export async function fetchApprovedSpecialists(type: "doctor" | "nurse", limit = 100) {
  const res = await fetch(
    `${API_BASE}/api/specialists?verificationStatus=approved&specialistType=${type}&limit=${limit}`,
  );
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || `Failed to load ${type}s`);
  }
  return (json.data.specialists as ApiSpecialist[]).map((specialist) =>
    mapSpecialistToCard(specialist, type),
  );
}

export async function fetchSpecialistProfile(id: string, type: "doctor" | "nurse") {
  const res = await fetch(`${API_BASE}/api/specialists/${id}`);
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || "Specialist not found");
  }

  const specialist = json.data as ApiSpecialist;
  if (specialist.verificationStatus !== "approved") {
    throw new Error("Specialist not available");
  }

  return mapSpecialistToProfile(specialist, type);
}

export interface ReviewItem {
  text: string;
  name: string;
  role: string;
  rating: number;
  img: string;
}

export async function fetchSpecialistReviews(specialistId: string): Promise<ReviewItem[]> {
  const res = await fetch(`${API_BASE}/api/reviews/specialist/${specialistId}`);
  const json = await res.json();
  if (!json.success || !Array.isArray(json.data)) return [];

  return json.data.map((review: any) => ({
    text: review.comment ?? "",
    name: review.patientId?.name ?? "Patient",
    role: "Patient",
    rating: review.rating ?? 5,
    img: review.patientId?.photoUrl ?? DEFAULT_SPECIALIST_IMAGE,
  }));
}
