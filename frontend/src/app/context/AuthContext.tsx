export type UserRole = "patient" | "doctor" | "nurse" | "admin";

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  fileUrl?: string;
  verified: boolean;
  status?: VerificationStatus;
}

export interface DiseaseRecord {
  id: string;
  disease: string;
  diagnosedDate: string;
  treatedBy: string;
  status: "active" | "resolved" | "under_treatment";
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  specialty?: string;
  experience?: string;
  location?: string;
  bio?: string;
  verificationStatus?: VerificationStatus;
  specialistId?: string;
  homeVisit?: boolean;
  certificates?: Certificate[];
  diseaseHistory?: DiseaseRecord[];
  availableSlots?: AvailableSlot[];
  pendingProfileUpdates?: Partial<Pick<User, "bio" | "location" | "specialty">>;
}

export interface AvailableSlot {
  day: string;
  startTime: string;
  endTime: string;
}
