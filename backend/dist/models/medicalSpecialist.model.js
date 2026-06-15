import mongoose, { Document, Schema, Types } from "mongoose";
export const verificationStatuses = ["pending", "approved", "rejected"];
export const specialistTypes = ["doctor", "nurse"];
const certificationSchema = new Schema({
    title: { type: String, required: true },
    issuedBy: { type: String, required: true },
    issuedAt: { type: Date },
    certificateUrl: { type: String, required: true },
    status: {
        type: String,
        enum: verificationStatuses,
        default: "pending",
    },
}, { _id: true, timestamps: true });
const availableSlotSchema = new Schema({
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
}, { _id: false });
const medicalSpecialistSchema = new Schema({
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
    areasOfExpertise: { type: [String], default: undefined },
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
}, { timestamps: true });
medicalSpecialistSchema.index({ specialistType: 1 });
medicalSpecialistSchema.index({ specialization: 1 });
medicalSpecialistSchema.index({ verificationStatus: 1 });
medicalSpecialistSchema.index({ serviceAreas: 1 });
medicalSpecialistSchema.pre("validate", function () {
    const isDoctor = this.specialistType === "doctor";
    const isNurse = this.specialistType === "nurse";
    if (isNurse)
        this.homeVisit = true;
    if (isDoctor && !this.specialization) {
        throw new Error("specialization is required for doctors");
    }
    if (isNurse && (!this.serviceAreas || this.serviceAreas.length === 0)) {
        throw new Error("serviceAreas are required for nurses");
    }
});
medicalSpecialistSchema.virtual("isVerified").get(function () {
    return this.verificationStatus === "approved";
});
const MedicalSpecialist = mongoose.model("MedicalSpecialist", medicalSpecialistSchema);
export default MedicalSpecialist;
//# sourceMappingURL=medicalSpecialist.model.js.map