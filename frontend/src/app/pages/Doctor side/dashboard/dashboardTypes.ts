import type { ComponentType, CSSProperties } from "react";
import type { User, AvailableSlot } from "../../../context/AuthContext";

export interface Appointment {
  id: string;
  patientName: string;
  patientAvatar?: string;
  time: string;
  date: string;
  type: string;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  backendStatus?: "pending" | "confirmed" | "completed" | "cancelled";
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

export const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function buildProfileUpdatePayload(
  current: ProfileForm,
  saved: ProfileForm,
): Record<string, string> {
  const payload: Record<string, string> = {};

  if (current.bio !== saved.bio) payload.bio = current.bio;
  if (current.location !== saved.location) payload.clinicAddress = current.location;
  if (current.specialty !== saved.specialty) payload.specialization = current.specialty;

  return payload;
}

export function createEmptySlot(): AvailableSlot {
  return { day: "Sunday", startTime: "09:00", endTime: "17:00" };
}
