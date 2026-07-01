import { Types } from "mongoose";
import type { HydratedDocument } from "mongoose";
import Appointment from "../../models/appointment.model.js";
import MedicalSpecialist from "../../models/medicalSpecialist.model.js";
import type { AppointmentStatus, AppointmentType } from "../../models/appointment.model.js";
import type { IUser } from "../../models/user.model.js";
import type { IMedicalSpecialist } from "../../models/medicalSpecialist.model.js";
import { scheduleAppointmentReminders, cancelAppointmentReminders } from "./reminder.service.js";
import { sendCancellationNotification } from "./notification.service.js";
import { syncQueueForSpecialistAndDate } from "../queue/queue.service.js";

export function parseLocalAppointment(dateStr: string, timeStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/** Mark past home visits that were never completed as overdue. */
export async function expireOverdueAppointments(filter?: {
  patientId?: string;
  specialistId?: string;
}) {
  const query: Record<string, unknown> = {
    type: "home",
    status: "pending",
    date: { $lt: new Date(Date.now() - 30 * 60 * 1000) },
  };

  if (filter?.patientId) {
    query.patientId = Types.ObjectId.isValid(filter.patientId)
      ? new Types.ObjectId(filter.patientId)
      : filter.patientId;
  }
  if (filter?.specialistId) {
    query.specialistId = Types.ObjectId.isValid(filter.specialistId)
      ? new Types.ObjectId(filter.specialistId)
      : filter.specialistId;
  }

  await Appointment.updateMany(query, { $set: { status: "overdue" } });
}

export function isAppointmentPast(date: Date) {
  return date.getTime() < Date.now();
}

export const createAppointmentService = async (data: {
  patientId: string;
  specialistId: string;
  date: Date;
  dateStr: string;
  timeStr: string;
  type: AppointmentType;
  address?: string;
  notes?: string;
}) => {
  const specialist = await MedicalSpecialist.findById(data.specialistId);
  if (!specialist) 
    throw new Error("SPECIALIST_NOT_FOUND");

  if (specialist.verificationStatus !== "approved") 
    throw new Error("SPECIALIST_NOT_APPROVED");

  if (data.type === "home" && !data.address?.trim()) 
    throw new Error("ADDRESS_REQUIRED");

  if (data.type === "clinic" && specialist.specialistType === "nurse")
    throw new Error("INVALID_TYPE_FOR_NURSE");
  
  if (data.type === "home" && !specialist.homeVisit)
    throw new Error("SPECIALIST_NO_HOME_VISIT");

  if (data.date <= new Date()) 
    throw new Error("DATE_IN_PAST");

  if (data.type === "clinic") {
    const dayName = data.date.toLocaleDateString("en-US", { weekday: "long" });
    const worksOnDay = specialist.availableSlots?.some((slot) => slot.day === dayName);
    if (!worksOnDay)
      throw new Error("DAY_NOT_AVAILABLE");

    const { availableSlots } = await getAvailableSlotsService(
      data.specialistId,
      data.dateStr,
    );

    if (!availableSlots.includes(data.timeStr)) {
      throw new Error("SLOT_NOT_AVAILABLE");
    }
  }

  const [year, month, day] = data.dateStr.split("-").map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

  const existingSameDay = await Appointment.findOne({
    patientId: data.patientId,
    specialistId: data.specialistId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ["cancelled"] },
  });

  if (existingSameDay) {
    throw new Error("ALREADY_BOOKED_SAME_DAY");
  }

  let appointment;
  try {
    appointment = await Appointment.create({
      patientId: data.patientId,
      specialistId: data.specialistId,
      date: data.date,
      type: data.type,
      address: data.address,
      notes: data.notes,
      status: data.type === "clinic" ? "confirmed" : "pending",
    });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) throw new Error("SLOT_NOT_AVAILABLE", { cause: err });
    throw err;
  }

  if (appointment.type === "clinic") {
    await syncQueueForSpecialistAndDate(appointment.specialistId.toString(), appointment.date)
      .catch(err => console.error("[Queue Sync] Failed to sync on creation:", err));
  }

  // For clinic appointments: send confirmation immediately on booking
  // For home visits: wait until specialist approves (handled in updateAppointmentStatusService)
  if (data.type !== "home") {
    scheduleAppointmentReminders(appointment, data.patientId, specialist._id as Types.ObjectId)
      .catch(err => console.error("[Reminder] Failed to schedule:", err));
  }

  return appointment;
};


