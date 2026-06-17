import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export const governorate = ["Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia", "Damietta", "Faiyum", "Gharbia", "Giza", "Ismailia", "Kafr El Sheikh", "Luxor", "Matruh", "Minya", "Monufia", "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea", "Sharqia", "Sohag", "South Sinai", "Suez"
];

export type Governorate = (typeof governorate)[number];

export type UserRole = "patient" | "specialist" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  governorate: Governorate;
  address: string;
  dob: Date;
  role: UserRole;
  photoUrl: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword?: (candidatePassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
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
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Invalid email format"
      ]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number"]
    },

    governorate: {
      type: String,
      enum: governorate,
      required: [true, "Governorate is required"],
    },

    address: {
      type: String,
      required: false
    },

    dob: {
      type: Date,
      required: true,
    },

    role: {
      type: String,
      enum: ["patient", "specialist", "admin"],
      required: true,
    },

    photoUrl: {
      type: String,
      required: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);

export default User;
