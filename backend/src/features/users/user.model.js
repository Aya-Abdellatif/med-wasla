import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },

        address: {
            type: String,
            enum: [
                "Alexandria",
                "Cairo",
                "Giza"
            ],
            required: [true, "Governorate is required"],
        },

        role: {
            type: String,
            enum: ["patient", "specialist", "admin"],
            required: true,
        },

        photoUrl: {
            type: String,
            required: [true, "Profile photo is required"],
        },
    },
    {
        timestamps: true,
    }
);


developerSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;

    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);

export default User;