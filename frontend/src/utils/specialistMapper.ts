import { formatSpecialistName } from "./displayName";
import { axiosClient } from "../services/axiosClient";

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
  governorate?: string;
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
  experience?: string;
  rating: number;
  reviews: number;
  location?: string;
  serviceAreas?: string[];
  availability: string;
  availableSlots?: { day: string; startTime: string; endTime: string }[];
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

export interface FetchSpecialistsParams {
  search?: string;
  specialization?: string;
  expertise?: string;
  sortBy?:
    | "rating"
    | "reviewCount"
    | "consultationFee"
    | "avgWaitMinutes"
    | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchSpecialistsResult {
  specialists: SpecialistCard[];
  pagination: PaginationMeta;
}

function resolveUser(specialist: ApiSpecialist): ApiUserRef {
  if (specialist.userId && typeof specialist.userId === "object") {
    return specialist.userId;
  }
  return {};
}

function pickEducationTitle(
  specialist: ApiSpecialist,
  type: "doctor" | "nurse",
): string {
  const certs = specialist.certifications ?? [];
  const approved = certs.find((cert) => cert.status === "approved");
  const chosen = approved ?? certs[0];

  if (chosen?.title) return chosen.title;
  return type === "doctor" ? "Medical Degree" : "Nursing License";
}

export function mapSpecialistToCard(
  specialist: ApiSpecialist,
  type: "doctor" | "nurse",
): SpecialistCard {
  const user = resolveUser(specialist);
  const isDoctor = type === "doctor";
  const defaultImage = isDoctor ? DEFAULT_SPECIALIST_IMAGE : DEFAULT_NURSE_IMAGE;

  const specialty = isDoctor
    ? (specialist.specialization ?? "General Practice")
    : (specialist.areasOfExpertise?.[0] ?? "Home Care");

  return {
    id: specialist._id,
    name: formatSpecialistName(user.name, type),
    specialty,
    image: user.photoUrl || defaultImage,
    education: pickEducationTitle(specialist, type),
    experience:
      isDoctor && specialist.avgWaitMinutes
        ? `${specialist.avgWaitMinutes} min avg wait`
        : undefined,
    rating: specialist.rating ?? 0,
    reviews: specialist.reviewCount ?? 0,
    location: isDoctor
      ? (specialist.clinicAddress ?? user.address ?? "Address not listed")
      : undefined,
    serviceAreas: isDoctor ? undefined : (specialist.serviceAreas ?? []),
    availability: specialist.availableSlots?.length
      ? specialist.availableSlots
          .map((slot) => `${slot.day} ${slot.startTime}-${slot.endTime}`)
          .join(", ")
      : "Contact for availability",
    availableSlots: specialist.availableSlots ?? [],
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
    avgWaitTime: specialist.avgWaitMinutes
      ? `${specialist.avgWaitMinutes} mins`
      : "N/A",
    certifications: specialist.certifications
      ?.map((cert) => cert.title)
      .filter(Boolean) ?? ["Certified Specialist"],
    expertise:
      specialist.areasOfExpertise ??
      (specialist.specialization
        ? [specialist.specialization]
        : (card.services ?? [])),
    serviceAreas: specialist.serviceAreas ?? [],
  };
}

export async function fetchApprovedSpecialists(
  type: "doctor" | "nurse",
  params: FetchSpecialistsParams = {},
): Promise<FetchSpecialistsResult> {
  const {
    search,
    specialization,
    expertise,
    sortBy,
    sortOrder,
    page = 1,
    limit = 9,
  } = params;

  const { data: json } = await axiosClient.get("/api/specialists", {
    params: {
      verificationStatus: "approved",
      specialistType: type,
      page,
      limit,
      ...(search ? { search } : {}),
      ...(specialization ? { specialization } : {}),
      ...(expertise ? { expertise } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(sortOrder ? { sortOrder } : {}),
    },
  });

  return {
    specialists: (json.data.specialists as ApiSpecialist[]).map((specialist) =>
      mapSpecialistToCard(specialist, type),
    ),
    pagination: json.data.pagination as PaginationMeta,
  };
}

export async function fetchSpecialistProfile(
  id: string,
  type: "doctor" | "nurse",
): Promise<SpecialistProfile> {
  const { data: json } = await axiosClient.get(`/api/specialists/${id}`);

  const specialist = json.data as ApiSpecialist;
  if (specialist.verificationStatus !== "approved") {
    throw new Error("Specialist not available");
  }

  return mapSpecialistToProfile(specialist, type);
}