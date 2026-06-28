import type { Appointment } from "./dashboardTypes";

/** MedWasla dashboard palette (matches site primary teal). */
export const DASHBOARD_THEME = {
  primary: "#14b8a6",
  primaryDark: "#0d9488",
  primaryLight: "#ccfbf1",
  accent: "#0ea5e9",
  accentLight: "#ecfeff",
  warning: "#d97706",
  warningLight: "#fffbeb",
  success: "#059669",
  successLight: "#ecfdf5",
  danger: "#dc2626",
  dangerLight: "#fef2f2",
  muted: "#6b7280",
  text: "#111827",
} as const;

export function getAvatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: "#e0f2fe", text: "#0369a1" },
    { bg: "#d1fae5", text: "#065f46" },
    { bg: "#ede9fe", text: "#5b21b6" },
    { bg: "#fce7f3", text: "#9d174d" },
    { bg: "#fef3c7", text: "#92400e" },
    { bg: "#e0e7ff", text: "#3730a3" },
    { bg: "#ccfbf1", text: "#0f766e" },
  ];
  const index = (name.charCodeAt(0) || 0) % colors.length;
  return colors[index];
}

export function formatDateLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getDateStrWithOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
}

export function getStatusBadgeStyle(status: Appointment["status"]) {
  if (status === "pending") {
    return { backgroundColor: DASHBOARD_THEME.warningLight, color: DASHBOARD_THEME.warning };
  }
  if (status === "scheduled") {
    return { backgroundColor: DASHBOARD_THEME.primaryLight, color: DASHBOARD_THEME.primaryDark };
  }
  if (status === "completed") {
    return { backgroundColor: DASHBOARD_THEME.successLight, color: DASHBOARD_THEME.success };
  }
  if (status === "overdue") {
    return { backgroundColor: "#f3f4f6", color: "#4b5563" };
  }
  return { backgroundColor: DASHBOARD_THEME.dangerLight, color: DASHBOARD_THEME.danger };
}

export function isHomeVisitAppointment(appointment: Appointment) {
  return appointment.visitType === "home";
}

export function isClinicAppointment(appointment: Appointment) {
  return appointment.visitType === "clinic";
}

/** Specialists who can receive home-visit requests in the dashboard. */
export function offersHomeService(user: { role?: string; homeVisit?: boolean } | null | undefined) {
  if (!user) return false;
  if (user.role === "nurse") return true;
  return user.role === "doctor" && user.homeVisit === true;
}

export function getFormattedToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Count scheduled/completed appointments between Sunday and Saturday of the current week. */
export function countAppointmentsThisWeek(appointments: Appointment[]): number {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return appointments.filter((appointment) => {
    const date = new Date(`${appointment.date}T00:00:00`);
    return date >= start && date <= end;
  }).length;
}

/** Unique patient names across all appointments. */
export function countUniquePatients(appointments: Appointment[]): number {
  return new Set(appointments.map((a) => a.patientName)).size;
}
