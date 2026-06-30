import Patient from "../../models/patient.model.js";
import type { IUser } from "../../models/user.model.js";
import AppError from "../../utils/AppError.js";

import { User } from "../../models/user.model.js";
import bcrypt from "bcrypt";
import { governorate } from "../../models/user.model.js";

import cloudinary from "../../config/cloudinary.js";


export interface PatientProfile {
  patientId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    photoUrl?: string;
    dob?: string;
    governorate?: string;
  };
  medicalHistory: Array<{
    condition: string;
    diagnosed: Date;
    treatedBy: string;
    notes?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const toPatientUserResponse = (user: IUser): PatientProfile["user"] => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
  photoUrl: user.photoUrl,
  dob: user.dob?.toISOString(),
  governorate: user.governorate,
});

export const getPatientProfileByUserId = async (userId: string): Promise<PatientProfile> => {

  const patient = await Patient.findOne({ userId })
    .populate("userId", "name email phone address role photoUrl dob governorate")
    .exec();

  if (!patient || !patient.userId) {
    throw new AppError("Patient profile not found", 404);
  }

  const user = patient.userId as IUser;

  return {
    patientId: patient._id.toString(),
    user: toPatientUserResponse(user),
    medicalHistory: (patient.medicalHistory ?? []).map((entry) => ({
      condition: entry.condition,
      diagnosed: entry.diagnosed,
      treatedBy: entry.treatedBy.toString(),
      notes: entry.notes,
    })),
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
};


export interface UpdatePatientProfileDto {
  name?: string;
  email?: string;
  phone?: string;
  governorate?: string;
  address?: string;
  photoUrl?: string;
  password?: string;
  currentPassword?: string;
  dob?: Date | string;
}

export const updatePatientProfileByUserId = async (
  _id: string,
  data: UpdatePatientProfileDto,
): Promise<PatientProfile["user"]> => {

  const patient = await User.findOne({ _id }).select("+password");
  if (!patient) {
    throw new AppError("Patient profile not found", 404);
  }

  if (data.name !== undefined) patient.name = data.name;
  if (data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new AppError("Invalid email format", 400);
    }
    patient.email = data.email;
  }
  if (data.phone !== undefined) {
    const cleanedPhone = data.phone.trim().replace(/[\s-]/g, "");
    const egyptPhoneRegex = /^0?1[0125][0-9]{8}$/;

    if (!egyptPhoneRegex.test(cleanedPhone)) {
      throw new AppError("Invalid Egyptian phone number", 400);
    }

    const normalizedPhone = cleanedPhone.startsWith("0")
      ? cleanedPhone
      : `0${cleanedPhone}`;

    patient.phone = normalizedPhone;
  }
  if (data.governorate !== undefined) {
    if (!governorate.includes(data.governorate)) {
      throw new AppError("Invalid governorate", 400);
    }
    patient.governorate = data.governorate;
  }
  if (data.address !== undefined) patient.address = data.address;
  if (data.dob !== undefined) patient.dob = new Date(data.dob);

  if (data.password) {
    if (data.currentPassword) {
      const isMatch = await bcrypt.compare(data.currentPassword, patient.password);
      if (!isMatch) {
        throw new AppError("Current password is incorrect", 400);
      }
    }
    patient.password = data.password;
  }

  await patient.save();

  return toPatientUserResponse(patient);
};


export const updatePatientPhotoByUserId = async (
  userId: string,
  fileBuffer: Buffer,
  mimeType: string,
): Promise<IUser> => {
  let photoUrl: string;

  const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (hasCloudinary) {
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "medwasla/profiles",
            resource_type: "image",
            format: mimeType.split("/")[1],
            transformation: [{ width: 400, height: 400, crop: "fill" }],
          },
          (err, result) => {
            if (err || !result) {
              return reject(err ?? new Error("Cloudinary upload failed"));
            }
            resolve(result);
          },
        )
        .end(fileBuffer);
    });
    photoUrl = uploadResult.secure_url;
  } else {
    const base64 = fileBuffer.toString("base64");
    photoUrl = `data:${mimeType};base64,${base64}`;
  }

  const patient = await User.findByIdAndUpdate(userId, { photoUrl }, { new: true }, );

  if (!patient) {
    throw new AppError("User not found", 404);
  }

  return patient;
};

function getCloudinaryPublicId(photoUrl: string): string | null {
  const uploadMarker = "/upload/";
  const markerIndex = photoUrl.indexOf(uploadMarker);
  if (markerIndex === -1) return null;

  const pathAfterUpload = photoUrl.slice(markerIndex + uploadMarker.length);
  const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
  const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, "");
  return withoutExtension || null;
}

export const removePatientPhotoByUserId = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.photoUrl) {
    throw new AppError("No profile photo to remove", 400);
  }

  const existingPhotoUrl = user.photoUrl;
  const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (hasCloudinary && existingPhotoUrl.includes("cloudinary.com")) {
    const publicId = getCloudinaryPublicId(existingPhotoUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch {
        // Continue clearing the stored URL even if Cloudinary cleanup fails.
      }
    }
  }

  const patient = await User.findByIdAndUpdate(
    userId,
    { $unset: { photoUrl: 1 } },
    { new: true },
  );

  if (!patient) {
    throw new AppError("User not found", 404);
  }

  return patient;
};
