import mongoose, { Document, Schema, Types } from "mongoose";

export type QueueStatus = "waiting" | "in_progress" | "completed" | "cancelled";

export interface IQueueEntry {
  patientId: Types.ObjectId;
  appointmentId: Types.ObjectId;
  queueNumber: number;
  status: QueueStatus;
}

export interface IQueue extends Document {
  specialistId: Types.ObjectId;
  date: Date;
  entries: IQueueEntry[];
  currentNumber?: number;
  avgWaitMinutes?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const queueEntrySchema = new Schema<IQueueEntry>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    queueNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "in_progress", "completed", "cancelled"],
      default: "waiting",
    },
  },
  { _id: false }
);

const queueSchema = new Schema<IQueue>(
  {
    specialistId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalSpecialist",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    entries: {
      type: [queueEntrySchema],
      default: [],
    },
    currentNumber: {
      type: Number,
      default: 0,
    },
    avgWaitMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

queueSchema.index({ specialistId: 1, date: 1 }, { unique: true });

const Queue = mongoose.model<IQueue>("Queue", queueSchema);

export default Queue;
