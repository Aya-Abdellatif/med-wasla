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
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  const hasEmailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

  if (!hasEmailConfig) {
    if (process.env.NODE_ENV === "production") {
      throw new AppError(
        "Email service is not configured. Please contact support.",
        503,
      );
    }

    console.log(`[DEV] OTP for ${email}: ${code}`);
    return;
  }

  try {
    await sendEmail({
      to: email,
      subject: "Verify your MedWasla account",
      html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
    });
  } catch (emailErr) {
    console.error("Failed to send OTP email:", emailErr);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] OTP for ${email}: ${code}`);
      return;
    }

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


// Register a new user and create associated patient or specialist record
export const registerUser = async (data: RegisterData): Promise<AuthResult> => {
  const { name, email, password, phone, address, role = "patient", ...specialistFields } = data;

  const existing = await User.findOne({ email });
  if (existing)
    throw new AppError("This email is already registered", 400);

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
      licenseNumber: licenseNumber?.trim(),
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
    address,
    role,
    isVerified: true,
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
        verificationStatus: "pending",
        certifications: (certifications ?? []).map((cert) => ({
          title: cert.title,
          issuedBy: cert.issuedBy,
          issuedAt: cert.issuedAt ? new Date(cert.issuedAt) : undefined,
          certificateUrl: cert.certificateUrl,
          status: "pending",
        })),
      });
    }

    return {
      token: signToken(user.id, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (err) {
    await MedicalSpecialist.deleteOne({ userId: user._id });
    await Patient.deleteOne({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    throw toAppError(err);
  }
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

const MAX_PHOTO_URL_LENGTH = 3 * 1024 * 1024;

export const updateUserPhoto = async (
  userId: string,
  photoUrl: string,
): Promise<IUser> => {
  if (!photoUrl || typeof photoUrl !== "string") {
    throw new AppError("Photo URL is required", 400);
  }

  const isDataUrl = photoUrl.startsWith("data:image/");
  const isHttpUrl = /^https?:\/\//i.test(photoUrl);

  if (!isDataUrl && !isHttpUrl) {
    throw new AppError("Photo must be an image file or a valid URL", 400);
  }

  if (photoUrl.length > MAX_PHOTO_URL_LENGTH) {
    throw new AppError("Image is too large. Please use a smaller photo.", 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { photoUrl },
    { new: true, runValidators: true },
  );

  if (!user) throw new AppError("User not found", 404);
  return user;
};
