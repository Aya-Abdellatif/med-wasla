import type { Request, Response, NextFunction } from "express";
import AppError from "../../utils/AppError.js";
import {
  createAppointmentService,
  getPatientAppointmentsService,
  getSpecialistAppointmentsService,
  getAppointmentByIdService,
  updateAppointmentStatusService,
  cancelAppointmentService,
  cancelDayAppointmentsService,
  rescheduleAppointmentService,
  getAvailableSlotsService,
  parseLocalAppointment,
} from "./appointments.service.js";
import type { AppointmentStatus } from "../../models/appointment.model.js";


export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.user!.id;
    const { specialistId, date, time, type, address, notes } = req.body;

    if (!specialistId || !date || !time || !type) {
      return next(
        new AppError("specialistId, date, time, and type are required", 400),
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return next(new AppError("date must be in YYYY-MM-DD format", 400));
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      return next(new AppError("time must be in HH:mm format", 400));
    }

    if (!["clinic", "home"].includes(type)) {
      return next(new AppError("type must be 'clinic' or 'home'", 400));
    }

    const appointmentDate = parseLocalAppointment(date, time);

    const appointment = await createAppointmentService({
      patientId,
      specialistId,
      date: appointmentDate,
      dateStr: date,
      timeStr: time,
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
    if (msg === "SPECIALIST_NOT_FOUND") 
      return next(new AppError("Specialist not found", 404));
    if (msg === "SPECIALIST_NOT_APPROVED") 
      return next(new AppError("Specialist is not approved yet", 400));
    if (msg === "ADDRESS_REQUIRED") 
      return next(new AppError("Address is required for home visits", 400));
    if (msg === "INVALID_TYPE_FOR_NURSE") 
      return next(new AppError("Nurses only offer home visits", 400));
    if (msg === "SPECIALIST_NO_HOME_VISIT") 
      return next(new AppError("This specialist does not offer home visits", 400));
    if (msg === "DATE_IN_PAST") 
      return next(new AppError("Appointment date must be in the future", 400));
    if (msg === "DAY_NOT_AVAILABLE")
      return next(new AppError("The doctor is not available on this day", 400));
    if (msg === "SLOT_NOT_AVAILABLE")
      return next(new AppError("This time slot is not available", 400));
    if (msg === "ALREADY_BOOKED_SAME_DAY")
      return next(
        new AppError("You already have an appointment with this doctor on this day", 409),
      );
    return next(error);
  }
};


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
    if (msg === "SPECIALIST_NOT_FOUND") 
      return next(new AppError("Specialist not found", 404));
    if (msg === "SPECIALIST_NOT_APPROVED") 
      return next(new AppError("Specialist is not approved yet", 400));
    if (msg === "INVALID_DATE") 
      return next(new AppError("Invalid date format. Use YYYY-MM-DD", 400));
    return next(error);
  }
};


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

    if (!["confirmed", "completed", "no_show"].includes(status)) {
      return next(
        new AppError("Specialists can only set status to 'confirmed', 'completed', or 'no_show'", 400),
      );
    }

    const appointment = await updateAppointmentStatusService(
      req.params.id as string,
      req.user!.id,
      status
    );

    if (!appointment) 
      return next(new AppError("Appointment not found", 404));

    res.status(200).json({
      success: true,
      message: `Appointment ${status}`,
      data: appointment,
    });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === "SPECIALIST_PROFILE_NOT_FOUND") 
      return next(new AppError("Specialist profile not found", 404));
    if (msg === "FORBIDDEN") 
      return next(new AppError("You don't have access to this appointment", 403));
    if (msg === "INVALID_TRANSITION") {
      return next(
        new AppError(
          "Invalid status transition. Home: pending→confirmed. Clinic: confirmed→completed or no_show.",
          400,
        ),
      );
    }
    if (msg === "APPOINTMENT_OVERDUE") {
      return next(new AppError("This appointment is overdue and can no longer be updated", 400));
    }
    if (msg === "APPOINTMENT_NOT_STARTED") {
      return next(
        new AppError(
          "You can only mark an appointment complete or no-show after the scheduled time has passed",
          400,
        ),
      );
    }
    return next(error);
  }
};


export const cancelAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = req.user!.role as "patient" | "specialist";
    const appointment = await cancelAppointmentService(req.params.id as string, req.user!.id, role);

    if (!appointment) return next(new AppError("Appointment not found", 404));

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === "FORBIDDEN") 
      return next(new AppError("You can only cancel your own appointments", 403));
    if (msg === "CANNOT_CANCEL") 
      return next(new AppError("Cannot cancel a completed or already cancelled appointment", 400));
    if (msg === "APPOINTMENT_OVERDUE") {
      return next(new AppError("This appointment is overdue and can no longer be cancelled", 400));
    }
    if (msg === "TOO_LATE_TO_CANCEL") {
      return next(new AppError("Cancellation window has passed for this appointment", 400));
    }
    if (msg === "SPECIALIST_PROFILE_NOT_FOUND")
      return next(new AppError("Specialist profile not found", 404));
    return next(error);
  }
};


export const cancelDayAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const date = req.params.date as string;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return next(new AppError("date must be in YYYY-MM-DD format", 400));
    }

    const cancelledCount = await cancelDayAppointmentsService(req.user!.id, date);

    res.status(200).json({
      success: true,
      message: `Cancelled ${cancelledCount} appointment(s) for ${date}`,
      data: { cancelledCount },
    });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === "SPECIALIST_PROFILE_NOT_FOUND")
      return next(new AppError("Specialist profile not found", 404));
    if (msg === "INVALID_DATE")
      return next(new AppError("date must be in YYYY-MM-DD format", 400));
    return next(error);
  }
};

export const rescheduleAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date, time, notes } = req.body;

    if (!date || !time) {
      return next(new AppError("New date and time are required", 400));
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return next(new AppError("date must be in YYYY-MM-DD format", 400));
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      return next(new AppError("time must be in HH:mm format", 400));
    }

    const newDate = parseLocalAppointment(date, time);

    const appointment = await rescheduleAppointmentService(
      req.params.id as string,
      req.user!.id,
      newDate,
      date,
      time,
      notes
    );

    if (!appointment) return next(new AppError("Appointment not found", 404));

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: appointment,
    });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === "FORBIDDEN") return next(new AppError("You can only reschedule your own appointments", 403));
    if (msg === "CANNOT_RESCHEDULE") return next(new AppError("Cannot reschedule a completed or cancelled appointment", 400));
    if (msg === "APPOINTMENT_OVERDUE") {
      return next(new AppError("This appointment is overdue and can no longer be rescheduled", 400));
    }
    if (msg === "DATE_IN_PAST") return next(new AppError("New date must be in the future", 400));
    if (msg === "DAY_NOT_AVAILABLE") return next(new AppError("The doctor is not available on this day", 400));
    if (msg === "SLOT_NOT_AVAILABLE") return next(new AppError("This time slot is not available", 400));
    if (msg === "SPECIALIST_NOT_FOUND") return next(new AppError("Specialist not found", 404));
    return next(error);
  }
};
