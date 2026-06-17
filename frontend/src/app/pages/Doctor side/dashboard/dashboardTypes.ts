import type { ComponentType, CSSProperties } from "react";
import type { User } from "../../../context/AuthContext";

export interface Appointment {
  id: string;
  patientName: string;
  patientAvatar?: string;
  time: string;
  date: string;
  type: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface HomeServiceRequest {
  id: string;
  patientName: string;
  address: string;
  service: string;
  requestedDate: string;
  requestedTime: string;
  status: "pending" | "accepted" | "rejected";
  phone: string;
}

export interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  location: string;
  bio: string;
}

export type DashboardTab = "overview" | "schedule" | "profile" | "requests";

export interface NewCertificateForm {
  title: string;
  issuedBy: string;
  certificateUrl: string;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  iconColor: string;
  bgColor: string;
}

export function buildProfileFormFromUser(user?: User | null): ProfileForm {
  return {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialty: user?.specialty || "",
    experience: user?.experience || "",
    location: user?.location || "",
    bio: user?.bio || "",
  };
}
