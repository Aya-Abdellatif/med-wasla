import User from "../../models/user.model.js";
import MedicalSpecialist from "../../models/medicalSpecialist.model.js";
import type { IAppointment } from "../../models/appointment.model.js";
import type { Types } from "mongoose";
import { sendWhatsAppMessage } from "./whatsapp.service.js";
import { sendAppointmentEmail } from "./email.service.js";

export interface NotificationData {
  patientPhone: string;
  patientName: string;
  patientEmail: string | null;
  params: string[]; 
}

export async function buildNotificationData(
  appointment: IAppointment & { _id: Types.ObjectId },
  patientUserId: string,
  specialistId: Types.ObjectId
): Promise<NotificationData | null> {
  const [patient, specialist] = await Promise.all([
    User.findById(patientUserId).select("name phone email"),
    MedicalSpecialist.findById(specialistId).populate<{ userId: { name: string } }>("userId", "name"),
  ]);

  if (!patient?.phone) return null;

  const patientName = patient.name ?? "المريض";
  const specialistName = (specialist?.userId as { name: string } | null)?.name ?? "المتخصص";
  const appointmentDate = new Date(appointment.date);

  const dateStr = appointmentDate.toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = appointmentDate.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return {
    patientPhone: patient.phone,
    patientName,
    patientEmail: patient.email ?? null,
    params: [specialistName, dateStr, timeStr],
  };
}

export async function sendCancellationNotification(
  appointment: IAppointment & { _id: Types.ObjectId },
  patientUserId: string,
  specialistId: Types.ObjectId
): Promise<void> {
  const data = await buildNotificationData(appointment, patientUserId, specialistId);
  if (!data) return;

  const params = [data.patientName, ...data.params];

  await sendWhatsAppMessage(data.patientPhone, "appointment_cancel", params)
    .catch(err => console.error("[WhatsApp] Cancellation send failed:", err));

  if (data.patientEmail) {
    sendAppointmentEmail(data.patientEmail, "appointment_cancel", params)
      .catch(err => console.error("[Email] Cancellation send failed:", err));
  }
}
