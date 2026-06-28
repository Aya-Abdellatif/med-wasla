import mongoose, { Document, Schema, Types } from "mongoose";

export const verificationStatuses = [
  "pending",
  "approved",
  "rejected",
] as const;
export type VerificationStatus = (typeof verificationStatuses)[number];

export const specialistTypes = ["doctor", "nurse"] as const;
export type SpecialistType = (typeof specialistTypes)[number];

export const nurseExpertiseAreas = [
  "Home Care",
  "Pediatric",
  "Geriatric",
  "Wound Care",
  "IV Therapy",
  "Post-Op Care",
] as const;
export type NurseExpertiseArea = (typeof nurseExpertiseAreas)[number];

export interface ICertification {
  _id?: Types.ObjectId;
  title: string;
  issuedBy: string;
  issuedAt?: Date;
  certificateUrl: string;
  status?: VerificationStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAvailableSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IPendingProfileUpdates {
  bio?: string;
  clinicAddress?: string;
  specialization?: string;
  areasOfExpertise?: string[];
  avgWaitMinutes?: number;
  serviceAreas?: string[];
  homeVisit?: boolean;
}

export interface IMedicalSpecialist extends Document {
  userId: Types.ObjectId;
  specialistType: SpecialistType;
  specialization?: string;
  clinicAddress?: string;
  certifications?: ICertification[];
  avgWaitMinutes?: number;
  serviceAreas?: string[];
  areasOfExpertise?: string[];
  homeVisit: boolean;
  licenseNumber: string;
  bio?: string;
  consultationFee?: number;
  availableSlots?: IAvailableSlot[];
  rating?: number;
  reviewCount?: number;
  verificationStatus?: VerificationStatus;
  pendingProfileUpdates?: IPendingProfileUpdates;
  revertToApprovedOnReject?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const certificationSchema = new Schema<ICertification>(
  {
    title: { type: String, required: true },
    issuedBy: { type: String, required: true },
    issuedAt: { type: Date },
    certificateUrl: { type: String, required: true },
    status: {
      type: String,
      enum: verificationStatuses,
      default: "pending",
    },
  },
  { _id: true, timestamps: true },
);

const availableSlotSchema = new Schema<IAvailableSlot>(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

const pendingProfileUpdatesSchema = new Schema<IPendingProfileUpdates>(
  {
    bio: { type: String },
    clinicAddress: { type: String },
    specialization: { type: String },
    areasOfExpertise: { type: [String] },
    avgWaitMinutes: { type: Number },
    serviceAreas: { type: [String] },
    homeVisit: { type: Boolean },
  },
  { _id: false },
);

const medicalSpecialistSchema = new Schema<IMedicalSpecialist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    specialistType: {
      type: String,
      enum: specialistTypes,
      required: true,
    },

    specialization: {
      type: String,
      enum: [
        "Cardiology",
        "Orthopedics",
        "Dermatology",
        "Pediatrics",
        "Neurology",
        "Psychiatry",
        "Gynecology",
        "ENT",
        "Ophthalmology",
        "General Practice",
        "Urology",
        "Oncology",
      ],
    },

    clinicAddress: { type: String },

    certifications: {
      type: [certificationSchema],
      default: undefined,
    },

    avgWaitMinutes: { type: Number },

    serviceAreas: { type: [String], default: undefined },

    areasOfExpertise: {
      type: [String],
      enum: nurseExpertiseAreas,
      default: undefined,
    },
    homeVisit: { type: Boolean, required: true },

    licenseNumber: { type: String, required: true, unique: true },

    bio: { type: String },
    consultationFee: { type: Number },
    availableSlots: [availableSlotSchema],

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    verificationStatus: {
      type: String,
      enum: verificationStatuses,
      default: "pending",
    },

    pendingProfileUpdates: {
      type: pendingProfileUpdatesSchema,
      default: undefined,
    },

    revertToApprovedOnReject: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

medicalSpecialistSchema.index({ specialistType: 1 });
medicalSpecialistSchema.index({ specialization: 1 });
medicalSpecialistSchema.index({ verificationStatus: 1 });
medicalSpecialistSchema.index({ serviceAreas: 1 });
medicalSpecialistSchema.index({ areasOfExpertise: 1 });

medicalSpecialistSchema.pre("validate", function (this: IMedicalSpecialist) {
  const isDoctor = this.specialistType === "doctor";
  const isNurse = this.specialistType === "nurse";

  if (isNurse) this.homeVisit = true;

  if (isDoctor && !this.specialization) {
    throw new Error("specialization is required for doctors");
  }

  if (isNurse && (!this.serviceAreas || this.serviceAreas.length === 0)) {
    throw new Error("serviceAreas are required for nurses");
  }
});

medicalSpecialistSchema.virtual("isVerified").get(function (
  this: IMedicalSpecialist,
) {
  return this.verificationStatus === "approved";
});

const MedicalSpecialist = mongoose.model<IMedicalSpecialist>(
  "MedicalSpecialist",
  medicalSpecialistSchema,
);
export default MedicalSpecialist;