export const getPatientAppointmentsService = async (patientId: string) => {
  await expireOverdueAppointments({ patientId });

  return Appointment.find({ patientId })
    .populate({
      path: "specialistId",
      populate: { path: "userId", select: "name photoUrl phone" },
    })
    .sort({ date: -1 });
};


export const getSpecialistAppointmentsService = async (userId: string) => {
  // The logged-in specialist's req.user.id is a User._id, not a MedicalSpecialist._id
  const specialist = await MedicalSpecialist.findOne({ userId });
  if (!specialist) throw new Error("SPECIALIST_PROFILE_NOT_FOUND");

  await expireOverdueAppointments({ specialistId: specialist._id.toString() });

  return Appointment.find({ specialistId: specialist._id })
    .populate("patientId", "name photoUrl phone")
    .sort({ date: -1 });
};


export const getAppointmentByIdService = async (
  appointmentId: string,
  requesterId: string,
  requesterRole: "patient" | "specialist" | "admin"
) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate({
      path: "specialistId",
      populate: { path: "userId", select: "name photoUrl phone" },
    })
    .populate("patientId", "name photoUrl phone");

  if (!appointment) return null;

  if (requesterRole === "patient") {
    const patientId = appointment.patientId;
    const patientUserId = patientId instanceof Types.ObjectId
      ? patientId.toString()
      : (patientId as HydratedDocument<IUser>)._id.toString();
    if (patientUserId !== requesterId)
      throw new Error("FORBIDDEN");
  }

  if (requesterRole === "specialist") {
    const specialist = await MedicalSpecialist.findOne({ userId: requesterId });
    const specId = appointment.specialistId;
    const specialistDocId = specId instanceof Types.ObjectId
      ? specId.toString()
      : (specId as HydratedDocument<IMedicalSpecialist>)._id.toString();
    if (!specialist || specialistDocId !== specialist._id.toString()) {
      throw new Error("FORBIDDEN");
    }
  }

  return appointment;
};


export const updateAppointmentStatusService = async (
  appointmentId: string,
  specialistUserId: string,
  newStatus: AppointmentStatus
) => {
  const specialist = await MedicalSpecialist.findOne({ userId: specialistUserId });
  if (!specialist) throw new Error("SPECIALIST_PROFILE_NOT_FOUND");

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return null;

  if (appointment.specialistId.toString() !== specialist._id.toString()) {
    throw new Error("FORBIDDEN");
  }

  if (appointment.status === "overdue") {
    throw new Error("APPOINTMENT_OVERDUE");
  }

  if (appointment.type === "home") {
    if (appointment.status === "pending" && isAppointmentPast(appointment.date)) {
      appointment.status = "overdue";
      await appointment.save();
      throw new Error("APPOINTMENT_OVERDUE");
    }

    const homeTransitions: Record<string, AppointmentStatus[]> = {
      pending: ["confirmed"],
      confirmed: ["completed", "no_show"],
    };

    if (!homeTransitions[appointment.status]?.includes(newStatus)) {
      throw new Error("INVALID_TRANSITION");
    }
  } else {
    const clinicTransitions: Record<string, AppointmentStatus[]> = {
      confirmed: ["completed", "no_show"],
    };

    if (!clinicTransitions[appointment.status]?.includes(newStatus)) {
      throw new Error("INVALID_TRANSITION");
    }
  }

  if (newStatus === "confirmed" && appointment.type === "home") {
    const conflict = await Appointment.findOne({
      specialistId: appointment.specialistId,
      date: appointment.date,
      _id: { $ne: appointment._id },
      status: "confirmed",
    });
    if (conflict) throw new Error("TIME_CONFLICT");
  }

  appointment.status = newStatus;
  try {
    await appointment.save();
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) throw new Error("TIME_CONFLICT", { cause: err });
    throw err;
  }

  if (appointment.type === "clinic") {
    await syncQueueForSpecialistAndDate(appointment.specialistId.toString(), appointment.date)
      .catch(err => console.error("[Queue Sync] Failed to sync on status update:", err));
  }

  // For home visits: send confirmation when specialist approves
  if (newStatus === "confirmed" && appointment.type === "home") {
    scheduleAppointmentReminders(
      appointment,
      appointment.patientId.toString(),
      appointment.specialistId as Types.ObjectId
    ).catch(err => console.error("[Reminder] Failed to schedule:", err));
  }

  return appointment;
};


