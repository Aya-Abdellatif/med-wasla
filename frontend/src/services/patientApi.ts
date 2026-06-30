import { axiosClient } from "./axiosClient";

export interface PatientProfileMedicalHistory {
  condition: string;
  diagnosed: string;
  treatedBy: string;
  notes?: string;
}

export interface PatientProfileApi {
  patientId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    photoUrl?: string;
    governorate?: string;
    dob?: string;
  };
  medicalHistory: PatientProfileMedicalHistory[];
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchPatientProfile(userId: string): Promise<PatientProfileApi> {
  const { data } = await axiosClient.get<PatientProfileApi>(`/api/patient/profile/${userId}`);
  return data;
}

export async function updatePatientProfile(userId: string, payload: {
  name: string;
  phone: string;
  governorate: string;
  address: string;
  dob: string;
}): Promise<PatientProfileApi["user"]> {
  const { data } = await axiosClient.patch<PatientProfileApi["user"]>(`/api/patient/profile/${userId}`, payload);
  return data;
}

export async function updatePatientPhoto(userId: string, file: File): Promise<{ photoUrl: string }> {
  const formData = new FormData();
  formData.append("photo", file);

  const { data } = await axiosClient.patch<{
    status: string;
    message: string;
    data: { photoUrl: string };
  }>(`/api/patient/profile/${userId}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!data.data?.photoUrl) {
    throw new Error("Failed to upload photo");
  }

  return { photoUrl: data.data.photoUrl };
}

export async function removePatientPhoto(userId: string): Promise<void> {
  await axiosClient.delete(`/api/patient/profile/${userId}/photo`);
}

export async function updatePatientSecurity(userId: string, payload: {
  currentPassword: string;
  email: string;
  password?: string;
}): Promise<PatientProfileApi["user"]> {
  const { data } = await axiosClient.patch<PatientProfileApi["user"]>(`/api/patient/profile/${userId}`, payload);
  return data;
}
