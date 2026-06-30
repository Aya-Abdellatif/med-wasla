import type {
  Appointment,
  AppointmentReview,
  AppointmentStatus,
} from "../app/components/patient-appointments/AppointmentTypes";
import type { Appointment as DashboardAppointment, HomeServiceRequest } from "../app/pages/Doctor side/dashboard/dashboardTypes";
import { DEFAULT_SPECIALIST_IMAGE } from "./specialistMapper";

interface ApiUserRef {
  name?: string;
  photoUrl?: string;
  phone?: string;
}

interface ApiSpecialistRef {
  _id: string;
  specialization?: string;
  consultationFee?: number;
  rating?: number;
  userId?: ApiUserRef;
}

interface ApiPatientRef {
  _id?: string;
  name?: string;
  photoUrl?: string;
  phone?: string;
}

interface ApiAppointment {
  _id: string;
  specialistId?: ApiSpecialistRef | string;
  patientId?: ApiPatientRef | string;
  date: string;
  type: "clinic" | "home";
  status: "pending" | "confirmed" | "completed" | "cancelled" | "overdue" | "no_show";
  address?: string;
  notes?: string;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resolvePatientStatus(appt: ApiAppointment): AppointmentStatus {
  const isPast = new Date(appt.date).getTime() < Date.now();

  if (appt.status === "completed") return "completed";
  if (appt.status === "cancelled") return "cancelled";
  if (appt.status === "no_show") return "no_show";
  if (
    appt.type === "home" &&
    (appt.status === "overdue" ||
      (isPast && (appt.status === "pending" || appt.status === "confirmed")))
  ) {
    return "overdue";
  }
  if (appt.status === "confirmed") return "upcoming";
  return appt.status;
}

function resolveDashboardStatus(
  status: ApiAppointment["status"],
  dateStr: string,
  type: ApiAppointment["type"],
): DashboardAppointment["status"] {
  const isPast = new Date(dateStr).getTime() < Date.now();

  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "no_show") return "no_show";
  if (
    type === "home" &&
    (status === "overdue" || (isPast && (status === "pending" || status === "confirmed")))
  ) {
    return "overdue";
  }
  if (status === "confirmed") return "scheduled";
  if (status === "pending") return "pending";
  return "cancelled";
}

export function mapApiAppointmentsForPatient(
  appointments: unknown[],
  reviewByAppointment: Map<string, AppointmentReview>,
): Appointment[] {
  return (appointments as ApiAppointment[]).map((appt) => {
    const specialist =
      typeof appt.specialistId === "object" ? appt.specialistId : undefined;
    const user = specialist?.userId;
    const review = reviewByAppointment.get(appt._id);

    return {
      id: appt._id,
      specialistId: specialist?._id ?? String(appt.specialistId),
      doctor: {
        name: user?.name ?? "Specialist",
        specialty: specialist?.specialization ?? "General Practice",
        photo: user?.photoUrl ?? DEFAULT_SPECIALIST_IMAGE,
        phone: user?.phone ?? "",
        rating: specialist?.rating ?? 0,
      },
      date: formatDate(appt.date),
      time: formatTime(appt.date),
      type: appt.type,
      status: resolvePatientStatus(appt),
      address: appt.address,
      reason: appt.notes ?? "Medical consultation",
      reminders: [],
      fee: specialist?.consultationFee ?? 0,
      review,
    };
  });
}

export function mapApiAppointmentsForSpecialist(
  appointments: unknown[],
): DashboardAppointment[] {
  return (appointments as ApiAppointment[])
    .filter((appt) => appt.status !== "cancelled")
    .map((appt) => {
      const patient =
        typeof appt.patientId === "object" ? appt.patientId : undefined;

      return {
        id: appt._id,
        patientName: patient?.name ?? "Patient",
        patientAvatar: patient?.photoUrl,
        date: formatDate(appt.date),
        time: formatTime(appt.date),
        type: appt.type === "home" ? "Home Visit" : "Clinic Visit",
        visitType: appt.type,
        status: resolveDashboardStatus(appt.status, appt.date, appt.type),
        backendStatus:
          resolveDashboardStatus(appt.status, appt.date, appt.type) === "overdue"
            ? "overdue"
            : appt.status,
      };
    });
}

function mapHomeServiceRequestStatus(
  status: ApiAppointment["status"],
): HomeServiceRequest["status"] {
  if (status === "confirmed" || status === "completed") return "accepted";
  if (status === "cancelled") return "rejected";
  return "pending";
}

export function mapHomeServiceRequests(appointments: unknown[]): HomeServiceRequest[] {
  return (appointments as ApiAppointment[])
    .filter((appt) => appt.type === "home")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((appt) => {
      const patient =
        typeof appt.patientId === "object" ? appt.patientId : undefined;

      return {
        id: appt._id,
        patientName: patient?.name ?? "Patient",
        address: appt.address ?? "—",
        service: appt.notes?.trim() || "Home Visit",
        requestedDate: new Date(appt.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        requestedTime: formatTime(appt.date),
        status: mapHomeServiceRequestStatus(appt.status),
        phone: patient?.phone ?? "—",
        backendStatus: appt.status,
      };
    });
}

export type SpecialistDashboardAppointment = DashboardAppointment & {
  backendStatus: ApiAppointment["status"];
};