export const cancelAppointmentService = async (
  appointmentId: string,
  requesterId: string,
  requesterRole: "patient" | "specialist"
) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return null;

  if (
    appointment.status === "completed" ||
    appointment.status === "cancelled" ||
    appointment.status === "no_show" ||
    appointment.status === "overdue"
  ) {
    throw new Error("CANNOT_CANCEL");
  }

  if (appointment.type === "home" && isAppointmentPast(appointment.date)) {
    if (appointment.status === "pending") {
      appointment.status = "overdue";
      await appointment.save();
    }
    throw new Error("APPOINTMENT_OVERDUE");
  }

  const now = new Date();
  const appointmentDate = new Date(appointment.date);
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (requesterRole === "patient") {
    if (appointment.patientId.toString() !== requesterId) throw new Error("FORBIDDEN");

    if (appointment.type === "clinic" && hoursUntilAppointment < 6) {
      throw new Error("TOO_LATE_TO_CANCEL");
    }
    if (appointment.type === "home" && hoursUntilAppointment < 24) {
      throw new Error("TOO_LATE_TO_CANCEL");
    }
  } else {
    // Specialist: find their MedicalSpecialist doc and verify ownership
    const specialist = await MedicalSpecialist.findOne({ userId: requesterId });
    if (!specialist) throw new Error("SPECIALIST_PROFILE_NOT_FOUND");
    if (appointment.specialistId.toString() !== specialist._id.toString()) {
      throw new Error("FORBIDDEN");
    }

    if (appointment.type === "home" && hoursUntilAppointment < 24) {
      throw new Error("TOO_LATE_TO_CANCEL");
    }
  }

  appointment.status = "cancelled";
  await appointment.save();

  if (appointment.type === "clinic") {
    await syncQueueForSpecialistAndDate(appointment.specialistId.toString(), appointment.date)
      .catch(err => console.error("[Queue Sync] Failed to sync on cancellation:", err));
  }

  cancelAppointmentReminders(appointment._id.toString())
    .catch(err => console.error("[Reminder] Failed to cancel reminders:", err));

  sendCancellationNotification(
    appointment,
    appointment.patientId.toString(),
    appointment.specialistId as Types.ObjectId
  ).catch((err: unknown) => console.error("[WhatsApp] Failed to send cancellation:", err));

  return appointment;
};


export const cancelDayAppointmentsService = async (
  specialistUserId: string,
  dateStr: string
) => {
  const specialist = await MedicalSpecialist.findOne({ userId: specialistUserId });
  if (!specialist) throw new Error("SPECIALIST_PROFILE_NOT_FOUND");

  const dateParts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateParts) throw new Error("INVALID_DATE");
  const startOfDay = new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]), 0, 0, 0, 0);
  const endOfDay = new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]), 23, 59, 59, 999);
  if (isNaN(startOfDay.getTime())) throw new Error("INVALID_DATE");

  const appointments = await Appointment.find({
    specialistId: specialist._id,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ["cancelled", "completed", "overdue"] },
  });

  for (const appointment of appointments) {
    appointment.status = "cancelled";
    await appointment.save();

    cancelAppointmentReminders(appointment._id.toString())
      .catch(err => console.error("[Reminder] Failed to cancel reminders:", err));

    sendCancellationNotification(
      appointment,
      appointment.patientId.toString(),
      appointment.specialistId as Types.ObjectId
    ).catch((err: unknown) => console.error("[WhatsApp] Failed to send cancellation:", err));
  }

  await syncQueueForSpecialistAndDate(specialist._id.toString(), startOfDay)
    .catch(err => console.error("[Queue Sync] Failed to sync on cancel day:", err));

  return appointments.length;
};

