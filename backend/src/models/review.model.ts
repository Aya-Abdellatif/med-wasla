import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  patientId: Types.ObjectId;
  specialistId: Types.ObjectId;
  appointmentId: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
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
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ specialistId: 1 });

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
