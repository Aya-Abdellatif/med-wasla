import { axiosClient } from "./axiosClient";

export interface PatientProfileResponse {
  patientId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    photoUrl?: string;
    dob?: string;
    governorate?: string;
  };
  medicalHistory: Array<{
    condition: string;
    diagnosed: string;
    treatedBy: string;
    notes?: string;
  }>;
}

export interface UpdatePatientProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dob?: string;
  governorate?: string;
}

export async function fetchPatientProfile(userId: string): Promise<PatientProfileResponse> {
  const { data } = await axiosClient.get<PatientProfileResponse>(
    `/api/patient/profile/${userId}`,
  );
  return data;
}

export async function updatePatientProfile(
  userId: string,
  payload: UpdatePatientProfilePayload,
) {
  const { data } = await axiosClient.patch(`/api/patient/profile/${userId}`, payload);
  return data;
}
