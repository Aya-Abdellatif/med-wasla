import Appointment from "../../models/appointment.model.js";
import MedicalSpecialist from "../../models/medicalSpecialist.model.js";
import type { AppointmentStatus, AppointmentType } from "../../models/appointment.model.js";

// ─── Create ────────────────────────────────────────────────────────────────

export const createAppointmentService = async (data: {
  patientId: string;
  specialistId: string;
  date: Date;
  type: AppointmentType;
  address?: string;
  notes?: string;
}) => {
  const specialist = await MedicalSpecialist.findById(data.specialistId);
  if (!specialist) throw new Error("SPECIALIST_NOT_FOUND");
  if (specialist.verificationStatus !== "approved") throw new Error("SPECIALIST_NOT_APPROVED");

  if (data.type === "home" && !data.address?.trim()) throw new Error("ADDRESS_REQUIRED");

  // Nurses only do home visits; doctors can do clinic (and home if homeVisit is true)
  if (data.type === "clinic" && specialist.specialistType === "nurse") {
    throw new Error("INVALID_TYPE_FOR_NURSE");
  }
  if (data.type === "home" && !specialist.homeVisit) {
    throw new Error("SPECIALIST_NO_HOME_VISIT");
  }

  if (data.date <= new Date()) throw new Error("DATE_IN_PAST");

  return Appointment.create({
    patientId: data.patientId,
    specialistId: data.specialistId,
    date: data.date,
    type: data.type,
    address: data.address,
    notes: data.notes,
    status: "pending",
  });
};

// ─── Get patient's appointments ────────────────────────────────────────────

export const getPatientAppointmentsService = async (patientId: string) => {
  return Appointment.find({ patientId })
    .populate({
      path: "specialistId",
      // specialistId → MedicalSpecialist → populate its userId → User (name, photo, phone)
      populate: { path: "userId", select: "name photoUrl phone" },
    })
    .sort({ date: -1 });
};

// ─── Get specialist's appointments ─────────────────────────────────────────

export const getSpecialistAppointmentsService = async (userId: string) => {
  // The logged-in specialist's req.user.id is a User._id, not a MedicalSpecialist._id
  const specialist = await MedicalSpecialist.findOne({ userId });
  if (!specialist) throw new Error("SPECIALIST_PROFILE_NOT_FOUND");

  return Appointment.find({ specialistId: specialist._id })
    .populate("patientId", "name photoUrl phone")
    .sort({ date: -1 });
};

// ─── Get single appointment ─────────────────────────────────────────────────

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
    // patientId is now a populated User object; compare _id
    const patientUserId = (appointment.patientId as any)._id?.toString() ?? appointment.patientId.toString();
    if (patientUserId !== requesterId) throw new Error("FORBIDDEN");
  }

  if (requesterRole === "specialist") {
    const specialist = await MedicalSpecialist.findOne({ userId: requesterId });
    const specialistDocId = (appointment.specialistId as any)._id?.toString() ?? appointment.specialistId.toString();
    if (!specialist || specialistDocId !== specialist._id.toString()) {
      throw new Error("FORBIDDEN");
    }
  }

  return appointment;
};

// ─── Update status (specialist only: pending→confirmed, confirmed→completed) ─

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

  // Allowed transitions: pending→confirmed, confirmed→completed
  const validTransitions: Record<string, AppointmentStatus[]> = {
    pending: ["confirmed"],
    confirmed: ["completed"],
  };

  if (!validTransitions[appointment.status]?.includes(newStatus)) {
    throw new Error("INVALID_TRANSITION");
  }

  appointment.status = newStatus;
  await appointment.save();
  return appointment;
};

// ─── Cancel / Delete (patient soft-cancels) ────────────────────────────────

export const cancelAppointmentService = async (
  appointmentId: string,
  patientId: string
) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return null;

  if (appointment.patientId.toString() !== patientId) throw new Error("FORBIDDEN");

  if (appointment.status === "completed" || appointment.status === "cancelled") {
    throw new Error("CANNOT_CANCEL");
  }

  appointment.status = "cancelled";
  await appointment.save();
  return appointment;
};

// ─── Available slots for a specialist on a given date ──────────────────────

export const getAvailableSlotsService = async (
  specialistId: string,
  dateStr: string
) => {
  const specialist = await MedicalSpecialist.findById(specialistId);
  if (!specialist) throw new Error("SPECIALIST_NOT_FOUND");
  if (specialist.verificationStatus !== "approved") throw new Error("SPECIALIST_NOT_APPROVED");

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error("INVALID_DATE");

  // Get the day name (e.g. "Monday") for the requested date
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

  const slot = specialist.availableSlots?.find((s) => s.day === dayName);
  if (!slot) {
    // Specialist doesn't work on this day
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
    status: { $ne: "cancelled" },
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

  return {
    workingHours: { start: slot.startTime, end: slot.endTime },
    availableSlots,
  };
};
