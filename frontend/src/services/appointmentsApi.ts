import { axiosClient } from "./axiosClient";
import type { Appointment } from "../app/components/patient-appointments/AppointmentTypes";
import type { Appointment as DashboardAppointment, HomeServiceRequest } from "../app/pages/Doctor side/dashboard/dashboardTypes";
import {
  mapApiAppointmentsForPatient,
  mapApiAppointmentsForSpecialist,
  mapHomeServiceRequests,
} from "../utils/appointmentMappers";

export interface BookAppointmentPayload {
  specialistId: string;
  date: string;
  time: string;
  type: "clinic" | "home";
  address?: string;
  notes?: string;
}

export interface AvailableSlotsResult {
  availableSlots: string[];
  workingHours: { start: string; end: string } | null;
}

export async function fetchAvailableSlots(
  specialistId: string,
  date: string,
): Promise<AvailableSlotsResult> {
  const { data } = await axiosClient.get<{
    success: boolean;
    data: AvailableSlotsResult;
  }>(`/api/appointments/available-slots/${specialistId}`, {
    params: { date },
  });

  return data.data ?? { availableSlots: [], workingHours: null };
}

export async function bookAppointment(payload: BookAppointmentPayload) {
  const { data } = await axiosClient.post<{ success: boolean; message: string }>(
    "/api/appointments",
    payload,
  );
  return data;
}

export async function fetchMyAppointments(): Promise<Appointment[]> {
  const [appointmentsRes, reviewsRes] = await Promise.all([
    axiosClient.get<{ success: boolean; data: unknown[] }>("/api/appointments/my"),
    axiosClient.get<{
      success: boolean;
      data: { appointmentId: string; rating: number; comment?: string }[];
    }>("/api/reviews/my"),
  ]);

  const reviewByAppointment = new Map(
    (reviewsRes.data.data ?? []).map((review) => [
      typeof review.appointmentId === "string"
        ? review.appointmentId
        : (review.appointmentId as { toString(): string }).toString(),
      { rating: review.rating, comment: review.comment ?? "" },
    ]),
  );

  return mapApiAppointmentsForPatient(appointmentsRes.data.data ?? [], reviewByAppointment);
}

export interface SpecialistAppointmentsResult {
  appointments: DashboardAppointment[];
  homeServiceRequests: HomeServiceRequest[];
}

export async function fetchSpecialistAppointments(): Promise<SpecialistAppointmentsResult> {
  const { data } = await axiosClient.get<{ success: boolean; data: unknown[] }>(
    "/api/appointments/specialist",
  );
  const raw = data.data ?? [];
  return {
    appointments: mapApiAppointmentsForSpecialist(raw),
    homeServiceRequests: mapHomeServiceRequests(raw),
  };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "confirmed" | "completed" | "no_show",
) {
  const { data } = await axiosClient.patch<{ success: boolean; message: string }>(
    `/api/appointments/${appointmentId}/status`,
    { status },
  );
  return data;
}

export async function cancelAppointment(appointmentId: string) {
  const { data } = await axiosClient.delete<{ success: boolean; message: string }>(
    `/api/appointments/${appointmentId}`,
  );
  return data;
}

export async function rescheduleAppointment(appointmentId: string, date: string, time: string, notes?: string) {
  const { data } = await axiosClient.patch<{ success: boolean; message: string }>(
    `/api/appointments/${appointmentId}/reschedule`,
    { date, time, notes },
  );
  return data;
}

export async function cancelDayAppointments(date: string) {
  const { data } = await axiosClient.delete<{ success: boolean; message: string; data: { cancelledCount: number } }>(
    `/api/appointments/day/${date}`,
  );
  return data;
}

export interface QueueEntry {
  queueNumber: number;
  status: "waiting" | "in_progress" | "completed" | "cancelled";
  isSelf: boolean;
}

export interface AppointmentQueueResult {
  queueId?: string;
  isActive: boolean;
  currentNumber: number;
  userEntry?: {
    queueNumber: number;
    status: string;
  };
  waitingAhead: number;
  totalEntries: number;
  entries: QueueEntry[];
}

export async function fetchAppointmentQueue(appointmentId: string): Promise<AppointmentQueueResult> {
  const { data } = await axiosClient.get<{
    status: string;
    data: AppointmentQueueResult;
  }>(`/api/queue/appointment/${appointmentId}`);
  return data.data;
}
