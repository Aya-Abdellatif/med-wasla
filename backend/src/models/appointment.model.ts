import mongoose, { Document, Schema, Types } from "mongoose";
import type { PopulatedDoc } from "mongoose";
import type { IUser } from "./user.model.js";
import type { IMedicalSpecialist } from "./medicalSpecialist.model.js";
import type { IReminder } from "./reminder.model.js";

const appointmentTypes = ["clinic", "home"] as const;
export type AppointmentType = (typeof appointmentTypes)[number];

const appointmentStatuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "overdue",
  "no_show",
] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

export interface IAppointment extends Document {
  patientId: PopulatedDoc<IUser & Document, Types.ObjectId>;
  specialistId: PopulatedDoc<IMedicalSpecialist & Document, Types.ObjectId>;
  date: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  address?: string;
  notes?: string;
  reminders?: Types.ObjectId[] | IReminder[];
  createdAt?: Date;
  updatedAt?: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    specialistId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalSpecialist",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: appointmentTypes,
      required: true,
    },

    status: {
      type: String,
      enum: appointmentStatuses,
      default: "pending",
      required: true,
    },

    address: {
      type: String,
      required: function (this: IAppointment) {
        return this.type === "home";
      },
    },

    notes: {
      type: String,
      trim: true,
    },
    reminders: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Reminder",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;
