import Patient from "../../models/patient.model.js";
import type { IUser } from "../../models/user.model.js";

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
    .populate("userId", "name email phone address role photoUrl")
    .exec();

  if (!patient || !patient.userId) {
    throw new Error("Patient profile not found");
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
    },
    medicalHistory: (patient.medicalHistory ?? []).map((entry) => ({
      condition: entry.condition,
      diagnosed: entry.diagnosed,
      treatedBy: entry.treatedBy.toString(), // ✅ ObjectId → string
      notes: entry.notes,
    })),
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
};