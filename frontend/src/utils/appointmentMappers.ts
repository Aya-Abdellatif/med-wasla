import type {
  Appointment,
  AppointmentReview,
  AppointmentStatus,
} from "../app/components/patient-appointments/AppointmentTypes";
import type { Appointment as DashboardAppointment } from "../app/pages/Doctor side/dashboard/dashboardTypes";
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
}

interface ApiAppointment {
  _id: string;
  specialistId?: ApiSpecialistRef | string;
  patientId?: ApiPatientRef | string;
  date: string;
  type: "clinic" | "home";
  status: "pending" | "confirmed" | "completed" | "cancelled";
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
  return new Date(dateStr).toISOString().split("T")[0];
}

function mapPatientStatus(status: ApiAppointment["status"]): AppointmentStatus {
  if (status === "confirmed") return "upcoming";
  return status;
}

function mapDashboardStatus(
  status: ApiAppointment["status"],
): DashboardAppointment["status"] {
  if (status === "confirmed") return "scheduled";
  if (status === "pending") return "pending";
  if (status === "completed") return "completed";
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
      status: mapPatientStatus(appt.status),
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
        status: mapDashboardStatus(appt.status),
        backendStatus: appt.status,
      };
    });
}

export type SpecialistDashboardAppointment = DashboardAppointment & {
  backendStatus: ApiAppointment["status"];
};
