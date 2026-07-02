import type { ComponentType, CSSProperties } from "react";
import type { User, AvailableSlot } from "../../../context/AuthContext";

export interface Appointment {
  id: string;
  patientName: string;
  patientAvatar?: string;
  time: string;
  date: string;
  scheduledAtMs?: number;
  type: string;
  visitType: "clinic" | "home";
  status:
    | "pending"
    | "scheduled"
    | "completed"
    | "cancelled"
    | "overdue"
    | "no_show";
  backendStatus?:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "overdue"
    | "no_show";
}

export interface HomeServiceRequest {
  id: string;
  patientName: string;
  address: string;
  service: string;
  requestedDate: string;
  requestedTime: string;
  scheduledAtMs?: number;
  status: "pending" | "accepted" | "rejected";
  phone: string;
  backendStatus?:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "overdue"
    | "no_show";
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

export type DashboardTab = "overview" | "schedule" | "requests";

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

  if (current.name !== saved.name) payload.name = current.name;
  if (current.phone !== saved.phone) payload.phone = current.phone;
  if (current.email !== saved.email) payload.email = current.email;
  if (current.bio !== saved.bio) payload.bio = current.bio;
  if (current.location !== saved.location)
    payload.clinicAddress = current.location;
  if (current.specialty !== saved.specialty)
    payload.specialization = current.specialty;

  return payload;
}

export function createEmptySlot(existingSlots: AvailableSlot[] = []): AvailableSlot {
  const nextDay = getNextAvailableDay(existingSlots);
  return {
    day: nextDay ?? "Sunday",
    startTime: "09:00",
    endTime: "17:00",
  };
}

export function getNextAvailableDay(slots: AvailableSlot[]): string | null {
  const used = new Set(slots.map((slot) => slot.day));
  return WEEK_DAYS.find((day) => !used.has(day)) ?? null;
}

export function hasDuplicateSlotDays(slots: AvailableSlot[]): boolean {
  const days = slots.map((slot) => slot.day);
  return new Set(days).size !== days.length;
}
