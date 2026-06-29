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
  photoUrl: string;
}): Promise<PatientProfileApi["user"]> {
  const { data } = await axiosClient.patch<PatientProfileApi["user"]>(`/api/patient/profile/${userId}`, payload);
  return data;
}
