import mongoose, { Document, Schema, Types } from "mongoose";
const appointmentTypes = ["clinic", "home"];
const appointmentStatuses = ["pending", "confirmed", "completed", "cancelled"];
const appointmentSchema = new Schema({
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
        required: function () {
            return this.type === "home";
        },
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
//# sourceMappingURL=appointment.model.js.map