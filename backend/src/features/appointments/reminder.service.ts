import Reminder from "../../models/reminder.model.js";
import User from "../../models/user.model.js";
import MedicalSpecialist from "../../models/medicalSpecialist.model.js";
import type { IAppointment } from "../../models/appointment.model.js";
import type { Types } from "mongoose";

function toInternationalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `2${digits}` : digits;
}

async function sendWhatsAppMessage(
  phone: string,
  templateName: string,
  templateParams: string[]
): Promise<string | null> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log(`[WhatsApp DEV] To: ${phone}, template: ${templateName}, params:`, templateParams);
    return "dev-mock-id";
  }

  const to = toInternationalPhone(phone);
  console.log(`[WhatsApp] Sending template "${templateName}" to ${to}`);

  const response = await fetch(
    `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "ar" },
          components: [
            {
              type: "body",
              parameters: templateParams.map(p => ({ type: "text", text: p })),
            },
          ],
        },
      }),
    }
  );

  const data = await response.json() as { messages?: { id: string }[]; error?: { code: number; message: string } };
  console.log(`[WhatsApp] Response ${response.status}:`, JSON.stringify(data));

  if (!response.ok) {
    const code = data.error?.code;
    if (code === 131026) 
      throw new Error("NOT_ON_WHATSAPP");
    
    throw new Error(data.error?.message ?? "WHATSAPP_SEND_FAILED");
  }

  return data.messages?.[0]?.id ?? null;
}

async function buildTemplateData(
  appointment: IAppointment & { _id: Types.ObjectId },
  patientUserId: string,
  specialistId: Types.ObjectId
): Promise<{ patientPhone: string; patientName: string; params: string[] } | null> {
  const [patient, specialist] = await Promise.all([
    User.findById(patientUserId).select("name phone"),
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
  const typeText = appointment.type === "home" ? "زيارة منزلية" : "عيادة";

  // params order matches {{1}} {{2}} {{3}} {{4}} in the template
  return {
    patientPhone: patient.phone,
    patientName,
    params: [specialistName, dateStr, timeStr, typeText],
  };
}

export async function sendCancellationNotification(
  appointment: IAppointment & { _id: Types.ObjectId },
  patientUserId: string,
  specialistId: Types.ObjectId
): Promise<void> {
  const data = await buildTemplateData(appointment, patientUserId, specialistId);
  if (!data) return;

  // cancellation params: [patientName, specialistName, dateStr, timeStr, typeText]
  const params = [data.patientName, ...data.params];

  await sendWhatsAppMessage(data.patientPhone, "appointment_cancellation", params)
    .catch(err => console.error("[WhatsApp] Cancellation send failed:", err));
}

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
  const data = await buildTemplateData(appointment, patientUserId, specialistId);
  if (!data) {
    console.log(`[Reminder] Could not build message - patient phone not found for userId: ${patientUserId}`);
    return;
  }

  const { params } = data;
  const appointmentDate = new Date(appointment.date);
  const now = new Date();

  // Confirmation: send immediately
  await Reminder.create({
    appointmentId: appointment._id,
    channel: "WHATSAPP",
    sendAt: now,
    status: "PENDING",
    templateName: "appointment_confirmation",
    templateParams: params,
  });
  console.log(`[Reminder] Confirmation reminder created for appointment ${appointment._id}`);

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
