import mongoose, { Document, Schema } from "mongoose";
const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
    used: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
//# sourceMappingURL=otp.model.js.map