export const rescheduleAppointmentService = async (
  appointmentId: string,
  patientId: string,
  newDate: Date,
  dateStr: string,
  timeStr: string,
  notes?: string
) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return null;

  if (appointment.patientId.toString() !== patientId) throw new Error("FORBIDDEN");

  if (
    appointment.status === "completed" ||
    appointment.status === "cancelled" ||
    appointment.status === "no_show" ||
    appointment.status === "overdue"
  ) {
    throw new Error("CANNOT_RESCHEDULE");
  }

  if (appointment.type === "home" && isAppointmentPast(appointment.date)) {
    if (appointment.status === "pending") {
      appointment.status = "overdue";
      await appointment.save();
    }
    throw new Error("APPOINTMENT_OVERDUE");
  }

  if (newDate <= new Date()) throw new Error("DATE_IN_PAST");

  const specialistId = appointment.specialistId.toString();
  const specialist = await MedicalSpecialist.findById(specialistId);
  if (!specialist) throw new Error("SPECIALIST_NOT_FOUND");

  if (appointment.type === "clinic") {
    const dayName = newDate.toLocaleDateString("en-US", { weekday: "long" });
    if (!specialist.availableSlots?.some((s) => s.day === dayName)) {
      throw new Error("DAY_NOT_AVAILABLE");
    }

    const { availableSlots } = await getAvailableSlotsService(specialistId, dateStr);
    if (!availableSlots.includes(timeStr)) {
      throw new Error("SLOT_NOT_AVAILABLE");
    }
  }

  // Prevent rescheduling to a day where the patient already has another appointment with the same specialist
  const [year, month, day] = dateStr.split("-").map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
  const conflictingAppointment = await Appointment.findOne({
    patientId,
    specialistId,
    _id: { $ne: appointmentId },
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ["cancelled", "overdue"] },
  });
  if (conflictingAppointment) {
    throw new Error("ALREADY_BOOKED_SAME_DAY");
  }

  const oldDate = appointment.date;
  appointment.date = newDate;
  // clinic stays confirmed (auto-approved); home goes back to pending for re-approval
  appointment.status = appointment.type === "clinic" ? "confirmed" : "pending";
  if (notes !== undefined) appointment.notes = notes;

  await cancelAppointmentReminders(appointment._id.toString());
  try {
    await appointment.save();
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) throw new Error("SLOT_NOT_AVAILABLE", { cause: err });
    throw err;
  }

  if (appointment.type === "clinic") {
    // Sync old queue
    await syncQueueForSpecialistAndDate(appointment.specialistId.toString(), oldDate).catch(err =>
      console.error("[Queue Sync] Failed to sync old date on reschedule:", err)
    );
    // Sync new queue
    await syncQueueForSpecialistAndDate(appointment.specialistId.toString(), appointment.date).catch(err =>
      console.error("[Queue Sync] Failed to sync new date on reschedule:", err)
    );
  }

  if (appointment.type === "clinic") {
    scheduleAppointmentReminders(
      appointment,
      appointment.patientId.toString(),
      appointment.specialistId as Types.ObjectId
    ).catch(err => console.error("[Reminder] Failed to schedule reminders after reschedule:", err));
  }

  return appointment;
};


export const getAvailableSlotsService = async (
  specialistId: string,
  dateStr: string,
): Promise<{
  workingHours: { start: string; end: string } | null;
  availableSlots: string[];
}> => {
  const specialist = await MedicalSpecialist.findById(specialistId);
  if (!specialist) 
    throw new Error("SPECIALIST_NOT_FOUND");

  if (specialist.verificationStatus !== "approved") 
    throw new Error("SPECIALIST_NOT_APPROVED");

  const dateParts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateParts) throw new Error("INVALID_DATE");
  const date = new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]), 12, 0, 0, 0);
  if (isNaN(date.getTime()))
    throw new Error("INVALID_DATE");

  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

  const slot = specialist.availableSlots?.find((s) => s.day === dayName);
  if (!slot) {
    return { availableSlots: [], workingHours: null };
  }

  // Find all existing non-cancelled appointments on this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const booked = await Appointment.find({
    specialistId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ["cancelled", "overdue"] },
  }).select("date");

  // Build 30-minute slots between startTime and endTime
  const [startH, startM] = slot.startTime.split(":").map(Number);
  const [endH, endM] = slot.endTime.split(":").map(Number);

  const bookedTimes = new Set(
    booked.map((a) => {
      const d = new Date(a.date);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    })
  );

  const availableSlots: string[] = [];
  let h = startH;
  let m = startM;

  while (h * 60 + m < endH * 60 + endM) {
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    if (!bookedTimes.has(timeStr)) {
      availableSlots.push(timeStr);
    }
    m += 30;
    if (m >= 60) { h += 1; m -= 60; }
  }

  // If date is today, remove slots that have already passed
  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local
  if (dateStr === todayStr) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return {
      workingHours: { start: slot.startTime, end: slot.endTime },
      availableSlots: availableSlots.filter(s => {
        const [sh, sm] = s.split(":").map(Number);
        return sh * 60 + sm > nowMinutes;
      }),
    };
  }

  return {
    workingHours: { start: slot.startTime, end: slot.endTime },
    availableSlots,
  };
};
