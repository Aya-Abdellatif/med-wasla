import { axiosClient } from "./axiosClient";

export interface AdminUserInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  photoUrl?: string;
}

export interface AdminCertification {
  _id: string;
  title: string;
  issuedBy: string;
  issuedAt?: string;
  certificateUrl: string;
  status: "pending" | "approved" | "rejected";
}

export interface AdminSpecialist {
  _id: string;
  userId: AdminUserInfo;
  specialistType: "doctor" | "nurse";
  specialization?: string;
  clinicAddress?: string;
  homeVisit: boolean;
  licenseNumber: string;
  bio?: string;
  consultationFee?: number;
  certifications?: AdminCertification[];
  verificationStatus: "pending" | "approved" | "rejected";
  pendingProfileUpdates?: {
    bio?: string;
    clinicAddress?: string;
    specialization?: string;
    areasOfExpertise?: string[];
    avgWaitMinutes?: number;
    serviceAreas?: string[];
    homeVisit?: boolean;
  };
}

export async function fetchAdminSpecialists(
  signal?: AbortSignal,
): Promise<AdminSpecialist[]> {
  const { data } = await axiosClient.get<{
    success: boolean;
    data: AdminSpecialist[];
  }>("/api/admin/specialists", { signal });

  return data.data ?? [];
}

export async function updateSpecialistVerification(
  specialistId: string,
  action: "approve" | "reject",
) {
  const { data } = await axiosClient.patch<{
    success: boolean;
    message?: string;
  }>(`/api/admin/specialists/${specialistId}/${action}`);

  return data;
}
