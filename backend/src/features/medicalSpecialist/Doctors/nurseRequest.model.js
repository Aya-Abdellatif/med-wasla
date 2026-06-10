// src/features/doctors/nurseRequest.model.js
import mongoose from "mongoose";

const nurseRequestSchema = new mongoose.Schema(
  {
    nurseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalSpecialist",
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    serviceType: {
      type: String,
      required: true, // e.g. "Wound Care", "IV Therapy" — from nurse's expertiseFields
    },

    address: {
      type: String,
      required: true, // patient's home address
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    notes: {
      type: String, // extra patient notes
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      default: "pending",
    },

    rejectionReason: {
      type: String, // nurse fills this if rejected
    },

    // notification tracking
    patientNotified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
nurseRequestSchema.index({ nurseId: 1, status: 1 });
nurseRequestSchema.index({ patientId: 1 });
nurseRequestSchema.index({ scheduledAt: 1 });

const NurseRequest = mongoose.model("NurseRequest", nurseRequestSchema);
export default NurseRequest;