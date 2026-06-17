import mongoose from "mongoose";
import MedicalSpecialist, {
  type IAvailableSlot,
} from "../../models/medicalSpecialist.model.js";
import "../../models/user.model.js";

const toUserObjectId = (userId: string) => new mongoose.Types.ObjectId(userId);

export interface GetAllSpecialistsQuery {
  specialistType?: string;
  specialization?: string;
  verificationStatus?: string;
  homeVisit?: string;
  serviceArea?: string;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdateProfileBody {
  bio?: string;
  clinicAddress?: string;
  areasOfExpertise?: string[];
  avgWaitMinutes?: number;
  serviceAreas?: string[];
  homeVisit?: boolean;
}

export interface UpdateAvailabilityBody {
  availableSlots: IAvailableSlot[];
}

export interface UpdateFeesBody {
  consultationFee: number;
}

export const getAllSpecialistsService = async (
  query: GetAllSpecialistsQuery,
) => {
  const {
    specialistType,
    specialization,
    verificationStatus,
    homeVisit,
    serviceArea,
    search,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter: Record<string, unknown> = {};

  if (specialistType) filter.specialistType = specialistType;
  if (specialization) filter.specialization = specialization;
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (homeVisit !== undefined) filter.homeVisit = homeVisit === "true";
  if (serviceArea) filter.serviceAreas = { $in: [serviceArea] };

  if (search) {
    filter.$or = [
      { bio: { $regex: search, $options: "i" } },
      { clinicAddress: { $regex: search, $options: "i" } },
      { areasOfExpertise: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  const sort: Record<string, 1 | -1> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [specialists, total] = await Promise.all([
    MedicalSpecialist.find(filter)
      .populate("userId", "name email phone address photoUrl governorate")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    MedicalSpecialist.countDocuments(filter),
  ]);

  return {
    specialists,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getSpecialistByIdService = async (id: string) => {
  const specialist = await MedicalSpecialist.findById(id)
    .populate("userId", "name email phone address photoUrl governorate")
    .lean();

  if (!specialist) throw new Error("Specialist not found");
  return specialist;
};

export const getSpecialistsBySpecializationService = async (name: string) => {
  const specialists = await MedicalSpecialist.find({
    specialization: { $regex: name, $options: "i" },
    verificationStatus: "approved",
  })
    .populate("userId", "name email phone address photoUrl governorate")
    .lean();

  return specialists;
};

export const updateAvailabilityService = async (
  userId: string,
  body: UpdateAvailabilityBody,
) => {
  const { availableSlots } = body;

  if (!Array.isArray(availableSlots)) {
    throw new Error("availableSlots must be an array");
  }

  for (const slot of availableSlots) {
    if (!slot.day || !slot.startTime || !slot.endTime) {
      throw new Error("Each slot must have day, startTime, and endTime");
    }
  }

  const specialist = await MedicalSpecialist.findOneAndUpdate(
    { userId },
    { $set: { availableSlots } },
    { returnDocument: "after", runValidators: true },
  );

  if (!specialist) throw new Error("Specialist profile not found");
  return specialist;
};

export const updateFeesService = async (
  userId: string,
  body: UpdateFeesBody,
) => {
  const { consultationFee } = body;

  if (typeof consultationFee !== "number" || consultationFee < 0) {
    throw new Error("consultationFee must be a non-negative number");
  }

  const specialist = await MedicalSpecialist.findOneAndUpdate(
    { userId },
    { $set: { consultationFee } },
    { returnDocument: "after" },
  );

  if (!specialist) throw new Error("Specialist profile not found");
  return specialist;
};

export class SpecialistsService {
  static async getProfile(userId: string) {
    if (!userId) return null;

    return MedicalSpecialist.findOne({ userId: toUserObjectId(userId) }).populate(
      "userId",
      "name email phone address photoUrl governorate",
    );
  }

  static async updateProfile(userId: string, updateData: Record<string, unknown>) {
    const updated = await MedicalSpecialist.findOneAndUpdate(
      { userId: toUserObjectId(userId) },
      {
        ...updateData,
        verificationStatus: "pending",
      },
      { returnDocument: "after", runValidators: true },
    ).populate("userId", "name email phone address photoUrl governorate");

    if (!updated) throw new Error("Specialist profile not found");
    return updated;
  }

  static async addCertificate(userId: string, certificate: Record<string, unknown>) {
    if (!userId) throw new Error("User ID is required");

    const updated = await MedicalSpecialist.findOneAndUpdate(
      { userId: toUserObjectId(userId) },
      {
        $push: { certifications: certificate },
        $set: { verificationStatus: "pending" },
      },
      { returnDocument: "after", runValidators: true },
    ).populate("userId", "name email phone address photoUrl governorate");

    if (!updated) throw new Error("Specialist profile not found");
    return updated;
  }
}
