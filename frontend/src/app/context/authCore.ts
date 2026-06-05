import { createContext } from "react";

export type UserRole = "patient" | "doctor" | "nurse";

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  fileUrl?: string;
  verified: boolean;
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
  specialty?: string;
  experience?: string;
  location?: string;
  certificates?: Certificate[];
  diseaseHistory?: DiseaseRecord[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
