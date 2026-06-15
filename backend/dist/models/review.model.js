import mongoose, { Document, Schema, Types } from "mongoose";
const reviewSchema = new Schema({
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
    appointmentId: {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
        unique: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
// Index for faster specialist review queries
reviewSchema.index({ specialistId: 1 });
const Review = mongoose.model("Review", reviewSchema);
export default Review;
//# sourceMappingURL=review.model.js.map