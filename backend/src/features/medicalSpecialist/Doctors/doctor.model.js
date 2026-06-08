import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  issuedBy:       { type: String, required: true },
  issuedAt:       { type: Date },
  certificateUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { _id: true, timestamps: true });


const availableSlotSchema = new mongoose.Schema({
  day:       { type: String, required: true },
  startTime: { type: String, required: true },
  endTime:   { type: String, required: true },
}, { _id: false });


const medicalSpecialistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    specialistType: {
      type: String,
      enum: ["doctor", "nurse", "both"],
      required: true,
    },

    // ── Doctor / Both only ──────────────────────────────────────────────────
    specialization: {
      type: String,
      enum: [
        "Cardiology", "Orthopedics", "Dermatology", "Pediatrics",
        "Neurology", "Psychiatry", "Gynecology", "ENT",
        "Ophthalmology", "General Practice", "Urology", "Oncology",
      ],
    },

    clinicAddress: { type: String },

    certifications: {
      type: [certificationSchema],
      default: undefined,
    },

    avgWaitMinutes: { type: Number },

    // ── Nurse / Both only ───────────────────────────────────────────────────
    serviceAreas:    { type: [String], default: undefined },
    expertiseFields: { type: [String], default: undefined },

    // ── Shared ──────────────────────────────────────────────────────────────
    homeVisit: { type: Boolean, required: true },

    licenseNumber: { type: String, required: true, unique: true },
    // certificateUrl: { type: String, required: true },

    bio:             { type: String },
    consultationFee: { type: Number },
    availableSlots:  [availableSlotSchema],

    rating:      { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
medicalSpecialistSchema.index({ specialistType: 1 });
medicalSpecialistSchema.index({ specialization: 1 });
medicalSpecialistSchema.index({ verificationStatus: 1 });
medicalSpecialistSchema.index({ serviceAreas: 1 });

// ── Scenario guard ────────────────────────────────────────────────────────────
medicalSpecialistSchema.pre("validate", function (next) {
  const isDoctor = this.specialistType === "doctor";
  const isNurse  = this.specialistType === "nurse";
  const isBoth   = this.specialistType === "both";

  // homeVisit rules
  if (isDoctor) this.homeVisit = false;
  if (isNurse || isBoth) this.homeVisit = true;

  // doctor / both → specialization required
  if ((isDoctor || isBoth) && !this.specialization) {
    return next(new Error("specialization is required for doctors"));
  }

  // nurse / both → serviceAreas required
  if ((isNurse || isBoth) && (!this.serviceAreas || this.serviceAreas.length === 0)) {
    return next(new Error("serviceAreas are required for nurses"));
  }

  next();
});

medicalSpecialistSchema.virtual("isVerified").get(function () {
  return this.verificationStatus === "approved";
});

const MedicalSpecialist = mongoose.model("MedicalSpecialist", medicalSpecialistSchema);
export default MedicalSpecialist;