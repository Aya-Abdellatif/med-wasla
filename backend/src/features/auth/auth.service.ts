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

const OTP_TTL_MS = 10 * 60 * 1000; 

const signToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret)
    throw new Error("JWT_SECRET is not defined");

  return jwt.sign({ id, role }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  });
};

const createAndSendOtp = async (email: string): Promise<void> => {
  await OTP.deleteMany({ email });

  const code = generateOtp();
  const hashedOtp = await bcrypt.hash(code, 10);
  await OTP.create({
    email,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  try {
    await sendEmail({
      to: email,
      subject: "Verify your MedWasla account",
      html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
    });
  } catch (emailErr) {
    console.error("Failed to send OTP email:", emailErr);

    throw new AppError(
      "Could not send verification email. Please try again later.",
      503,
    );
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV] OTP for ${email}: ${code}`);
  }
};

const isMongoDuplicateKeyError = (err: unknown): err is { code?: number; keyPattern?: Record<string, unknown> } =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  (err as { code?: number }).code === 11000;

const getDuplicateKeyMessage = (err: { keyPattern?: Record<string, unknown> }): string => {
  const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : undefined;
  if (field === "email") return "This email is already registered";
  if (field === "licenseNumber") return "This license number is already registered";
  return "A record with this information already exists";
};

const toAppError = (err: unknown): AppError => {
  if (err instanceof AppError) return err;

  if (isMongoDuplicateKeyError(err)) {
    return new AppError(getDuplicateKeyMessage(err), 400);
  }

  if (err instanceof Error) {
    if (err.name === "ValidationError" && "errors" in err) {
      const messages = Object.values(
        (err as { errors: Record<string, { message: string }> }).errors,
      ).map((item) => item.message);

      return new AppError(messages.join(". ") || err.message, 400);
    }

    return new AppError(err.message, 400);
  }

  return new AppError("Registration failed. Please check your details.", 400);
};


export const registerUser = async (data: RegisterData): Promise<{ resent: boolean }> => {
  const { name, email, password, phone, governorate, dob, address, role = "patient", ...specialistFields } = data;

  const existing = await User.findOne({ email });
  if (existing) {
    if (!existing.isVerified) {
      await createAndSendOtp(email);
      return { resent: true };
    }
    throw new AppError("This email is already registered", 400);
  }

  if (role === "specialist") {
    const { specialistType, licenseNumber, specialization, serviceAreas } = specialistFields;

    if (!licenseNumber?.trim()) {
      throw new AppError("License number is required", 400);
    }

    if (specialistType === "doctor" && !specialization) {
      throw new AppError("Please select a medical specialty", 400);
    }

    if (specialistType === "nurse" && (!serviceAreas || serviceAreas.length === 0)) {
      throw new AppError("Please enter at least one service area for nurses", 400);
    }

    const existingLicense = await MedicalSpecialist.findOne({
      licenseNumber: licenseNumber.trim(),
    });
    if (existingLicense) {
      throw new AppError("This license number is already registered", 400);
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    governorate,
    dob,
    address,
    role,
  });

  try {
    if (role === "patient") {
      await Patient.create({ userId: user._id });
    }
    else if (role === "specialist") {
      const {
        specialistType,
        licenseNumber,
        homeVisit,
        specialization,
        serviceAreas,
        clinicAddress,
        bio,
        consultationFee,
        certifications,
      } = specialistFields;

      await MedicalSpecialist.create({
        userId: user._id,
        specialistType,
        licenseNumber,
        homeVisit: homeVisit ?? false,
        specialization,
        serviceAreas,
        clinicAddress,
        bio,
        consultationFee,
        certifications: certifications?.map((cert) => ({
          ...cert,
          status: "pending" as const,
        })),
        verificationStatus: "pending",
      });
    };
  } catch (err) {
    await MedicalSpecialist.deleteOne({ userId: user._id });
    await Patient.deleteOne({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    throw toAppError(err);
  }
  await createAndSendOtp(email);
  return { resent: false };
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

const RESEND_COOLDOWN_MS = 60 * 1000; 

export const resendUserOtp = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });

  if (!user)
    throw new AppError("No account found with this email", 404);

  if (user.isVerified)
    throw new AppError("Account is already verified", 400);

  const lastOtp = await OTP.findOne({ email, used: false }).sort({ createdAt: -1 });
  if (lastOtp?.createdAt) {
    const elapsed = Date.now() - lastOtp.createdAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new AppError(`Please wait ${waitSec} seconds before requesting a new code`, 429);
    }
  }

  await createAndSendOtp(email);
};

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

export const forgotPasswordUser = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user)
    throw new AppError("No account found with this email", 404);

  if (!user.isVerified)
    throw new AppError("Please verify your account before resetting your password", 400);

  const lastOtp = await OTP.findOne({ email, used: false }).sort({ createdAt: -1 });
  if (lastOtp?.createdAt) {
    const elapsed = Date.now() - lastOtp.createdAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new AppError(`Please wait ${waitSec} seconds before requesting a new code`, 429);
    }
  }

  await createAndSendOtp(email);
};

export const resetPasswordUser = async (email: string, otp: string, newPassword: string): Promise<void> => {
  const record = await OTP.findOne({ email, used: false });

  if (!record || record.expiresAt < new Date())
    throw new AppError("Invalid or expired OTP", 400);

  const isValid = await bcrypt.compare(otp, record.otp);
  if (!isValid)
    throw new AppError("Invalid or expired OTP", 400);

  record.used = true;
  await record.save();

  const user = await User.findOne({ email }).select("+password");
  if (!user)
    throw new AppError("User not found", 404);

  user.password = newPassword;
  await user.save();
};