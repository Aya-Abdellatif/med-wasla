import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMedicalHistoryEntry {
  condition: string;
  diagnosed: Date;
  treatedBy: Types.ObjectId; 
  notes?: string;           
}

const medicalHistoryEntrySchema = new Schema<IMedicalHistoryEntry>(
  {
    condition: {
      type: String,
      required: true,
      trim: true,
    },
    diagnosed: {
      type: Date,
      required: true,
    },
    treatedBy: {
      type: Schema.Types.ObjectId,
      ref: "MedicalSpecialist",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

export interface IPatient extends Document {
  userId: Types.ObjectId;
  medicalHistory?: IMedicalHistoryEntry[];
  createdAt?: Date;
  updatedAt?: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    medicalHistory: {
      type: [medicalHistoryEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Patient = mongoose.model<IPatient>("Patient", patientSchema);
export default Patient;