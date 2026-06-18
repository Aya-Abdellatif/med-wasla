import type { Request, Response, NextFunction } from "express";
import AppError from "../../utils/AppError.js";
import {
  createAppointmentService,
  getPatientAppointmentsService,
  getSpecialistAppointmentsService,
  getAppointmentByIdService,
  updateAppointmentStatusService,
  cancelAppointmentService,
  getAvailableSlotsService,
} from "./appointments.service.js";
import type { AppointmentStatus } from "../../models/appointment.model.js";

// ─── POST /api/appointments ────────────────────────────────────────────────

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.user!.id;
    const { specialistId, date, type, address, notes } = req.body;

    if (!specialistId || !date || !type) {
      return next(new AppError("specialistId, date, and type are required", 400));
    }

    if (!["clinic", "home"].includes(type)) {
      return next(new AppError("type must be 'clinic' or 'home'", 400));
    }

    const appointment = await createAppointmentService({
      patientId,
      specialistId,
      date: new Date(date),
      type,
      address,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === "SPECIALIST_NOT_FOUND") return next(new AppError("Specialist not found", 404));
    if (msg === "SPECIALIST_NOT_APPROVED") return next(new AppError("Specialist is not approved yet", 400));
    if (msg === "ADDRESS_REQUIRED") return next(new AppError("Address is required for home visits", 400));
    if (msg === "INVALID_TYPE_FOR_NURSE") return next(new AppError("Nurses only offer home visits", 400));
    if (msg === "SPECIALIST_NO_HOME_VISIT") return next(new AppError("This specialist does not offer home visits", 400));
    if (msg === "DATE_IN_PAST") return next(new AppError("Appointment date must be in the future", 400));
    return next(error);
  }
};

// ─── GET /api/appointments/my ──────────────────────────────────────────────

export const getMyAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointments = await getPatientAppointmentsService(req.user!.id);
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    return next(error);
  }
};

// ─── GET /api/appointments/specialist ─────────────────────────────────────

export const getSpecialistAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointments = await getSpecialistAppointmentsService(req.user!.id);
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    if ((error as Error).message === "SPECIALIST_PROFILE_NOT_FOUND") {
      return next(new AppError("Specialist profile not found", 404));
    }
    return next(error);
  }
};

// ─── GET /api/appointments/available-slots/:specialistId ──────────────────

export const getAvailableSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const specialistId = req.params.specialistId as string;
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return next(new AppError("Query parameter 'date' is required (YYYY-MM-DD)", 400));
    }

    const result = await getAvailableSlotsService(specialistId, date);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === "SPECIALIST_NOT_FOUND") return next(new AppError("Specialist not found", 404));
    if (msg === "SPECIALIST_NOT_APPROVED") return next(new AppError("Specialist is not approved yet", 400));
    if (msg === "INVALID_DATE") return next(new AppError("Invalid date format. Use YYYY-MM-DD", 400));
    return next(error);
  }
};

// ─── GET /api/appointments/:id ─────────────────────────────────────────────

export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointment = await getAppointmentByIdService(
      req.params.id as string,
      req.user!.id,
      req.user!.role
    );

    if (!appointment) return next(new AppError("Appointment not found", 404));

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    if ((error as Error).message === "FORBIDDEN") {
      return next(new AppError("You don't have access to this appointment", 403));
    }
    return next(error);
  }
};

// ─── PATCH /api/appointments/:id/status ───────────────────────────────────

export const updateAppointmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body as { status: AppointmentStatus };

    if (!status) {
      return next(new AppError("'status' is required in request body", 400));
    }

    if (!["confirmed", "completed"].includes(status)) {
      return next(new AppError("Specialists can only set status to 'confirmed' or 'completed'", 400));
    }

    const appointment = await updateAppointmentStatusService(
      req.params.id as string,
      req.user!.id,
      status
    );

    if (!appointment) return next(new AppError("Appointment not found", 404));

    res.status(200).json({
      success: true,
      message: `Appointment ${status}`,
      data: appointment,
    });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === "SPECIALIST_PROFILE_NOT_FOUND") return next(new AppError("Specialist profile not found", 404));
    if (msg === "FORBIDDEN") return next(new AppError("You don't have access to this appointment", 403));
    if (msg === "INVALID_TRANSITION") {
      return next(new AppError("Invalid status transition. pending→confirmed or confirmed→completed only", 400));
    }
    return next(error);
  }
};

// ─── DELETE /api/appointments/:id ─────────────────────────────────────────

export const cancelAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointment = await cancelAppointmentService(req.params.id as string, req.user!.id);

    if (!appointment) return next(new AppError("Appointment not found", 404));

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === "FORBIDDEN") return next(new AppError("You can only cancel your own appointments", 403));
    if (msg === "CANNOT_CANCEL") return next(new AppError("Cannot cancel a completed or already cancelled appointment", 400));
    return next(error);
  }
};
