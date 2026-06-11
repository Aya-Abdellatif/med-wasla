import mongoose, { Document, Schema, Types } from "mongoose";

const appointmentTypes = ["clinic", "home"] as const;
export type AppointmentType = (typeof appointmentTypes)[number];    

const appointmentStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  specialistId: Types.ObjectId;
  date: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  address?: string;
  notes?: string;
  reminders?: Types.ObjectId[];
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
    reminders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reminder",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;
