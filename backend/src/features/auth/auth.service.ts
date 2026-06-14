import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { type IUser } from "../../models/user.model.js";
import Patient from "../../models/patient.model.js";
import MedicalSpecialist from "../../models/medicalSpecialist.model.js";
import OTP from "../../models/otp.model.js";
import AppError from "../../utils/AppError.js";
import generateOtp from "../../utils/generateOtp.js";
import sendEmail from "../../utils/sendEmail.js";
import type { RegisterData, AuthResult } from "../../interfaces/auth.interface.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// generate JWT token for authenticated user {id, role}
const signToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret)
    throw new Error("JWT_SECRET is not defined");

  return jwt.sign({ id, role }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  });
};

// Create and send OTP for email verification
const createAndSendOtp = async (email: string): Promise<void> => {
  await OTP.deleteMany({ email });

  const code = generateOtp();
  const hashedOtp = await bcrypt.hash(code, 10);
  await OTP.create({
    email,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + OTP_TTL_MS)
  });

  await sendEmail({
    to: email,
    subject: "Verify your MedWasla account",
    html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
  });
};


// Register a new user and create associated patient or specialist record
export const registerUser = async (data: RegisterData): Promise<void> => {
  const { name, email, password, phone, address, role = "patient", ...specialistFields } = data;

  const existing = await User.findOne({ email });
  if (existing)
    throw new AppError("Email already exists", 400);

  const user = await User.create({ name, email, password, phone, address, role });

  try {
    if (role === "patient") {
      await Patient.create({ userId: user._id });
    }
    else if (role === "specialist") {
      const { specialistType, licenseNumber, homeVisit, specialization, serviceAreas, clinicAddress, bio, consultationFee } = specialistFields;

      await MedicalSpecialist.create({
        userId: user._id,
        specialistType: specialistType,
        licenseNumber,
        homeVisit,
        specialization,
        serviceAreas,
        clinicAddress,
        bio,
        consultationFee,
      });
    }
  } catch (err) {
    await User.deleteOne({ _id: user._id });
    throw err;
  }

  await createAndSendOtp(email);
};

export const verifyUserOtp = async (email: string, otp: string): Promise<AuthResult> => {
  const record = await OTP.findOne({ email, used: false });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const isValid = await bcrypt.compare(otp, record.otp);
  if (!isValid) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  record.used = true;
  await record.save();

  const user = await User.findOne({ email });
  if (!user)
    throw new AppError("User not found", 404);

  user.isVerified = true;
  await user.save();

  return {
    token: signToken(user.id, user.role),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

export const resendUserOtp = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });

  if (!user)
    throw new AppError("No account found with this email", 404);

  if (user.isVerified)
    throw new AppError("Account is already verified", 400);

  await createAndSendOtp(email);
};

// Login / Authenticate user and return JWT token
export const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  const user = await User.findOne({ email }).select("+password");
  if (!user)
    throw new AppError("Invalid email or password", 401);

  if (!user.isVerified)
    throw new AppError(
      "Please verify your email first",
      403
    );

  const isMatch = await user.comparePassword!(password);
  if (!isMatch)
    throw new AppError("Invalid email or password", 401);

  return {
    token: signToken(user.id, user.role),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

export const getUserById = async (id: string): Promise<IUser> => {
  const user = await User.findById(id);
  if (!user)
    throw new AppError("User not found", 404);

  return user;
};
