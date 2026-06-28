import mongoose, { Document, Schema, Types } from "mongoose";

const reminderChannels = ["WHATSAPP"] as const;
export type ReminderChannel = (typeof reminderChannels)[number];

const reminderStatuses = ["PENDING", "SENT", "DELIVERED", "FAILED", "CANCELLED"] as const;
export type ReminderStatus = (typeof reminderStatuses)[number];

export interface IReminder extends Document {
  appointmentId: Types.ObjectId;
  channel: ReminderChannel;
  sendAt: Date;
  sentAt?: Date | null;
  status: ReminderStatus;
  attempts: number;
  maxAttempts: number;
  providerMessageId?: string | null;
  message?: string;
  templateName?: string;
  templateParams?: string[];
  patientEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },

    channel: {
      type: String,
      enum: reminderChannels as unknown as string[],
      default: "WHATSAPP",
      required: true,
    },

    sendAt: {
      type: Date,
      required: true,
      index: true,
    },

    sentAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: reminderStatuses as unknown as string[],
      default: "PENDING",
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    maxAttempts: {
      type: Number,
      default: 3,
    },

    providerMessageId: {
      type: String,
    },

    message: {
      type: String,
    },

    templateName: {
      type: String,
    },

    templateParams: {
      type: [String],
    },

    patientEmail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({ sendAt: 1, status: 1 });

const Reminder = mongoose.model<IReminder>("Reminder", reminderSchema);

export default Reminder;