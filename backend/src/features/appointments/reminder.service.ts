import Reminder from "../../models/reminder.model.js";
import type { IAppointment } from "../../models/appointment.model.js";
import type { Types } from "mongoose";
import { buildNotificationData } from "./notification.service.js";
import { sendWhatsAppMessage } from "./whatsapp.service.js";
import { sendAppointmentEmail } from "./email.service.js";

export async function cancelAppointmentReminders(appointmentId: string): Promise<void> {
  await Reminder.updateMany(
    { appointmentId, status: "PENDING" },
    { $set: { status: "CANCELLED" } }
  );
}

export async function scheduleAppointmentReminders(
  appointment: IAppointment & { _id: Types.ObjectId },
  patientUserId: string,
  specialistId: Types.ObjectId
): Promise<void> {
  console.log(`[Reminder] Scheduling for appointment ${appointment._id}, type: ${appointment.type}`);

  const data = await buildNotificationData(appointment, patientUserId, specialistId);
  if (!data) {
    console.log(`[Reminder] Could not build data - patient phone not found for userId: ${patientUserId}`);
    return;
  }

  const { params, patientEmail } = data;
  const appointmentDate = new Date(appointment.date);
  const now = new Date();

  // Confirmation: WhatsApp via scheduler + Email immediately
  await Reminder.create({
    appointmentId: appointment._id,
    channel: "WHATSAPP",
    sendAt: now,
    status: "PENDING",
    templateName: "appointment_confirmation",
    templateParams: params,
    patientEmail: patientEmail ?? undefined,
  });
  console.log(`[Reminder] Confirmation reminder created for appointment ${appointment._id}`);

  if (patientEmail) {
    sendAppointmentEmail(patientEmail, "appointment_confirmation", params)
      .catch(err => console.error("[Email] Confirmation send failed:", err));
  }

  // 24h reminder: only if appointment is more than 24h away
  const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntil > 24) {
    await Reminder.create({
      appointmentId: appointment._id,
      channel: "WHATSAPP",
      sendAt: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000),
      status: "PENDING",
      templateName: "appointment_reminder",
      templateParams: params,
      patientEmail: patientEmail ?? undefined,
    });
  }
}

export async function processReminders(): Promise<void> {
  const now = new Date();
  console.log(`[Reminder] Processing at ${now.toISOString()}`);

  const pending = await Reminder.find({
    channel: "WHATSAPP",
    status: "PENDING",
    sendAt: { $lte: now },
  }).populate({
    path: "appointmentId",
    populate: { path: "patientId", select: "phone" },
  });

  console.log(`[Reminder] Found ${pending.length} pending reminder(s)`);

  for (const reminder of pending) {
    if (reminder.attempts >= reminder.maxAttempts) {
      reminder.status = "FAILED";
      await reminder.save();
      continue;
    }

    reminder.attempts += 1;

    try {
      const appointment = reminder.appointmentId as { patientId?: { phone?: string } } | null;
      const phone = appointment?.patientId?.phone;
      const { templateName, templateParams } = reminder;

      console.log(`[Reminder] id=${reminder._id} phone=${phone} template=${templateName}`);

      if (!phone || !templateName || !templateParams?.length) {
        console.log(`[Reminder] Skipping - missing phone, templateName, or templateParams`);
        reminder.status = "FAILED";
        await reminder.save();
        continue;
      }

      const msgId = await sendWhatsAppMessage(phone, templateName, templateParams);
      reminder.status = "SENT";
      reminder.sentAt = new Date();
      reminder.providerMessageId = msgId ?? undefined;

      if (reminder.patientEmail) {
        sendAppointmentEmail(reminder.patientEmail, templateName, templateParams)
          .catch(err => console.error("[Email] Reminder send failed:", err));
      }

    } catch (err) {
      const message = (err as Error).message;
      console.error(`[WhatsApp] Failed to send reminder ${reminder._id}:`, message);

      if (message === "NOT_ON_WHATSAPP" || reminder.attempts >= reminder.maxAttempts) {
        reminder.status = "FAILED";
      }
    }

    await reminder.save();
  }
}
