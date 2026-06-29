import Patient from "../../models/patient.model.js";
import type { IUser } from "../../models/user.model.js";
import AppError from "../../utils/AppError.js";

import { User } from "../../models/user.model.js";
import bcrypt from "bcrypt";
import { governorate } from "../../models/user.model.js";

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
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      photoUrl: user.photoUrl,
      dob: user.dob?.toISOString(),
      governorate: user.governorate,
    },
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
    password?: string;
    dob?: Date;
}

export const updatePatientProfileByUserId = async (_id: string, data: UpdatePatientProfileDto) => {

    const patient = await User.findOne({ _id });

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
    if (data.dob !== undefined) patient.dob = data.dob;

    if (data.password) {
        patient.password = await bcrypt.hash(data.password, 10);
    }

    await patient.save();

    return patient;
};