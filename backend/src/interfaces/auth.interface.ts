// auth.interface.ts
import type { Governorate, UserRole } from "../models/user.model.js";
import type { SpecialistType } from "../models/medicalSpecialist.model.js";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  governorate: Governorate;
  dob: Date;
  address?: string;
  role?: UserRole;
  specialistType?: SpecialistType;
  licenseNumber?: string;
  homeVisit?: boolean;
  specialization?: string;
  serviceAreas?: string[];
  clinicAddress?: string;
  bio?: string;
  consultationFee?: number;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}